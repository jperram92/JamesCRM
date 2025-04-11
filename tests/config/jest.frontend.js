/**
 * Jest configuration for frontend tests
 */
const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  // Use jsdom environment for frontend tests
  testEnvironment: 'jsdom',
  // Frontend test specific settings
  testMatch: [
    '<rootDir>/unit/frontend/**/*.test.js',
    '<rootDir>/unit/frontend/**/*.test.jsx',
    '<rootDir>/unit/frontend/**/*.spec.js',
    '<rootDir>/unit/frontend/**/*.spec.jsx',
  ],
  // Setup files specific to frontend tests
  setupFilesAfterEnv: [
    '<rootDir>/utils/setup.js',
    '<rootDir>/utils/frontend-setup.js',
  ],
  // Mock all external dependencies
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/mocks/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/mocks/fileMock.js',
  },
  // Explicitly set the transform for JSX files
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  // Make sure babel config is used
  transformIgnorePatterns: [
    '/node_modules/(?!(@testing-library)/)',
  ],
  // Point to the babel config
  rootDir: '../',
};
