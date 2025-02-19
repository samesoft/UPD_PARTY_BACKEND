const { sequelize } = require('../config/dbConfig');



exports.createDistrict = async (req, res) => {
    try {
        // Expecting district_name and stateid in the request body
        const { district, stateid } = req.body;

        if (!district || !stateid) {
            return res.status(400).json({
                error: "Missing required fields: district_name and stateid",
            });
        }

        const [result] = await sequelize.query(
            `
        INSERT INTO district (district, stateid)
        VALUES (:district, :stateid)
        RETURNING *;
        `,
            {
                replacements: { district, stateid },
                type: sequelize.QueryTypes.INSERT,
            }
        );

        const insertedDistrict = result[0];

        res.status(201).json({ data: insertedDistrict });
    } catch (error) {
        console.error("Error creating district:", error);
        res.status(500).json({ error: "Failed to create district" });
    }
};


exports.getEventsByState = async (req, res) => {
    try {
        const { state_id } = req.params;

        // Join events with district to also fetch the district_name as "district"
        const events = await sequelize.query(
            `
        SELECT e.*, d.district_name AS district
        FROM events e
        INNER JOIN district d 
          ON e.ditrict_id = d.district_id
        WHERE d.stateid = :state_id
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




// Get All Districts
exports.getAllDistricts = async (req, res) => {
    try {
        const result = await sequelize.query(
            'SELECT * FROM district_get_all()',
            {
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'No districts found' });
        }

        res.status(200).json({ data: result });
    } catch (error) {
        console.error('Error fetching districts:', error);
        res.status(500).json({ error: 'Failed to fetch districts' });
    }
};


// exports.getDistrictsByState = async (req, res) => {
//     try {
//         // Assuming state_id is passed as a route parameter, e.g., GET /districts/state/:state_id
//         const { state_id } = req.params;

//         const districts = await sequelize.query(
//             `SELECT d.*
//          FROM district d
//          INNER JOIN region r ON d.regionid = r.regionid
//          WHERE r.stateid = :state_id`,
//             {
//                 replacements: { state_id },
//                 type: sequelize.QueryTypes.SELECT,
//             }
//         );
//         console.log(districts);
//         res.status(200).json({ data: districts });
//     } catch (error) {
//         console.error('Error fetching districts:', error);
//         res.status(500).json({ error: 'Failed to fetch districts' });
//     }
// };

exports.getDistrictsByState = async (req, res) => {
    try {
        // state_id is passed as a route parameter, e.g., GET /districts/state/:state_id
        const { state_id } = req.params;

        const districts = await sequelize.query(
            `SELECT d.*
         FROM district d
         WHERE d.state_id = :state_id`,
            {
                replacements: { state_id },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        console.log(districts);
        res.status(200).json({ data: districts });
    } catch (error) {
        console.error('Error fetching districts:', error);
        res.status(500).json({ error: 'Failed to fetch districts' });
    }
};


// Update a District
exports.updateDistrict = async (req, res) => {
    try {
        const { id } = req.params;
        const { district, regionid } = req.body;

        if (!id || !district || !regionid) {
            return res.status(400).json({ error: 'Missing required fields: id, district, or regionid' });
        }

        await sequelize.query(
            'SELECT district_update(:district_id, :district, :region_id)',
            {
                replacements: { district_id: id, district, region_id: regionid },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        res.status(200).json({ message: 'District updated successfully' });
    } catch (error) {
        console.error('Error updating district:', error);
        res.status(500).json({ error: 'Failed to update district' });
    }
};


exports.deleteDistrict = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Missing required field: id' });
        }

        await sequelize.query('SELECT district_delete(:p_district_id)', {
            replacements: { p_district_id: id },
            type: sequelize.QueryTypes.SELECT,
        });

        res.status(200).json({ message: 'District deleted successfully' });
    } catch (error) {
        console.error('Error deleting district:', error);
        res.status(500).json({ error: 'Failed to delete district' });
    }
};