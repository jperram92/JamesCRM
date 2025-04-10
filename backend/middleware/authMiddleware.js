const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Create a fixed ObjectId for demo users
const DEMO_USER_ID = new mongoose.Types.ObjectId();
const MOCK_USER_ID = new mongoose.Types.ObjectId();

// Protect routes - verify token and set req.user
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Special case for demo token
      if (token === 'demo-token') {
        // Create a mock admin user with a valid ObjectId
        req.user = {
          _id: DEMO_USER_ID,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          lastLogin: Date.now()
        };
        return next();
      }

      // Handle mock tokens that start with 'mock-token'
      if (token.startsWith('mock-token-')) {
        // Create a mock regular user with a valid ObjectId
        req.user = {
          _id: MOCK_USER_ID,
          firstName: 'Mock',
          lastName: 'User',
          email: 'mock@example.com',
          role: 'user',
          status: 'active',
          lastLogin: Date.now()
        };
        return next();
      }

      // For development without MongoDB
      if (process.env.SKIP_MONGODB === 'true') {
        console.log('Auth Middleware - Using mock data (SKIP_MONGODB=true)');

        // Verify token but don't access the database
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Create a mock user based on the token
        req.user = {
          _id: decoded.id || DEMO_USER_ID,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          lastLogin: Date.now()
        };

        return next();
      }

      // Regular token verification
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      // Update last login time
      if (req.user) {
        req.user.lastLogin = Date.now();
        await req.user.save();
      } else {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin middleware
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
