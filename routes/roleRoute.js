const express = require('express');
const roleController = require('../controllers/roleController');
const router = express.Router();

// Get All Regions
router.get('/', roleController.getAllRoles);

module.exports = router;