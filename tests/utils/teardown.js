/**
 * Common teardown for all tests
 */

// Clean up any global mocks
afterEach(() => {
  jest.clearAllMocks();
});

// Clean up any database connections
afterAll(async () => {
  // Close database connections if any
  if (global.sequelize) {
    await global.sequelize.close();
  }
  
  // Close any other resources
  console.log('Test environment torn down');
});
