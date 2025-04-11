/**
 * Jest configuration for JamesCRM tests
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test files pattern
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // Coverage settings
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'tests/**/*.js',
    '!tests/config/**',
    '!tests/mocks/**',
    '!tests/utils/**',
    '!**/node_modules/**'
  ],
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true
};
