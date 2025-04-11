/**
 * Helper functions for tests
 */

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the string to generate
 * @returns {string} - Random string
 */
const generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Generate a random email address
 * @returns {string} - Random email address
 */
const generateRandomEmail = () => {
  return `test.${generateRandomString(8)}@example.com`;
};

/**
 * Generate a random date within a range
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {Date} - Random date within the range
 */
const generateRandomDate = (start = new Date(2020, 0, 1), end = new Date()) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>} - Promise that resolves after the specified time
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create a mock request object for testing Express controllers
 * @param {Object} options - Options for the mock request
 * @returns {Object} - Mock request object
 */
const createMockRequest = (options = {}) => {
  // Get models, bcrypt, and jwt from options or use empty objects
  const models = options.models || {};
  const bcrypt = options.bcrypt || {};
  const jwt = options.jwt || {};

  return {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: options.headers || {},
    cookies: options.cookies || {},
    user: options.user || null,
    app: {
      models,
      bcrypt,
      jwt
    },
    ...options,
  };
};

/**
 * Create a mock response object for testing Express controllers
 * @returns {Object} - Mock response object with jest spy functions
 */
const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
};

module.exports = {
  generateRandomString,
  generateRandomEmail,
  generateRandomDate,
  wait,
  createMockRequest,
  createMockResponse,
};
