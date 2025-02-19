const express = require('express');
const stateController = require('../controllers/stateController');
const router = express.Router();


router.post('/', stateController.addState);
router.get('/', stateController.getAllStates);
router.get('/cleaned', stateController.getAllStates1);
router.get('/:id',stateController.getState);
router.put('/:id', stateController.updateState);
router.delete('/:id', stateController.deleteState);


module.exports = router;