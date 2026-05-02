const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 30,
  message: 'Too many login attempts, please try again later',
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many registrations from this IP'
});

// Public routes
router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.get('/blacklist/:token', authController.isTokenBlacklisted);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.get('/me', protect, authController.getCurrentUser);
router.put('/me', protect, authController.updateProfile);
router.post('/change-password', protect, authController.changePassword);
router.post('/logout', protect, authController.logout);

// Admin only routes
router.get('/users', protect, authController.getAllUsers);
router.get('/users/:id', protect, authController.getUserById);
router.put('/users/:id/role', protect, authController.updateUserRole);
router.delete('/users/:id', protect, authController.deleteUser);

module.exports = router;