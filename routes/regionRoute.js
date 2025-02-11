const express = require('express');
const regionController = require('../controllers/regionController');
const router = express.Router();

// Get All Regions
router.get('/', regionController.getAllRegions);

// Update a Region
router.put('/:id', regionController.updateRegion);

// Delete a Region
router.delete('/:id', regionController.deleteRegion);

module.exports = router;