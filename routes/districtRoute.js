const express = require('express');
const districtController = require('../controllers/districtController');
const router = express.Router();

router.get('/', districtController.getAllDistricts);
router.put('/:id', districtController.updateDistrict);
router.delete('/:id', districtController.deleteDistrict);


module.exports = router;