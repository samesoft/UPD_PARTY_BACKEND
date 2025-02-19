const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const multer = require('multer');
const path = require('path');


// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile-photos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });
router.use(express.json());


router.post('/', memberController.createMember);
router.get('/:id', memberController.getMember);
router.get('/', memberController.getAllMembers);
// router.put('/:id', memberController.updateMember);
router.delete('/:id', memberController.deleteMember);
router.post('/requestOtp', memberController.requestOtp);
router.post('/requestOtpForReset', memberController.requestOtpForReset);
router.post('/verify-otp', memberController.verifyOtp);
router.post('/sms', memberController.sendSMS);
router.post('/login', memberController.loginMember);
router.post('/reset-password', memberController.resetPassword);
router.post('/donation', memberController.createDonation);
router.get('/payment/requestPayment', memberController.requestPayment);
router.put('/:id', upload.single('profile_photo'), memberController.updateMemberProfile);


module.exports = router;
