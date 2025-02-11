const express = require('express');
const membershipLevelsController = require('../controllers/membershipLevelsController');
const router = express.Router();


router.post('/', membershipLevelsController.createMembershipLevel);
router.get('/', membershipLevelsController.getAllMembershipLevels)
router.get('/:id', membershipLevelsController.getMembershipLevel);
router.put('/:id', membershipLevelsController.updateMembershipLevel);
router.delete('/:id', membershipLevelsController.deleteMembershipLevel);


module.exports = router;
