const express = require('express');
const educationLevelController = require('../controllers/educationLevelController');
const router = express.Router();

// Get All Education Levels
router.get('/', educationLevelController.getAllEducationLevels);

// Update an Education Level
router.put('/:id', educationLevelController.updateEducationLevel);

// Delete an Education Level
router.delete('/:id', educationLevelController.deleteEducationLevel);

module.exports = router;