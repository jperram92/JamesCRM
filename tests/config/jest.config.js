/**
 * Base Jest configuration for all tests
 */
module.exports = {
  // Common settings for all test types
  verbose: true,
  testEnvironment: 'node',
  roots: ['<rootDir>/..'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  // Coverage settings
  collectCoverage: true,
  coverageDirectory: '<rootDir>/../coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  // Test setup files
  setupFilesAfterEnv: ['<rootDir>/../utils/setup.js'],
  // Global variables
  globals: {
    __DEV__: true,
  },
};
