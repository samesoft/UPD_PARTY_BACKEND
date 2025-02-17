const express = require('express');
const districtController = require('../controllers/districtController');
const router = express.Router();

// In your districtRoute file
router.get('/districtByState/:state_id', districtController.getDistrictsByState);
router.get('/', districtController.getAllDistricts);
router.put('/:id', districtController.updateDistrict);
router.delete('/:id', districtController.deleteDistrict);


module.exports = router;