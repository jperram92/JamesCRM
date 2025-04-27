/**
 * Redis caching service for JamesCRM
 */
const redis = require('redis');
const { promisify } = require('util');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
  db: process.env.REDIS_DB || 0,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error
      console.error('Redis connection refused. Retrying in 10 seconds...');
      return 10000;
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after 1 hour
      console.error('Redis retry time exhausted');
      return new Error('Redis retry time exhausted');
    }
    if (options.attempt > 10) {
      // End reconnecting after 10 attempts
      console.error('Redis max retry attempts reached');
      return new Error('Redis max retry attempts reached');
    }
    // Reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
});

// Promisify Redis commands
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);
const keysAsync = promisify(redisClient.keys).bind(redisClient);
const expireAsync = promisify(redisClient.expire).bind(redisClient);
const flushdbAsync = promisify(redisClient.flushdb).bind(redisClient);

// Handle Redis errors
redisClient.on('error', (error) => {
  console.error('Redis Error:', error);
});

// Handle Redis connection
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

/**
 * Get a value from the cache
 * @param {String} key - Cache key
 * @returns {Promise<Object>} Cached value or null
 */
const get = async (key) => {
  try {
    const data = await getAsync(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

/**
 * Set a value in the cache
 * @param {String} key - Cache key
 * @param {Object} value - Value to cache
 * @param {Number} ttl - Time to live in seconds
 * @returns {Promise<Boolean>} Success status
 */
const set = async (key, value, ttl = 3600) => {
  try {
    const stringValue = JSON.stringify(value);
    if (ttl) {
      await setAsync(key, stringValue, 'EX', ttl);
    } else {
      await setAsync(key, stringValue);
    }
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
};

/**
 * Delete a value from the cache
 * @param {String} key - Cache key
 * @returns {Promise<Boolean>} Success status
 */
const del = async (key) => {
  try {
    await delAsync(key);
    return true;
  } catch (error) {
    console.error('Redis del error:', error);
    return false;
  }
};

/**
 * Delete multiple values from the cache using a pattern
 * @param {String} pattern - Key pattern to match
 * @returns {Promise<Boolean>} Success status
 */
const delByPattern = async (pattern) => {
  try {
    const keys = await keysAsync(pattern);
    if (keys.length > 0) {
      await delAsync(keys);
    }
    return true;
  } catch (error) {
    console.error('Redis delByPattern error:', error);
    return false;
  }
};

/**
 * Clear the entire cache
 * @returns {Promise<Boolean>} Success status
 */
const clear = async () => {
  try {
    await flushdbAsync();
    return true;
  } catch (error) {
    console.error('Redis clear error:', error);
    return false;
  }
};

/**
 * Cache middleware for Express routes
 * @param {Number} ttl - Time to live in seconds
 * @returns {Function} Express middleware function
 */
const cacheMiddleware = (ttl = 3600) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Skip caching if disabled
    if (process.env.DISABLE_CACHE === 'true') {
      return next();
    }
    
    // Generate cache key from request path and query
    const key = `cache:${req.originalUrl || req.url}`;
    
    try {
      // Try to get cached response
      const cachedResponse = await get(key);
      
      if (cachedResponse) {
        // Return cached response
        return res.json(cachedResponse);
      }
      
      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache response
      res.json = function(body) {
        // Restore original json method
        res.json = originalJson;
        
        // Cache response
        set(key, body, ttl).catch(err => console.error('Error caching response:', err));
        
        // Call original json method
        return originalJson.call(this, body);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Cache a function result
 * @param {Function} fn - Function to cache
 * @param {String} key - Cache key
 * @param {Number} ttl - Time to live in seconds
 * @returns {Promise<Object>} Function result
 */
const cacheFunction = async (fn, key, ttl = 3600) => {
  try {
    // Try to get cached result
    const cachedResult = await get(key);
    
    if (cachedResult) {
      return cachedResult;
    }
    
    // Call function
    const result = await fn();
    
    // Cache result
    await set(key, result, ttl);
    
    return result;
  } catch (error) {
    console.error('Cache function error:', error);
    // If caching fails, just return the function result
    return fn();
  }
};

module.exports = {
  redisClient,
  get,
  set,
  del,
  delByPattern,
  clear,
  cacheMiddleware,
  cacheFunction
};
