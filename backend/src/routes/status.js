const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');

// Public routes (no auth required)
router.get('/current', statusController.getCurrentStatus);
router.get('/history', statusController.getStatusHistory);
router.get('/incidents/active', statusController.getActiveIncidents);
router.get('/services', statusController.getServicesStatus);
router.get('/uptime', statusController.getUptimeStats);

module.exports = router;