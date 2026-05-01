const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const { protect } = require('../middleware/auth');

router.route('/incident/:incidentId')
  .get(protect, timelineController.getTimelineByIncident)
  .post(protect, timelineController.addTimelineEvent);

router.route('/:id')
  .put(protect, timelineController.updateTimelineEvent)
  .delete(protect, timelineController.deleteTimelineEvent);

router.get('/incident/:incidentId/export', protect, timelineController.exportTimeline);

module.exports = router;