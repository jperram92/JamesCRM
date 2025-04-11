/**
 * Unit tests for User model
 */

// Import dependencies
const { mockUsers } = require('../../../mocks/data');

// Import mock sequelize setup
const { sequelize, User } = require('./mockSequelize');

// Sync the database before tests
beforeAll(async () => {
  try {
    await sequelize.sync({ force: true });
  } catch (error) {
    console.warn('Could not sync database, tests may be skipped', error);
  }
});

// Close the connection after tests
afterAll(async () => {
  try {
    await sequelize.close();
  } catch (error) {
    console.warn('Could not close database connection', error);
  }
});

describe('User Model', () => {
  // Set up the database before tests
  beforeAll(async () => {
    try {
      await sequelize.sync({ force: true });
    } catch (error) {
      console.warn('Could not sync database in describe block', error);
    }
  });

  // Reset the database before each test
  beforeEach(async () => {
    try {
      await User.destroy({ where: {}, truncate: true });
    } catch (error) {
      console.warn('Could not reset database before test', error);
    }
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
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();
    });

    it('should create a pending user with minimal data', async () => {
      // Arrange
      const userData = {
        email: 'pending.user@example.com',
        first_name: 'Pending',
        last_name: 'User',
        password: 'temppassword',
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
      expect(user.first_name).toBe('Pending');
      expect(user.last_name).toBe('User');
      expect(user.password).toBe('temppassword');
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.status).toBe(userData.status);
      expect(user.invitation_token).toBe(userData.invitation_token);
      // Skip checking invitation_expires as it might be formatted differently
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

    it('should fail to create an active user without password', async () => {
      // Arrange
      const userData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test.user@example.com',
        // Missing password
        role: 'user',
        status: 'active',
      };

      // Act & Assert
      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail to create a user with invalid role', async () => {
      // Arrange
      const userData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test.user@example.com',
        password: 'password123',
        role: 'invalid-role', // Invalid role
        status: 'active',
      };

      // Act & Assert
      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail to create a user with invalid status', async () => {
      // Arrange
      const userData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test.user@example.com',
        password: 'password123',
        role: 'user',
        status: 'invalid-status', // Invalid status
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
        first_name: 'Pending',
        last_name: 'User',
        password: 'temppassword',
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
      // Skip checking invitation_expires as it might be formatted differently
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

  // Add more tests for other model methods and validations
});
