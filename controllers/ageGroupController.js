const { sequelize } = require('../config/dbConfig');

// exports.addAgeGroup = async (req, res) => {
//     try {
//         const { age_group } = req.body;

//         if (!age_group) {
//             return res.status(400).json({ error: 'Missing required field: age_group' });
//         }

//         await sequelize.query('SELECT age_group_add(:age_group)', {
//             replacements: { age_group },
//             type: sequelize.QueryTypes.SELECT,
//         });

//         res.status(201).json({ message: 'Age group added successfully' });
//     } catch (error) {
//         console.error('Error adding age group:', error);
//         res.status(500).json({ error: 'Failed to add age group' });
//     }
// };

// exports.getAgeGroup = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!id) {
//             return res.status(400).json({ error: 'Missing required field: id' });
//         }

//         const result = await sequelize.query('SELECT * FROM age_group_get(:age_group_id)', {
//             replacements: { age_group_id: id },
//             type: sequelize.QueryTypes.SELECT,
//         });

//         res.status(200).json(result[0]);
//     } catch (error) {
//         console.error('Error fetching age group:', error);
//         res.status(500).json({ error: 'Failed to fetch age group' });
//     }
// };

exports.getAllAgeGroups = async (req, res) => {
    try {
        const result = await sequelize.query(
            'SELECT * FROM age_group_get_all()',
            {
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'No age groups found' });
        }

        res.status(200).json({ data: result });
    } catch (error) {
        console.error('Error fetching age groups:', error);
        res.status(500).json({ error: 'Failed to fetch age groups' });
    }
};


exports.deleteAgeGroup = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Missing required field: id' });
        }

        await sequelize.query('SELECT age_group_delete(:age_group_id)', {
            replacements: { age_group_id: id },
            type: sequelize.QueryTypes.SELECT,
        });

        res.status(200).json({ message: 'Age group deleted successfully' });
    } catch (error) {
        console.error('Error deleting age group:', error);
        res.status(500).json({ error: 'Failed to delete age group' });
    }
};

exports.updateAgeGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { age_group } = req.body;

        if (!id || !age_group) {
            return res.status(400).json({ error: 'Missing required fields: id or age_group' });
        }

        await sequelize.query('SELECT age_group_update(:age_group_id, :age_group)', {
            replacements: { age_group_id: id, age_group },
            type: sequelize.QueryTypes.SELECT,
        });

        res.status(200).json({ message: 'Age group updated successfully' });
    } catch (error) {
        console.error('Error updating age group:', error);
        res.status(500).json({ error: 'Failed to update age group' });
    }
};
