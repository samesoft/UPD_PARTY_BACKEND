const { sequelize } = require('../config/dbConfig');

exports.createEvent = async (req, res) => {
    try {
      const { title, description, location, start_time, end_time, created_by_member_id } = req.body;
  
      if (!title || !description || !location || !start_time || !end_time || !created_by_member_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      const result = await sequelize.query(
        'SELECT event_create(:title, :description, :location, :start_time, :end_time, :created_by_member_id)',
        {
          replacements: {
            title,
            description,
            location,
            start_time,
            end_time,
            created_by_member_id
          },
          type: sequelize.QueryTypes.SELECT,
        }
      );
  
      const newEventId = result[0].create_event;
      res.status(201).json({ message: 'Event created successfully', event_id: newEventId });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  };

  exports.getAllEvents = async (req, res) => {
    try {
        const events = await sequelize.query('SELECT * FROM events_get_all()', {
            type: sequelize.QueryTypes.SELECT,
        });

        res.status(200).json({data: events});
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

exports.getEventsByDistrict = async (req, res) => {
    try {
        const { id } = req.params;
        const { member_id} = req.query;

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
        const { member_id, event_id, status} = req.body;

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

