/**
 * Jest configuration for end-to-end tests
 */
const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  // E2E test specific settings
  testMatch: [
    '<rootDir>/../e2e/**/*.test.js',
    '<rootDir>/../e2e/**/*.spec.js',
  ],
  // Don't run other tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/unit/',
    '/integration/',
  ],
  // E2E tests may take longer
  testTimeout: 60000,
  // Use a browser-like environment
  testEnvironment: 'jsdom',
  // Setup files specific to E2E tests
  setupFilesAfterEnv: [
    '<rootDir>/../utils/setup.js',
    '<rootDir>/../utils/e2e-setup.js',
  ],
};
