const express = require('express');
const router = express.Router();
const postmortemController = require('../controllers/postmortemController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, postmortemController.getPostmortems)
  .post(protect, postmortemController.createPostmortem);

router.route('/:id')
  .get(protect, postmortemController.getPostmortemById)
  .put(protect, postmortemController.updatePostmortem)
  .delete(protect, postmortemController.deletePostmortem);

router.post('/:id/generate-ai', protect, postmortemController.generateAIPostmortem);
router.post('/incident/:incidentId/generate', protect, postmortemController.generateFromIncident);
router.get('/:id/export/pdf', protect, postmortemController.exportAsPDF);

module.exports = router;