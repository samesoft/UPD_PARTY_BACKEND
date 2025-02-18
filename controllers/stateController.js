const { sequelize } = require('../config/dbConfig');

exports.addState = async (req, res) => {
    try {
        // Extract data from the request body
        const { new_state } = req.body;

        // Validate input
        if (!new_state) {
            return res.status(400).json({ error: 'Missing required field: new_state' });
        }

        // Call the PostgreSQL function `state_add`
        await sequelize.query('SELECT state_add(:new_state)', {
            replacements: { new_state }, // Pass parameters as replacements
            type: sequelize.QueryTypes.SELECT, // Specify query type
        });

        // Respond with success message
        res.status(201).json({ message: 'State added successfully' });
    } catch (error) {
        // Log the error and send an appropriate response
        console.error('Error adding state:', error);
        res.status(500).json({ error: 'Failed to add state' });
    }
};

exports.getState = async (req, res) => {
    try {
        // Extract data from the request parameters or query
        const { id } = req.params;

        // Validate input
        if (!id) {
            return res.status(400).json({ error: 'Missing required field: id' });
        }

        // Call the PostgreSQL function `state_get`
        const result = await sequelize.query('SELECT * FROM state_get(:state_id)', {
            replacements: { state_id: id }, // Pass parameters as replacements
            type: sequelize.QueryTypes.SELECT, // Specify query type
        });

        // Respond with the result
        res.status(200).json(result[0]);
    } catch (error) {
        // Log the error and send an appropriate response
        console.error('Error fetching state:', error);
        res.status(500).json({ error: 'Failed to fetch state' });
    }
};

exports.getAllStates = async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page, 10) : null;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

        console.log('Page:', page, 'Limit:', limit);

        // Execute the stored function
        const result = await sequelize.query(
            'SELECT * FROM state_get_all(:p_limit, :p_page)',
            {
                replacements: { p_limit: limit, p_page: page },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        // Check if results exist
        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'No states found' });
        }

        // Extract total count from the first record
        const totalRecords = result[0]?.total_count || 0;
        const totalPages = limit ? Math.ceil(totalRecords / limit) : 1;

        res.status(200).json({
            data: result,
            pagination: {
                currentPage: page || 1,
                limit,
                totalPages,
                totalRecords,
            },
        });
    } catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).json({ error: 'Failed to fetch states' });
    }
};

exports.getAllStates1 = async (req, res) => {
    try {
        // Execute the stored function without pagination parameters
        const result = await sequelize.query(
            'SELECT * FROM state_get_all1()',
            {
                type: sequelize.QueryTypes.SELECT,
            }
        );

        // Check if results exist
        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'No states found' });
        }

        res.status(200).json({ data: result });
    } catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).json({ error: 'Failed to fetch states' });
    }
};



exports.deleteState = async (req, res) => {
    try {
        // Extract data from the request parameters or query
        const { id } = req.params;

        // Validate input
        if (!id) {
            return res.status(400).json({ error: 'Missing required field: id' });
        }

        // Call the PostgreSQL function `state_delete`
        await sequelize.query('SELECT state_delete(:state_id)', {
            replacements: { state_id:id }, // Pass parameters as replacements
            type: sequelize.QueryTypes.SELECT, // Specify query type
        });

        // Respond with success message
        res.status(200).json({ message: 'State deleted successfully' });
    } catch (error) {
        // Log the error and send an appropriate response
        console.error('Error deleting state:', error);
        res.status(500).json({ error: 'Failed to delete state' });
    }
};

exports.updateState = async (req, res) => {
    try {

        const { id } = req.params;

        // Extract data from the request body
        const { new_state } = req.body;

        // Validate input
        if (!id || !new_state) {
            return res.status(400).json({ error: 'Missing required fields: id or new_state' });
        }

        // Call the PostgreSQL function `state_update`
        await sequelize.query('SELECT state_update(:state_id, :new_state)', {
            replacements: { state_id: id, new_state }, // Pass parameters as replacements
            type: sequelize.QueryTypes.SELECT, // Specify query type
        });

        // Respond with success message
        res.status(200).json({ message: 'State updated successfully' });
    } catch (error) {
        // Log the error and send an appropriate response
        console.error('Error updating state:', error);
        res.status(500).json({ error: 'Failed to update state' });
    }
};