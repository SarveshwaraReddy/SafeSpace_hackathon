const jwt = require('jsonwebtoken');
const User = require('../models/User');
const blacklistModel = require('../models/Blacklist');
const RedisClient = require('../config/redis');

const protect = async (req, res, next) => {
  let token;
  
  // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.cookies.token;

      // Check if token is blacklisted
      // const blacklisted = await blacklistModel.findOne({ token });
      // if (blacklisted) {
      //   return res.status(401).json({
      //     success: false,
      //     message: 'Token is blacklisted. Please login again.'
      //   });
      // }
      const blacklisted = await RedisClient.get(`blacklist:${token}`);

      // console.log('Checking token against blacklist:', token, blacklisted);
      if (blacklisted) {
        return res.status(401).json({
          success: false,
          message: 'Token is blacklisted. Please login again.'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  // }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };