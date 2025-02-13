const express = require('express');
const eventController = require('../controllers/eventController');
const router = express.Router();


router.post('/', eventController.createEvent);
router.get('/', eventController.getAllEvents);
router.get('/:id',eventController.getEventsByDistrict);
router.post('/register', eventController.registerToEvent);


module.exports = router;