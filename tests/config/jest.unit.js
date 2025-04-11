/**
 * Jest configuration for unit tests
 */
const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  // Unit test specific settings
  testMatch: [
    '<rootDir>/../unit/**/*.test.js',
    '<rootDir>/../unit/**/*.spec.js',
  ],
  // Mock all external dependencies
  automock: false,
  // Don't run slow tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/integration/',
    '/e2e/',
  ],
  // Coverage settings specific to unit tests
  collectCoverageFrom: [
    'server/src/**/*.js',
    'client/src/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
};
