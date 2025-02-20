const { sequelize } = require('../config/dbConfig');
exports.getAllRoles = async (req, res) => {
    try {
        const result = await sequelize.query(
            'SELECT role_id, role_name FROM roles',
            { type: sequelize.QueryTypes.SELECT }
        );

        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'No roles found' });
        }

        res.status(200).json({ data: result });
    } catch (error) {
        console.error('Error retrieving roles:', error);
        res.status(500).json({ error: 'Failed to retrieve roles' });
    }
};
