const express = require('express');
const partyRoleController = require('../controllers/partyRoleController');
const router = express.Router();

// Add a Party Role
// router.post('/', partyRoleController.addPartyRole);
router.get('/', partyRoleController.getAllPartyRoles);
// router.get('/:id', partyRoleController.getPartyRole);
router.put('/:id', partyRoleController.updatePartyRole);
router.delete('/:id', partyRoleController.deletePartyRole);

module.exports = router;