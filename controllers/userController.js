const { sequelize } = require('../config/dbConfig');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing


exports.createUser = async (req, res) => {
    try {
        const { username, password, name, role_id } = req.body;

        if (!username || !password || !name || !role_id) {
            return res.status(400).json({ error: 'Missing required fields: username, password, name, or role_id' });
        }

        const saltRounds = 10; // Number of salt rounds for bcrypt
        const password_hash = await bcrypt.hash(password, saltRounds);

        await sequelize.query(
            'SELECT user_create(:username, :password_hash, :name, :role_id)', 
            {
                replacements: { username, password_hash, name, role_id },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        let { page, limit } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;  // Default to 10 users per page
        const offset = (page - 1) * limit;

        const result = await sequelize.query(
            'SELECT * FROM user_get_all(:limit, :offset)',
            {
                replacements: { limit, offset },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'No users found' });
        }

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
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

exports.getOneUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Missing required field: id' });
        }

        const result = await sequelize.query(
            'SELECT * FROM user_get_one(:user_id)', 
            {
                replacements: { user_id: id },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ data: result[0] });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, name, role_id } = req.body;

        if (!id || !username || !name || !role_id) {
            return res.status(400).json({ error: 'Missing required fields: id, username, name, or role_id' });
        }

        await sequelize.query(
            'SELECT user_update(:user_id, :username, :name, :role_id)', 
            {
                replacements: { user_id: id, username, name, role_id },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Missing required field: id' });
        }

        await sequelize.query('SELECT user_delete(:p_user_id)', {
            replacements: { p_user_id: id },
            type: sequelize.QueryTypes.SELECT,
        });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

