/**
 * Integration tests for authentication API endpoints
 */

const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { mockUsers } = require('../../mocks/data');
const createMockApp = require('../mockApp');

// Mock bcrypt and jwt
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

// Create a mock Express app
const app = createMockApp();

// Mock User model methods
const User = app.models.User;

// Mock bcrypt methods
bcrypt.compare.mockImplementation((password, hash) => Promise.resolve(password === 'password123'));
bcrypt.hash.mockResolvedValue('hashed-password');

// Mock jwt methods
jwt.sign.mockReturnValue('mock-token');
jwt.verify.mockImplementation((token, secret, callback) => {
  if (token === 'valid-token') {
    return { id: 1, email: 'john.doe@example.com' };
  } else {
    throw new Error('Invalid token');
  }
});

describe('Authentication API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return a token when credentials are valid', async () => {
      // Arrange
      const mockUser = {
        ...mockUsers[0],
        toJSON: () => mockUsers[0],
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'password123',
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', 'mock-token');
      expect(response.body).toHaveProperty('user');
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'john.doe@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('should return 401 when user is not found', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return 401 when password is invalid', async () => {
      // Arrange
      const mockUser = {
        ...mockUsers[0],
        toJSON: () => mockUsers[0],
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'wrong-password',
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'john.doe@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong-password', mockUser.password);
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return 400 when email is missing', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(User.findOne).not.toHaveBeenCalled();
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return 400 when password is missing', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john.doe@example.com',
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(User.findOne).not.toHaveBeenCalled();
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/validate-invitation', () => {
    it('should return user data when token is valid', async () => {
      // Arrange
      const mockUser = {
        ...mockUsers[3], // Pending user
        toJSON: () => mockUsers[3],
      };
      User.findOne.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .get('/api/auth/validate-invitation')
        .query({ token: 'abc123xyz456' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', mockUser.email);
      expect(User.findOne).toHaveBeenCalledWith({
        where: {
          invitation_token: 'abc123xyz456',
          status: 'pending',
        },
      });
    });

    it('should return 400 when token is invalid', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .get('/api/auth/validate-invitation')
        .query({ token: 'invalid-token' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid or expired invitation token');
      expect(User.findOne).toHaveBeenCalledWith({
        where: {
          invitation_token: 'invalid-token',
          status: 'pending',
        },
      });
    });

    it('should return 400 when token is missing', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/validate-invitation');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(User.findOne).not.toHaveBeenCalled();
    });
  });

  // Add more tests for other auth API endpoints
});
