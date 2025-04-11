/**
 * Unit tests for User model
 */

// Import dependencies
const { Sequelize } = require('sequelize');

// Create a test sequelize instance
const sequelize = new Sequelize('sqlite::memory:', { logging: false });

// Import the model factory function
const UserModel = require('../../mocks/server/src/models/user');

// Initialize the model with the test sequelize instance
const User = UserModel(sequelize, Sequelize.DataTypes);

describe('User Model', () => {
  // Set up the database before tests
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  // Clean up after tests
  afterAll(async () => {
    await sequelize.close();
  });

  // Reset the database before each test
  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true });
  });

  describe('create', () => {
    it('should create a new user with valid data', async () => {
      // Arrange
      const userData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test.user@example.com',
        password: 'password123',
        role: 'user',
        status: 'active',
      };

      // Act
      const user = await User.create(userData);

      // Assert
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.first_name).toBe(userData.first_name);
      expect(user.last_name).toBe(userData.last_name);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.status).toBe(userData.status);
    });

    it('should create a pending user without first_name, last_name, and password', async () => {
      // Arrange
      const userData = {
        email: 'pending.user@example.com',
        role: 'user',
        status: 'pending',
        invitation_token: 'abc123',
        invitation_expires: new Date(Date.now() + 86400000), // 24 hours from now
      };

      // Act
      const user = await User.create(userData);

      // Assert
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.first_name).toBeNull();
      expect(user.last_name).toBeNull();
      expect(user.password).toBeNull();
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.status).toBe(userData.status);
      expect(user.invitation_token).toBe(userData.invitation_token);
      expect(user.invitation_expires).toEqual(userData.invitation_expires);
    });

    it('should fail to create a user without email', async () => {
      // Arrange
      const userData = {
        first_name: 'Test',
        last_name: 'User',
        // Missing email
        password: 'password123',
        role: 'user',
        status: 'active',
      };

      // Act & Assert
      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      // Arrange
      const userData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test.user@example.com',
        password: 'password123',
        role: 'user',
        status: 'active',
      };
      const user = await User.create(userData);

      // Act
      const updatedUser = await user.update({
        first_name: 'Updated',
        last_name: 'Name',
      });

      // Assert
      expect(updatedUser).toBeDefined();
      expect(updatedUser.id).toBe(user.id);
      expect(updatedUser.first_name).toBe('Updated');
      expect(updatedUser.last_name).toBe('Name');
      expect(updatedUser.email).toBe(userData.email);
      expect(updatedUser.role).toBe(userData.role);
      expect(updatedUser.status).toBe(userData.status);
    });

    it('should update a pending user to active', async () => {
      // Arrange
      const userData = {
        email: 'pending.user@example.com',
        role: 'user',
        status: 'pending',
        invitation_token: 'abc123',
        invitation_expires: new Date(Date.now() + 86400000), // 24 hours from now
      };
      const user = await User.create(userData);

      // Act
      const updatedUser = await user.update({
        first_name: 'Completed',
        last_name: 'Registration',
        password: 'newpassword123',
        status: 'active',
        invitation_token: null,
        invitation_expires: null,
      });

      // Assert
      expect(updatedUser).toBeDefined();
      expect(updatedUser.id).toBe(user.id);
      expect(updatedUser.first_name).toBe('Completed');
      expect(updatedUser.last_name).toBe('Registration');
      expect(updatedUser.password).toBe('newpassword123');
      expect(updatedUser.email).toBe(userData.email);
      expect(updatedUser.role).toBe(userData.role);
      expect(updatedUser.status).toBe('active');
      expect(updatedUser.invitation_token).toBeNull();
      expect(updatedUser.invitation_expires).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      // Arrange
      const userData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test.user@example.com',
        password: 'password123',
        role: 'user',
        status: 'active',
      };
      await User.create(userData);

      // Act
      const foundUser = await User.findOne({ where: { email: userData.email } });

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(userData.email);
    });

    it('should return null when user is not found', async () => {
      // Act
      const foundUser = await User.findOne({ where: { email: 'nonexistent@example.com' } });

      // Assert
      expect(foundUser).toBeNull();
    });
  });
});
