/**
 * Rate limiting middleware for JamesCRM API
 */
const mongoose = require('mongoose');
const { APIError } = require('../utils/errorHandler');

// Schema for rate limit records
const RateLimitSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    index: true
  },
  points: {
    type: Number,
    default: 0
  },
  expire: {
    type: Date,
    required: true,
    index: { expires: 0 }
  }
});

// Create or get the RateLimit model
const RateLimit = mongoose.models.RateLimit || mongoose.model('RateLimit', RateLimitSchema);

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware function
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 100, // 100 requests per windowMs
    message = 'Too many requests, please try again later.',
    statusCode = 429,
    keyGenerator = (req) => req.ip || req.connection.remoteAddress,
    skip = () => false,
    headers = true,
    handler = null
  } = options;

  return async (req, res, next) => {
    try {
      // Skip rate limiting if the skip function returns true
      if (skip(req)) {
        return next();
      }

      // Generate key for this request
      const key = keyGenerator(req);
      
      // Get current time
      const now = new Date();
      
      // Calculate expiration time
      const expireAt = new Date(now.getTime() + windowMs);
      
      // Find or create rate limit record
      let rateLimitRecord = await RateLimit.findOne({ key });
      
      if (!rateLimitRecord) {
        // Create new record
        rateLimitRecord = new RateLimit({
          key,
          points: 1,
          expire: expireAt
        });
        await rateLimitRecord.save();
      } else {
        // Update existing record
        rateLimitRecord.points += 1;
        
        // If the record is expired, reset it
        if (rateLimitRecord.expire < now) {
          rateLimitRecord.points = 1;
          rateLimitRecord.expire = expireAt;
        }
        
        await rateLimitRecord.save();
      }
      
      // Calculate remaining points
      const remaining = Math.max(0, max - rateLimitRecord.points);
      
      // Calculate reset time
      const resetTime = rateLimitRecord.expire.getTime();
      
      // Set rate limit headers if enabled
      if (headers) {
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000));
      }
      
      // Check if rate limit is exceeded
      if (rateLimitRecord.points > max) {
        // Use custom handler if provided
        if (handler) {
          return handler(req, res, next);
        }
        
        // Default response
        throw new APIError(message, statusCode);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Create a rate limiter for authenticated users
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware function
 */
const createAuthRateLimiter = (options = {}) => {
  return createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 300, // 300 requests per minute for authenticated users
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return req.user ? `user_${req.user._id || req.user.id}` : `ip_${req.ip}`;
    },
    skip: (req) => {
      // Skip rate limiting for certain paths
      const skipPaths = ['/api/health', '/api/auth/login'];
      return skipPaths.some(path => req.path.startsWith(path));
    },
    ...options
  });
};

/**
 * Create a stricter rate limiter for authentication endpoints
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware function
 */
const createAuthEndpointRateLimiter = (options = {}) => {
  return createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per 15 minutes
    message: 'Too many login attempts, please try again later.',
    ...options
  });
};

module.exports = {
  createRateLimiter,
  createAuthRateLimiter,
  createAuthEndpointRateLimiter
};
