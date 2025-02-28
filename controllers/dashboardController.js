const { Member } = require("../models/Member")
const { State } = require("../models/State")
const { MembershipLevel } = require("../models/MembershipLevel")
const { Event } = require("../models/Event")
const { Op } = require("sequelize")
const sequelize = require("sequelize")

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const totalMembers = await Member.count()
    const newMembersThisMonth = await Member.count({
      where: {
        createdAt: {
          [Op.gte]: firstDayOfMonth,
        },
      },
    })
    const newMembersLastMonth = await Member.count({
      where: {
        createdAt: {
          [Op.between]: [firstDayOfPrevMonth, lastDayOfPrevMonth],
        },
      },
    })

    let monthlyGrowth = 0
    if (newMembersLastMonth > 0) {
      monthlyGrowth = Math.round(((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100)
    } else if (newMembersThisMonth > 0) {
      monthlyGrowth = 100
    }

    const totalStates = await State.count()
    const membershipLevels = await MembershipLevel.count()

    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
    const activeMembers = await Member.count({
      where: {
        lastLoginAt: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
    })

    res.json({
      totalMembers,
      newMembersThisMonth,
      totalStates,
      membershipLevels,
      activeMembers,
      monthlyGrowth,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ message: "Error fetching dashboard statistics", error: error.message })
  }
}

exports.getMemberGrowth = async (req, res) => {
  try {
    const now = new Date()
    const result = []

    for (let i = 6; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const monthName = month.toLocaleString("default", { month: "short" })

      const membersCount = await Member.count({
        where: {
          createdAt: {
            [Op.between]: [month, monthEnd],
          },
        },
      })

      result.push({
        month: monthName,
        members: membersCount,
      })
    }

    res.json(result)
  } catch (error) {
    console.error("Error fetching member growth data:", error)
    res.status(500).json({ message: "Error fetching member growth data", error: error.message })
  }
}

exports.getStateDistribution = async (req, res) => {
  try {
    const stateDistribution = await Member.findAll({
      attributes: [
        [sequelize.col("State.name"), "state"],
        [sequelize.fn("COUNT", sequelize.col("Member.id")), "members"],
      ],
      include: [
        {
          model: State,
          attributes: [],
        },
      ],
      group: ["State.id", "State.name"],
      raw: true,
    })

    stateDistribution.sort((a, b) => b.members - a.members)
    const topStates = stateDistribution.slice(0, 6)

    res.json(topStates)
  } catch (error) {
    console.error("Error fetching state distribution data:", error)
    res.status(500).json({ message: "Error fetching state distribution data", error: error.message })
  }
}

exports.getRecentActivities = async (req, res) => {
  try {
    const newMembers = await Member.findAll({
      attributes: ["id", "firstName", "lastName", "createdAt"],
      include: [
        {
          model: State,
          attributes: ["name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 3,
      raw: true,
      nest: true,
    })

    const recentEvents = await Event.findAll({
      attributes: ["id", "title", "description", "createdAt"],
      order: [["createdAt", "DESC"]],
      limit: 2,
      raw: true,
    })

    const membershipChanges = await MembershipLevel.findAll({
      attributes: ["id", "name", "updatedAt"],
      where: {
        updatedAt: {
          [Op.ne]: sequelize.col("createdAt"),
        },
      },
      order: [["updatedAt", "DESC"]],
      limit: 2,
      raw: true,
    })

    const activities = [
      ...newMembers.map((member) => ({
        id: `member-${member.id}`,
        type: "member",
        title: "New member registered",
        description: `${member.firstName} ${member.lastName} joined from ${member.State.name}`,
        timestamp: member.createdAt,
        timeAgo: getTimeAgo(member.createdAt),
      })),
      ...recentEvents.map((event) => ({
        id: `event-${event.id}`,
        type: "event",
        title: event.title,
        description: event.description,
        timestamp: event.createdAt,
        timeAgo: getTimeAgo(event.createdAt),
      })),
      ...membershipChanges.map((level) => ({
        id: `membership-${level.id}`,
        type: "membership",
        title: "Membership level updated",
        description: `${level.name} tier updated in the system`,
        timestamp: level.updatedAt,
        timeAgo: getTimeAgo(level.updatedAt),
      })),
    ]

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    res.json(activities.slice(0, 5))
  } catch (error) {
    console.error("Error fetching recent activities:", error)
    res.status(500).json({ message: "Error fetching recent activities", error: error.message })
  }
}

function getTimeAgo(timestamp) {
  const now = new Date()
  const date = new Date(timestamp)
  const seconds = Math.floor((now - date) / 1000)

  let interval = Math.floor(seconds / 31536000)
  if (interval >= 1) {
    return interval === 1 ? "1 year ago" : `${interval} years ago`
  }

  interval = Math.floor(seconds / 2592000)
  if (interval >= 1) {
    return interval === 1 ? "1 month ago" : `${interval} months ago`
  }

  interval = Math.floor(seconds / 86400)
  if (interval >= 1) {
    return interval === 1 ? "1 day ago" : `${interval} days ago`
  }

  interval = Math.floor(seconds / 3600)
  if (interval >= 1) {
    return interval === 1 ? "1 hour ago" : `${interval} hours ago`
  }

  interval = Math.floor(seconds / 60)
  if (interval >= 1) {
    return interval === 1 ? "1 minute ago" : `${interval} minutes ago`
  }

  return seconds < 10 ? "just now" : `${Math.floor(seconds)} seconds ago`
}

