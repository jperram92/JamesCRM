/**
 * Jest configuration specifically for company model tests
 */
const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  // Only run company model tests
  testMatch: [
    '**/unit/backend/models/company.test.js',
  ],
  // Use a different database configuration
  globals: {
    ...baseConfig.globals,
    __TEST_DB__: 'company_test',
  },
  // Increase timeout for database operations
  testTimeout: 30000,
};
