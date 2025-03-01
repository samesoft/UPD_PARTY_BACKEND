const { Member } = require("../models/Member");
const { State } = require("../models/State");
const { MembershipLevel } = require("../models/MembershipLevel");
const { Event } = require("../models/Event");
const { Op } = require("sequelize");
const { sequelize } = require("../config/dbConfig");

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfPrevMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const totalMembers = await Member.count();
    const newMembersThisMonth = await Member.count({
      where: {
        created_at: {
          [Op.gte]: firstDayOfMonth,
        },
      },
    });
    const newMembersLastMonth = await Member.count({
      where: {
        created_at: {
          [Op.between]: [firstDayOfPrevMonth, lastDayOfPrevMonth],
        },
      },
    });

    let monthlyGrowth = 0;
    if (newMembersLastMonth > 0) {
      monthlyGrowth = Math.round(
        ((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) *
          100
      );
    } else if (newMembersThisMonth > 0) {
      monthlyGrowth = 100;
    }

    const totalStates = await State.count();
    const membershipLevels = await MembershipLevel.count();

    // const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    // const activeMembers = await Member.count({
    //   where: {
    //     lastLoginAt: {
    //       [Op.gte]: thirtyDaysAgo,
    //     },
    //   },
    // });

    res.json({
      totalMembers,
      newMembersThisMonth,
      totalStates,
      membershipLevels,
      // activeMembers,
      monthlyGrowth,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};

exports.getMembersByMonth = async (req, res) => {
  try {
    const now = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthName = month.toLocaleString("default", { month: "short" });

      const membersCount = await Member.count({
        where: {
          created_at: {
            [Op.between]: [month, monthEnd],
          },
        },
      });

      result.push({
        month: monthName,
        members: membersCount,
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching member growth data:", error);
    res.status(500).json({
      message: "Error fetching member growth data",
      error: error.message,
    });
  }
};

exports.getMembersByState = async (req, res) => {
  try {
    const stateDistribution = await sequelize.query(
      `SELECT s.state as state, COUNT(m.member_id) as members
      FROM members m
      JOIN state s ON m.state_id = s.stateid
      GROUP BY s.stateid, s.state
      ORDER BY members DESC`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    stateDistribution.sort((a, b) => b.members - a.members);

    res.json(stateDistribution);
  } catch (error) {
    console.error("Error fetching state distribution data:", error);
    res.status(500).json({
      message: "Error fetching state distribution data",
      error: error.message,
    });
  }
};

exports.getMemberGrowth = async (req, res) => {
  try {
    const now = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthName = month.toLocaleString("default", { month: "short" });

      const membersCount = await Member.count({
        where: {
          createdAt: {
            [Op.between]: [month, monthEnd],
          },
        },
      });

      result.push({
        month: monthName,
        members: membersCount,
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching member growth data:", error);
    res.status(500).json({
      message: "Error fetching member growth data",
      error: error.message,
    });
  }
};

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
    });

    stateDistribution.sort((a, b) => b.members - a.members);
    const topStates = stateDistribution.slice(0, 6);

    res.json(topStates);
  } catch (error) {
    console.error("Error fetching state distribution data:", error);
    res.status(500).json({
      message: "Error fetching state distribution data",
      error: error.message,
    });
  }
};

exports.getRecentActivities = async (req, res) => {
  try {
    const newMembers = await Member.findAll({
      attributes: [
        "member_id",
        "first_name",
        "last_name",
        "email",
        "created_at",
      ],

      order: [["created_at", "DESC"]],
      limit: 3,
      raw: true,
      nest: true,
    });

    const recentEvents = await Event.findAll({
      attributes: [
        "id",
        "title",
        "description",
        "Status",
        "end_time",
        "start_time",
        "location",
      ],
      order: [["id", "DESC"]],
      limit: 3,
      raw: true,
    });

    const activities = [
      ...newMembers.map((member) => ({
        id: `member-${member.member_id}`,
        type: "member",
        title: "New member registered",
        description: `${member.first_name} ${member.last_name} joined`,
        timestamp: member.created_at,
        timeAgo: getTimeAgo(member.created_at),
      })),

      ...recentEvents.map((event) => ({
        id: `event-${event.id}`,
        type: "event",
        title: "New event created",
        description: `${event.title} ${event.description} will be in ${event.location}`,

        timestamp: event.end_time,
        timeAgo: getTimeAgo(event.end_time),
      })),
    ];

    activities.sort((a, b) => (a.type === "member" ? -1 : 1));

    res.json(activities);
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({
      message: "Error fetching recent activities",
      error: error.message,
    });
  }
};

function getTimeAgo(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? "1 year ago" : `${interval} years ago`;
  }

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? "1 month ago" : `${interval} months ago`;
  }

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? "1 day ago" : `${interval} days ago`;
  }

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
  }

  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
  }

  return seconds < 10 ? "just now" : `${Math.floor(seconds)} seconds ago`;
}
