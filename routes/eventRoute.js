const express = require('express');
const eventController = require('../controllers/eventController');
const router = express.Router();


router.post('/', eventController.createEvent);
router.get('/member:member_id', eventController.getMemberEvents);
router.get('/', eventController.getAllEvents);
router.put('/', eventController.updateEvent);
router.get('/:id', eventController.getEventsByDistrict);
router.post('/register', eventController.registerToEvent);
router.delete('/:id', eventController.deleteEvent);


module.exports = router;