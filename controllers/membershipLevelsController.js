const { sequelize } = require('../config/dbConfig');

exports.createMembershipLevel = async (req, res) => {
    try {
      // Extract data from the request body
      const { name, description, fee_amount } = req.body;
      console.log(req.body)
  
      // Validate input (optional but recommended)
      if (!name || !description || fee_amount === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // Call the PostgreSQL function `membershiplevel_add`
      await sequelize.query('SELECT membershiplevel_add(:name, :description, :fee_amount)', {
        replacements: { name, description, fee_amount }, // Pass parameters as replacements
        type: sequelize.QueryTypes.SELECT,               // Specify query type
      });
  
      // Respond with success message
      res.status(201).json({ message: 'Membership level added successfully' });
    } catch (error) {
      // Log the error and send an appropriate response
      console.error('Error adding membership level:', error);
      res.status(500).json({ error: 'Failed to add membership level' });
    }
  };
 exports.getMembershipLevel = async (req, res) => {
    try {
      // Extract data from the request parameters
      const { id } = req.params;
      console.log(id)
  
      // Validate input
      if (!id) {
        return res.status(400).json({ error: 'Missing required field: id' });
      }
  
      // Call the PostgreSQL function `membershiplevel_get`
      const result = await sequelize.query('SELECT * FROM membershiplevel_get(:p_id)', {
        replacements: { p_id: id },
        type: sequelize.QueryTypes.SELECT,
      });
      console.log("results: ", result);
  
      // Check if any results were returned
      if (!result || result.length === 0) {
        return res.status(404).json({ error: 'Membership level not found' });
      }
  
      // Respond with the membership level data
      res.status(200).json(result[0]);
    } catch (error) {
      // Log the error and send an appropriate response
      console.error('Error retrieving membership level:', error);
      res.status(500).json({ error: 'Failed to retrieve membership level' });
    }
  };

  exports.getAllMembershipLevels = async (req, res) => {
    try {
        // Extract pagination parameters (optional)
        const page = req.query.page ? parseInt(req.query.page, 10) : null; // Null if not provided
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : null; // Null means fetch all

        console.log('Page:', page, 'Limit:', limit);

        // Call the PostgreSQL function `membershiplevel_get_all`
        const result = await sequelize.query(
            'SELECT * FROM membershiplevel_get_all(:p_limit, :p_page)',
            {
                replacements: { p_limit: limit, p_page: page },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        // Check if results exist
        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'No membership levels found' });
        }

        // Extract total count from the first record
        const totalRecords = result[0]?.total_count || 0;
        const totalPages = limit ? Math.ceil(totalRecords / limit) : 1;

        // Respond with membership levels and pagination details
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
        console.error('Error retrieving membership levels:', error);
        res.status(500).json({ error: 'Failed to retrieve membership levels' });
    }
};


exports.updateMembershipLevel = async (req, res) => {
    try {
      // Extract data from the request body and params
      const { id } = req.params;
      const { name, description, fee_amount } = req.body;
  
      // Validate input
      if (!id || !name || !description || fee_amount === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // Call the PostgreSQL function `membershiplevel_Update`
      await sequelize.query('SELECT membershiplevel_update(:p_id, :p_name, :p_description, :p_fee_amount)', {
        replacements: { p_id: id, p_name: name, p_description: description, p_fee_amount: fee_amount },
        type: sequelize.QueryTypes.SELECT,
      });
  
      // Respond with success message
      res.status(200).json({ message: 'Membership level updated successfully' });
    } catch (error) {
      // Log the error and send an appropriate response
      console.error('Error updating membership level:', error);
      res.status(500).json({ error: 'Failed to update membership level' });
    }
  };

  exports.deleteMembershipLevel = async (req, res) => {
    try {
      // Extract data from the request parameters
      const { id } = req.params;
  
      // Validate input
      if (!id) {
        return res.status(400).json({ error: `Missing required field: ${id}}` });
      }
  
      // Call the PostgreSQL function `membershiplevel_Delete`
      await sequelize.query('SELECT membershiplevel_delete(:p_id)', {
        replacements: { p_id: id },
        type: sequelize.QueryTypes.SELECT,
      });
  
      // Respond with success message
      res.status(200).json({ message: 'Membership level deleted successfully' });
    } catch (error) {
      // Log the error and send an appropriate response
      console.error('Error deleting membership level:', error);
      res.status(500).json({ error: 'Failed to delete membership level' });
    }
  };