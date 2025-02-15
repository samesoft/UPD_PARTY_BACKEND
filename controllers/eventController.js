const { sequelize } = require('../config/dbConfig');

exports.createEvent = async (req, res) => {
    console.log(req.body);
    try {
        const { title, district_id, description, location, start_time, end_time, created_by_member_id } = req.body;
        // if (!title || district_id || !description || !location || !start_time || !end_time || !created_by_member_id) {
        //     return res.status(400).json({ error: 'Missing required fields' });
        // }
        const result = await sequelize.query(
            `SELECT event_create(
                :title::varchar, 
                :district_id::integer, 
                :description::text, 
                :location::varchar, 
                :start_time::timestamp, 
                :end_time::timestamp, 
                :created_by_member_id::integer
              )`,
            {
                replacements: {
                    title,
                    district_id,           // This should be a valid integer
                    description,
                    location,
                    start_time,            // Should be in a valid timestamp format, e.g., "2025-02-14T16:23:00"
                    end_time,              // Should be in a valid timestamp format
                    created_by_member_id   // Valid integer
                },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        const newEventId = result[0].create_event;
        res.status(201).json({ message: 'Event created successfully', event_id: newEventId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create event' });
    }
};

exports.getAllEvents = async (req, res) => {
    try {
        const events = await sequelize.query('SELECT * FROM events_get_all()', {
            type: sequelize.QueryTypes.SELECT,
        });

        res.status(200).json({ data: events });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

exports.getEventsByDistrict = async (req, res) => {
    try {
        const { id } = req.params;
        const { member_id } = req.query;

        const events = await sequelize.query(
            'SELECT * FROM events_get_upcoming_by_district(:district_id, :member_id)',
            {
                replacements: { district_id: id, member_id },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events by district:', error);
        res.status(500).json({ error: 'Failed to fetch events by district' });
    }
};

exports.registerToEvent = async (req, res) => {
    try {
        const { member_id, event_id, status } = req.body;

        if (!member_id || !event_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await sequelize.query(
            'SELECT event_register_to(:member_id, :event_id, :status)',
            {
                replacements: { member_id, event_id, status },
                type: sequelize.QueryTypes.SELECT, // Stored functions using VOID don't return anything
            }
        );

        res.status(201).json({ message: 'Registered to event successfully' });
    } catch (error) {
        console.error('Error registering to event:', error);
        res.status(500).json({ error: 'Failed to register to event' });
    }
};
exports.getRegisteredEvents = async (req, res) => {
    try {
        const { member_id } = req.query;

        const events = await sequelize.query(
            'SELECT * FROM events_get_registered_by_member(:member_id)',
            {
                replacements: { member_id },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching registered events:', error);
        res.status(500).json({ error: 'Failed to fetch registered events' });
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
        res.status(200).json({ message: 'Event deleted successfully', status: deleteStatus });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
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
            created_by_member_id
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
                    p_end_time: end_time,   // e.g., "2025-02-14T16:24:00"
                    p_created_by_member_id: created_by_member_id
                },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        const updatedEventId = result[0].event_update;
        res.status(200).json({ message: 'Event updated successfully', event_id: updatedEventId });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
};

exports.getMemberEvents = async (req, res) => {
    console.log('>>>>>>ENTERED >>>>>>>>>>');
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
        console.error('Error fetching member events:', error);
        res.status(500).json({ error: 'Failed to fetch events for the member' });
    }
};
