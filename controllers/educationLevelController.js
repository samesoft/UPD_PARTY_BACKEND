const { sequelize } = require('../config/dbConfig');

// Get All Education Levels
exports.getAllEducationLevels = async (req, res) => {
    try {
        const result = await sequelize.query(
            'SELECT * FROM education_level_get_all()',
            {
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'No education levels found' });
        }

        res.status(200).json({ data: result });
    } catch (error) {
        console.error('Error fetching education levels:', error);
        res.status(500).json({ error: 'Failed to fetch education levels' });
    }
};

// Update an Education Level
exports.updateEducationLevel = async (req, res) => {
    try {
        const { id } = req.params;
        const { educ_level } = req.body;

        if (!id || !educ_level) {
            return res.status(400).json({ error: 'Missing required fields: id or educ_level' });
        }

        await sequelize.query('SELECT education_level_update(:edu_level_id, :educ_level)', {
            replacements: { edu_level_id: id, educ_level },
            type: sequelize.QueryTypes.SELECT,
        });

        res.status(200).json({ message: 'Education level updated successfully' });
    } catch (error) {
        console.error('Error updating education level:', error);
        res.status(500).json({ error: 'Failed to update education level' });
    }
};

// Delete an Education Level
exports.deleteEducationLevel = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Missing required field: id' });
        }

        await sequelize.query('SELECT education_level_delete(:edu_level_id)', {
            replacements: { edu_level_id: id },
            type: sequelize.QueryTypes.SELECT,
        });

        res.status(200).json({ message: 'Education level deleted successfully' });
    } catch (error) {
        console.error('Error deleting education level:', error);
        res.status(500).json({ error: 'Failed to delete education level' });
    }
};