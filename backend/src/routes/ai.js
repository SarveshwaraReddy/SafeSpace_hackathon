const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

// All AI routes require authentication and rate limiting
router.use(protect);
router.use(aiLimiter);

// Generate AI summary for an incident
router.get('/summary/:id', aiController.generateIncidentSummary);

// Get AI-powered root cause analysis
router.get('/root-cause/:id', aiController.getRootCauseAnalysis);

// Predict future incidents based on historical data
router.get('/predict', aiController.predictNextIncident);

// Find similar incidents for learning and pattern matching
router.get('/similar/:id', aiController.findSimilarIncidents);

// Generate automated postmortem using AI
router.post('/postmortem/:id', aiController.generatePostmortemAI);

// Get AI-powered insights dashboard
router.get('/dashboard', aiController.getAIDashboard);

// Real-time anomaly detection
router.get('/anomalies', aiController.detectAnomalies);

// Analyze incident health and provide recommendations
router.get('/health-check/:id', aiController.analyzeIncidentHealth);

// Generate incident response recommendations
router.get('/recommendations/:id', aiController.generateRecommendations);

// Chat with AI about incident (interactive Q&A)
router.post('/chat/:id', aiController.chatWithAI);

// Bulk analyze multiple incidents
router.post('/bulk-analyze', aiController.bulkAnalyzeIncidents);

// Get AI confidence score for analysis
router.get('/confidence/:id', aiController.getAnalysisConfidence);

// Train AI on custom data (admin only)
router.post('/train', aiController.trainAIModel);

module.exports = router;