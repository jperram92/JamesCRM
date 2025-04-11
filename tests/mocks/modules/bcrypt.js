/**
 * Mock implementation of bcrypt module
 */

module.exports = {
  compare: jest.fn().mockImplementation((password, hash) => {
    // Simple mock implementation that returns true if password is 'password123'
    return Promise.resolve(password === 'password123');
  }),
  hash: jest.fn().mockImplementation((password, saltRounds) => {
    // Simple mock implementation that returns a fixed hash
    return Promise.resolve('hashed-password');
  })
};
