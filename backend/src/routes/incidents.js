const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { protect } = require('../middleware/auth');
const { incidentCreationLimiter, incidentUpdateLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(protect);

// Incident CRUD operations
router.route('/')
  .get(incidentController.getIncidents)
  .post(incidentCreationLimiter, incidentController.createIncident);

router.route('/stats')
  .get(incidentController.getIncidentStats);

router.route('/:id')
  .get(incidentController.getIncidentById)
  .put(incidentController.updateIncident)
  .delete(incidentController.deleteIncident);

// Incident status update
router.route('/:id/status')
  .patch(incidentUpdateLimiter, incidentController.updateIncidentStatus);

// Responder assignment
router.route('/:id/assign')
  .post(incidentController.assignResponder);

// Timeline and updates
router.route('/:id/timeline')
  .get(incidentController.getIncidentTimeline);

router.route('/:id/updates')
  .post(incidentUpdateLimiter, incidentController.addIncidentUpdate);

module.exports = router;