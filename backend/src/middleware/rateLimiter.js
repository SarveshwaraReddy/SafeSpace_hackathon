const rateLimit = require('express-rate-limit');

// Simple in-memory rate limiter (no IPv6 validation warnings)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false,
  // Simple key generator without IPv6 validation
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
  },
  // Disable all validation to avoid errors
  validate: false
});

const incidentCreationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many incidents created',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-forwarded-for'] || req.ip,
  validate: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-forwarded-for'] || req.ip,
  skipSuccessfulRequests: true,
  validate: false
});

const incidentUpdateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many updates',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-forwarded-for'] || req.ip,
  validate: false
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute
  message: {
    success: false,
    message: 'Too many AI requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.ip;
  }
});

module.exports = {
  apiLimiter,
  incidentCreationLimiter,
  authLimiter,
  incidentUpdateLimiter,
  aiLimiter
};