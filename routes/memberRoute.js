const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

router.post('/', memberController.createMember);
router.get('/:id', memberController.getMember);
router.get('/', memberController.getAllMembers);
router.put('/:id', memberController.updateMember);
router.delete('/:id', memberController.deleteMember);
router.post('/requestOtp', memberController.requestOtp);
router.post('/verify-otp', memberController.verifyOtp);
router.post('/login', memberController.loginMember);
router.post('/donation', memberController.createDonation)

module.exports = router;
