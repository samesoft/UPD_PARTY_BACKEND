const express = require('express');
const eventController = require('../controllers/eventController');
const router = express.Router();


router.post('/', eventController.createEvent);
router.get('/eventsByState/:state_id', eventController.getEventsByState);
router.get('/Unregisted/memberEventsByState/:state_id', eventController.getUnregisteredMemberEventsByState);
router.get('/member:member_id', eventController.getMemberEvents);
router.get('/', eventController.getAllEvents);
router.get('/active/all', eventController.getAllActiveEvents);
router.put('/updateStatus', eventController.updateEventStatus);
router.put('/', eventController.updateEvent);
router.get('/:id', eventController.getEventsByDistrict);
router.post('/register', eventController.registerToEvent);
router.delete('/:id', eventController.deleteEvent);
router.get('/active/registered', eventController.getRegisteredEvents);
router.get('/ticket/verify-ticket', eventController.verifyTicket);



module.exports = router;