const { sequelize } = require("../config/dbConfig");
const axios = require("axios");

// exports.createEvent = async (req, res) => {
//     console.log(req.body);
//     try {
//         const { title, district_id, description, location, start_time, end_time, created_by_member_id } = req.body;
//         // if (!title || district_id || !description || !location || !start_time || !end_time || !created_by_member_id) {
//         //     return res.status(400).json({ error: 'Missing required fields' });
//         // }
//         const result = await sequelize.query(
//             `SELECT event_create(
//                 :title::varchar,
//                 :district_id::integer,
//                 :description::text,
//                 :location::varchar,
//                 :start_time::timestamp,
//                 :end_time::timestamp,
//                 :created_by_member_id::integer
//               )`,
//             {
//                 replacements: {
//                     title,
//                     district_id,           // This should be a valid integer
//                     description,
//                     location,
//                     start_time,            // Should be in a valid timestamp format, e.g., "2025-02-14T16:23:00"
//                     end_time,              // Should be in a valid timestamp format
//                     created_by_member_id   // Valid integer
//                 },
//                 type: sequelize.QueryTypes.SELECT,
//             }
//         );
//         const newEventId = result[0].create_event;
//         res.status(201).json({ message: 'Event created successfully', event_id: newEventId });
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to create event', details: error.details });
//     }
// };

const admin = require("firebase-admin");


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../firebase-service-account.json')),
  });
}

exports.createEvent = async (req, res) => {
  console.log(req.body);
  try {
    const {
      title,
      district_id,
      description,
      location,
      start_time,
      end_time,
      created_by_member_id,
    } = req.body;

    // Create the event
    const result = await sequelize.query(
      `SELECT event_create(
                :title::varchar, 
                :district_id::integer, 
                :description::text, 
                :location::varchar, 
                :start_time::timestamp, 
                :end_time::timestamp, 
                :created_by_member_id::integer
              ) AS event_id`,
      {
        replacements: {
          title,
          district_id,
          description,
          location,
          start_time,
          end_time,
          created_by_member_id,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const newEventId = result[0].event_id;

    // Fetch event details including state ID
    const eventDetails = await sequelize.query(
      `SELECT e.*, d.stateid, d.district
             FROM events e
             INNER JOIN district d ON e.ditrict_id = d.district_id
             WHERE e.id = :event_id`,
      {
        replacements: { event_id: newEventId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!eventDetails.length) {
      return res.status(404).json({ error: "Event not found after creation" });
    }

    const event = eventDetails[0];

    // Fetch members from the same state
    const members = await sequelize.query(
      `SELECT * FROM members WHERE state_id = :state_id AND role_id != 1`,
      {
        replacements: { state_id: event.stateid },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    console.log("event: ", event);
    console.log("members: ", members);

    // Send success response immediately before sending notifications
    res.status(201).json({
      message: "Event created successfully",
      event_id: newEventId,
    });


    
    //  await Promise.all(
    //   members.map(member =>
    //     axios.post("https://mgs-otp.samesoft.app/api/owners/sms", {
    //       phoneNumber: member.mobile,
    //       message: `new Event "${event.title}" has been created in ${event.district}`,
    //     })
    //   )
    // );



    // Send notification to each member with device_token
    await Promise.all(
      members
        .filter(member => member.device_token && member.device_token.trim() !== "")
        .map(async (member) => {
          const message = {
            token: member.device_token,
            notification: {
              title: "Hiigsi & Horumar",
              body: `New Event "${event.title}" has been created in ${event.district}`,
            },
            data: {
              memberId: String(member.member_id),
              state_id: String(event.stateid),
              district: event.district,
            },
          };
    
          try {
            await admin.messaging().send(message);
          } catch (error) {
            console.warn(
              `Failed to send notification to member ${member.member_id}:`,
              error.message
            );
            // Optionally: remove or mark the invalid device_token in DB
          }
        })
    );
        

    // Send notifications in the background (does not block the response)
    // axios
    //   .post(
    //     "https://sendneweventcreationnotification-tknl5zbesa-uc.a.run.app",
    //     { members, event }
    //   )
    //   .then((firebaseResponse) => {
    //     console.log("Firebase response:", firebaseResponse.data);
    //   })
    //   .catch((error) => {
    //     console.error("Failed to send notifications:", error.message);
    //   });
  } catch (error) {
    console.error("Error creating event:", error);
    res
      .status(500)
      .json({ error: "Failed to create event", details: error.message });
  }
};


// exports.createEventnotification = async (req, res) => {
//   // console.log(req.body);
//   try {
//     // const {
//     //   title,
//     //   district_id,
//     //   description,
//     //   location,
//     //   start_time,
//     //   end_time,
//     //   created_by_member_id,
//     // } = req.body;

//     // // Create the event
//     // const result = await sequelize.query(
//     //   `SELECT event_create(
//     //             :title::varchar, 
//     //             :district_id::integer, 
//     //             :description::text, 
//     //             :location::varchar, 
//     //             :start_time::timestamp, 
//     //             :end_time::timestamp, 
//     //             :created_by_member_id::integer
//     //           ) AS event_id`,
//     //   {
//     //     replacements: {
//     //       title,
//     //       district_id,
//     //       description,
//     //       location,
//     //       start_time,
//     //       end_time,
//     //       created_by_member_id,
//     //     },
//     //     type: sequelize.QueryTypes.SELECT,
//     //   }
//     // );

//     // const newEventId = result[0].event_id;

//     // Fetch event details including state ID
//     const eventDetails = await sequelize.query(
//       `SELECT e.*, d.stateid, d.district
//              FROM events e
//              INNER JOIN district d ON e.ditrict_id = d.district_id
//              WHERE e.id = :event_id`,
//       {
//         // replacements: { event_id: newEventId },
//         replacements: { event_id: 184 },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     if (!eventDetails.length) {
//       return res.status(404).json({ error: "Event not found after creation" });
//     }

//     const event = eventDetails[0];

//     // Fetch members from the same state
//     const members = await sequelize.query(
//       `SELECT * FROM members WHERE state_id = :state_id AND role_id != 1`,
//       {
//         replacements: { state_id: event.stateid },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     // console.log("event: ", event);
//     // console.log("members: ", members);


//         await axios.post("https://mgs-otp.samesoft.app/api/owners/sms", {
//       phoneNumber: members.mobile,
//       message: `new Event "${event.title}" has been created in ${event.district}`,
//     });

//     // // Send success response immediately before sending notifications
//     // res.status(201).json({
//     //   message: "Event created successfully",
//     //   event_id: newEventId,
//     // });

//     // // Send notifications in the background (does not block the response)
//     // axios
//     //   .post(
//     //     "https://sendneweventcreationnotification-tknl5zbesa-uc.a.run.app",
//     //     { members, event }
//     //   )
//     //   .then((firebaseResponse) => {
//     //     console.log("Firebase response:", firebaseResponse.data);
//     //   })
//     //   .catch((error) => {
//     //     console.error("Failed to send notifications:", error.message);
//     //   });
//   } catch (error) {
//     console.error("Error creating event:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to create event", details: error.message });
//   }
// };


exports.getEventsByState = async (req, res) => {
  try {
    const { state_id } = req.params;

    // Join events with district to also fetch the district_name as "district"
    const events = await sequelize.query(
      `
        SELECT e.*, d.district
        FROM events e
        INNER JOIN district d 
          ON e.ditrict_id = d.district_id
        WHERE e."Status" = 'Active' AND d.stateid = :state_id
        ORDER BY e.ditrict_id;
        `,
      {
        replacements: { state_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json({ data: events });
  } catch (error) {
    console.error("Error fetching events by state:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

exports.getUnregisteredMemberEventsByState = async (req, res) => {
    try {
        const { state_id } = req.params;
        const { member_id } = req.query;
        console.log(req.params, req.query);

    const events = await sequelize.query(
      `
        SELECT e.*, d.district
        FROM events e
        INNER JOIN district d ON e.ditrict_id = d.district_id
        WHERE e."Status" = 'Active'
        AND d.stateid = :state_id 
        AND e.end_time > NOW()
        AND e.id NOT IN (
            SELECT event_id FROM eventregistrations WHERE member_id = :member_id
            )
        ORDER BY e.end_time DESC;

        `,
      {
        replacements: { state_id, member_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json({ data: events });
  } catch (error) {
    console.error("Error fetching events by state:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await sequelize.query("SELECT * FROM events_get_all()", {
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({ data: events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

exports.getAllActiveEvents = async (req, res) => {
    try {
        const events = await sequelize.query(
            `SELECT 
                e.*, 
                d.stateid, 
                s.state AS state
            FROM events e
            JOIN district d ON e.ditrict_id = d.district_id
            JOIN state s ON d.stateid = s.stateid
            WHERE e."Status" = :status;`,
            {
                replacements: { status: 'Active' },
                type: sequelize.QueryTypes.SELECT, // Ensure `Sequelize` is correctly referenced
            }
        );
        

    res.status(200).json({ data: events });
  } catch (error) {
    console.error("Error fetching active events:", error);
    res.status(500).json({ error: "Failed to fetch active events" });
  }
};

exports.getEventsByDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { member_id } = req.query;

    const events = await sequelize.query(
      "SELECT * FROM events_get_upcoming_by_district(:district_id, :member_id)",
      {
        replacements: { district_id: id, member_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events by district:", error);
    res.status(500).json({ error: "Failed to fetch events by district" });
  }
};

exports.registerToEvent = async (req, res) => {
  try {
    const { member_id, event_id, status } = req.body;

    if (!member_id || !event_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await sequelize.query(
      "SELECT event_register_to(:member_id, :event_id, :status)",
      {
        replacements: { member_id, event_id, status },
        type: sequelize.QueryTypes.SELECT, // Stored functions using VOID don't return anything
      }
    );

    res.status(201).json({ message: "Registered to event successfully" });
  } catch (error) {
    console.error("Error registering to event:", error);
    res.status(500).json({ error: "Failed to register to event" });
  }
};
exports.getRegisteredEvents = async (req, res) => {
  try {
    const { member_id } = req.query;

    const events = await sequelize.query(
      "SELECT * FROM events_get_registered_by_member(:member_id)",
      {
        replacements: { member_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching registered events:", error);
    res.status(500).json({ error: "Failed to fetch registered events" });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sequelize.query(
      `SELECT event_delete(:p_event_id::integer)`,
      {
        replacements: { p_event_id: id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const deleteStatus = result[0].event_delete;
    res
      .status(200)
      .json({ message: "Event deleted successfully", status: deleteStatus });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
};

exports.updateEventStatus = async (req, res) => {
  const { eventId, status } = req.body;
  console.log("body: ", req.body);

  try {
    await sequelize.query(
      'UPDATE events SET "Status" = :status WHERE id = :eventId',
      {
        replacements: { status, eventId },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    res.status(200).json({ message: "Event status updated successfully" });
  } catch (error) {
    console.error("Error updating event status:", error);
    res.status(500).json({
      error: "Failed to update event status",
      details: error.details || error.message,
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const {
      id,
      title,
      district_id,
      description,
      location,
      start_time,
      end_time,
      created_by_member_id,
    } = req.body;

    const result = await sequelize.query(
      `SELECT event_update(
          :p_event_id::integer,
          :p_title::varchar, 
          :p_district_id::integer, 
          :p_description::text, 
          :p_location::varchar, 
          :p_start_time::timestamp, 
          :p_end_time::timestamp, 
          :p_created_by_member_id::integer
      )`,
      {
        replacements: {
          p_event_id: id,
          p_title: title,
          p_district_id: district_id,
          p_description: description,
          p_location: location,
          p_start_time: start_time, // e.g., "2025-02-14T16:23:00"
          p_end_time: end_time, // e.g., "2025-02-14T16:24:00"
          p_created_by_member_id: created_by_member_id,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const updatedEventId = result[0].event_update;
    res.status(200).json({
      message: "Event updated successfully",
      event_id: updatedEventId,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
};

exports.getMemberEvents = async (req, res) => {
  try {
    console.log(req.params);
    // Retrieve the member_id from the route parameters (or use req.query if needed)
    const { member_id } = req.params;

    // Execute a raw SQL query with an inner join
    const events = await sequelize.query(
      `SELECT e.*
         FROM eventregistrations er
         INNER JOIN events e ON er.event_id = e.id
         WHERE er.member_id = :member_id`,
      {
        replacements: { member_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    console.log(events);
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching member events:", error);
    res.status(500).json({ error: "Failed to fetch events for the member" });
  }
};

exports.verifyTicket = async (req, res) => {
  const { qrcode } = req.query;
  console.log("qrcode", qrcode);

  if (!qrcode || !qrcode.includes("/")) {
    return res.status(400).json({ error: "Invalid QR code format" });
  }

  try {
    const result = await sequelize.query(
      "SELECT * FROM event_member_get_details(:qr_code)",
      {
        replacements: { qr_code: qrcode },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "No event or member found with the provided QR code" });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error verifying ticket:", error);
    res.status(500).json({ error: "Failed to verify ticket" });
  }
};
