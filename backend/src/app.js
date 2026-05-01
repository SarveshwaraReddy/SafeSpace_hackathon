const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const cookieParser = require("cookie-parser")

// Import routes
const incidentRoutes = require('./routes/incidents');
const responderRoutes = require('./routes/responders');
const timelineRoutes = require('./routes/timeline');
const postmortemRoutes = require('./routes/postmortems');
const statusRoutes = require('./routes/status');
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cookieParser())
// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Rate limiting - apply to all routes
app.use('/api/', apiLimiter);

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: require('../../package.json').version
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/responders', responderRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/postmortems', postmortemRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/ai', aiRoutes);

// Static files for public status page
app.use('/status-page', express.static(path.join(__dirname, '../../public/status-page')));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SafeSpace - Smart Incident Response Platform API',
    version: '1.0.0',
    status: 'operational',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      incidents: '/api/incidents',
      responders: '/api/responders',
      status: '/api/status',
      ai: '/api/ai'
    }
  });
});

// API Documentation endpoint (simple version)
app.get('/api/docs', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'SafeSpace - Incident Response Platform API',
      version: '1.0.0',
      description: 'API documentation for SafeSpace - Smart Incident Response Platform'
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    endpoints: {
      incidents: {
        'GET /api/incidents': 'Get all incidents with filtering',
        'POST /api/incidents': 'Create new incident',
        'GET /api/incidents/:id': 'Get incident by ID',
        'PUT /api/incidents/:id': 'Update incident',
        'DELETE /api/incidents/:id': 'Delete incident',
        'PATCH /api/incidents/:id/status': 'Update incident status',
        'POST /api/incidents/:id/assign': 'Assign responder to incident'
      },
      ai: {
        'GET /api/ai/summary/:id': 'Generate AI summary for incident',
        'GET /api/ai/root-cause/:id': 'Get AI root cause analysis',
        'GET /api/ai/predict': 'Predict future incidents',
        'GET /api/ai/similar/:id': 'Find similar incidents',
        'POST /api/ai/postmortem/:id': 'Generate AI postmortem',
        'GET /api/ai/dashboard': 'Get AI dashboard insights',
        'GET /api/ai/anomalies': 'Detect anomalies'
      },
      status: {
        'GET /api/status/current': 'Get current system status',
        'GET /api/status/history': 'Get status history',
        'GET /api/status/incidents/active': 'Get active incidents',
        'GET /api/status/services': 'Get services status',
        'GET /api/status/uptime': 'Get uptime statistics'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.url}`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;