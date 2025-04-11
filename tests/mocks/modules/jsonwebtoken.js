/**
 * Mock implementation of jsonwebtoken module
 */

module.exports = {
  sign: jest.fn(() => 'mock-token'),
  verify: jest.fn((token, secret) => {
    if (token === 'valid-token') {
      return { id: 1, role: 'admin' };
    } else {
      throw new Error('Invalid token');
    }
  })
};
