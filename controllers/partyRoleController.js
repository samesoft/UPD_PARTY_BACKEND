const { sequelize } = require('../config/dbConfig');

// Add a Party Role
// exports.addPartyRole = async (req, res) => {
//     try {
//         const { party_role } = req.body;

//         if (!party_role) {
//             return res.status(400).json({ error: 'Missing required field: party_role' });
//         }

//         await sequelize.query('SELECT party_role_add(:party_role)', {
//             replacements: { party_role },
//             type: sequelize.QueryTypes.SELECT,
//         });

//         res.status(201).json({ message: 'Party role added successfully' });
//     } catch (error) {
//         console.error('Error adding party role:', error);
//         res.status(500).json({ error: 'Failed to add party role' });
//     }
// };

// Get a Party Role by ID
// exports.getPartyRole = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!id) {
//             return res.status(400).json({ error: 'Missing required field: id' });
//         }

//         const result = await sequelize.query('SELECT * FROM party_role_get(:party_role_id)', {
//             replacements: { party_role_id: id },
//             type: sequelize.QueryTypes.SELECT,
//         });

//         res.status(200).json(result[0]);
//     } catch (error) {
//         console.error('Error fetching party role:', error);
//         res.status(500).json({ error: 'Failed to fetch party role' });
//     }
// };

// Get All Party Roles
exports.getAllPartyRoles = async (req, res) => {
    try {
        const result = await sequelize.query(
            'SELECT * FROM party_role_get_all()',
            {
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'No party roles found' });
        }

        res.status(200).json({ data: result });
    } catch (error) {
        console.error('Error fetching party roles:', error);
        res.status(500).json({ error: 'Failed to fetch party roles' });
    }
};

// Delete a Party Role
exports.deletePartyRole = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Missing required field: id' });
        }

        await sequelize.query('SELECT party_role_delete(:p_party_role_id)', {
            replacements: { p_party_role_id: id },
            type: sequelize.QueryTypes.SELECT,
        });

        res.status(200).json({ message: 'Party role deleted successfully' });
    } catch (error) {
        console.error('Error deleting party role:', error);
        res.status(500).json({ error: 'Failed to delete party role' });
    }
};

// Update a Party Role
exports.updatePartyRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { party_role } = req.body;

        if (!id || !party_role) {
            return res.status(400).json({ error: 'Missing required fields: id or party_role' });
        }

        await sequelize.query('SELECT party_role_update(:party_role_id, :party_role)', {
            replacements: { party_role_id: id, party_role },
            type: sequelize.QueryTypes.SELECT,
        });

        res.status(200).json({ message: 'Party role updated successfully' });
    } catch (error) {
        console.error('Error updating party role:', error);
        res.status(500).json({ error: 'Failed to update party role' });
    }
};