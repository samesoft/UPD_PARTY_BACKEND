const express = require('express');
const ageGroupController = require('../controllers/ageGroupController');
const router = express.Router();

// router.post('/', ageGroupController.addAgeGroup);
router.get('/', ageGroupController.getAllAgeGroups);
// router.get('/:id', ageGroupController.getAgeGroup);
router.put('/:id', ageGroupController.updateAgeGroup);
router.delete('/:id', ageGroupController.deleteAgeGroup);

module.exports = router;
