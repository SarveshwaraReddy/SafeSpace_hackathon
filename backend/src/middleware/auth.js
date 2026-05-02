const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RedisClient = require('../config/redis');
const {
  getMockUserById,
  attachMockUser,
} = require('../config/mockUsers');

const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }

  try {
    const blacklisted = await RedisClient.get(`blacklist:${token}`);
    if (blacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token is blacklisted. Please login again.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (process.env.SKIP_DATABASE === 'true') {
      const mock = getMockUserById(decoded.id);
      if (!mock) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }
      req.user = attachMockUser(mock);
      return next();
    }

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    return next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
