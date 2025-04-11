/**
 * Jest configuration for integration tests
 */
const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  // Integration test specific settings
  testMatch: [
    '<rootDir>/../integration/**/*.test.js',
    '<rootDir>/../integration/**/*.spec.js',
  ],
  // Don't run slow tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/unit/',
    '/e2e/',
  ],
  // Integration tests may take longer
  testTimeout: 30000,
  // Coverage settings specific to integration tests
  collectCoverageFrom: [
    'server/src/**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
};
