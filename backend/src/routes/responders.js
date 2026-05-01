const express = require('express');
const router = express.Router();
const responderController = require('../controllers/responderController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, responderController.getResponders)
  .post(protect, responderController.addResponder);

router.route('/:id')
  .get(protect, responderController.getResponderById)
  .put(protect, responderController.updateResponder)
  .delete(protect, responderController.deleteResponder);

router.route('/:id/availability')
  .patch(protect, responderController.updateAvailability);

router.get('/on-call/current', protect, responderController.getCurrentOnCall);

module.exports = router;