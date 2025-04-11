/**
 * Unit tests for authentication service
 */

describe('Authentication Service', () => {
  // Mock dependencies
  const mockUserRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  };

  const mockTokenService = {
    generateToken: jest.fn(),
    verifyToken: jest.fn(),
    generateResetToken: jest.fn(),
    verifyResetToken: jest.fn()
  };

  const mockEmailService = {
    sendEmail: jest.fn()
  };

  const mockPasswordService = {
    hashPassword: jest.fn(),
    comparePassword: jest.fn()
  };

  // Mock authentication service
  const authService = {
    register: async (userData) => {
      const { email, password, first_name, last_name } = userData;

      if (!email || !password || !first_name || !last_name) {
        throw new Error('Email, password, first name, and last name are required');
      }

      // Check if user already exists
      const existingUser = await mockUserRepository.findByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await mockPasswordService.hashPassword(password);

      // Create user
      const user = await mockUserRepository.create({
        email,
        password: hashedPassword,
        first_name,
        last_name,
        role: userData.role || 'user',
        status: 'active',
        created_at: new Date()
      });

      // Generate token
      const token = await mockTokenService.generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        },
        token
      };
    },

    login: async (credentials) => {
      const { email, password } = credentials;

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Find user by email
      const user = await mockUserRepository.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (user.status !== 'active') {
        throw new Error('User account is not active');
      }

      // Verify password
      const isPasswordValid = await mockPasswordService.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = await mockTokenService.generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      // Update last login
      await mockUserRepository.update(user.id, {
        last_login: new Date()
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        },
        token
      };
    },

    verifyToken: async (token) => {
      if (!token) {
        throw new Error('Token is required');
      }

      try {
        // Verify token
        const decoded = await mockTokenService.verifyToken(token);

        // Find user
        const user = await mockUserRepository.findById(decoded.id);
        if (!user) {
          throw new Error('User not found');
        }

        // Check if user is active
        if (user.status !== 'active') {
          throw new Error('User account is not active');
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role
        };
      } catch (error) {
        // Re-throw the original error message
        throw error;
      }
    },

    forgotPassword: async (email) => {
      if (!email) {
        throw new Error('Email is required');
      }

      // Find user by email
      const user = await mockUserRepository.findByEmail(email);
      if (!user) {
        // Don't reveal that the user doesn't exist
        return { success: true };
      }

      // Generate reset token
      const resetToken = await mockTokenService.generateResetToken({
        id: user.id,
        email: user.email
      });

      // Save reset token and expiry
      await mockUserRepository.update(user.id, {
        reset_token: resetToken,
        reset_token_expires: new Date(Date.now() + 3600000) // 1 hour
      });

      // Send reset email
      await mockEmailService.sendEmail({
        to: user.email,
        subject: 'Password Reset',
        body: `Use this token to reset your password: ${resetToken}`
      });

      return { success: true };
    },

    resetPassword: async (resetData) => {
      const { token, password } = resetData;

      if (!token || !password) {
        throw new Error('Token and password are required');
      }

      try {
        // Verify reset token
        const decoded = await mockTokenService.verifyResetToken(token);

        // Find user
        const user = await mockUserRepository.findById(decoded.id);
        if (!user) {
          throw new Error('User not found');
        }

        // Check if token matches and is not expired
        if (user.reset_token !== token || new Date() > new Date(user.reset_token_expires)) {
          throw new Error('Invalid or expired token');
        }

        // Hash new password
        const hashedPassword = await mockPasswordService.hashPassword(password);

        // Update password and clear reset token
        await mockUserRepository.update(user.id, {
          password: hashedPassword,
          reset_token: null,
          reset_token_expires: null,
          updated_at: new Date()
        });

        return { success: true };
      } catch (error) {
        throw new Error('Invalid or expired token');
      }
    },

    changePassword: async (userId, passwordData) => {
      const { currentPassword, newPassword } = passwordData;

      if (!userId || !currentPassword || !newPassword) {
        throw new Error('User ID, current password, and new password are required');
      }

      // Find user
      const user = await mockUserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isPasswordValid = await mockPasswordService.comparePassword(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await mockPasswordService.hashPassword(newPassword);

      // Update password
      await mockUserRepository.update(userId, {
        password: hashedPassword,
        updated_at: new Date()
      });

      return { success: true };
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockUserRepository.findByEmail.mockImplementation((email) => {
      if (email === 'existing@example.com') {
        return {
          id: 1,
          email,
          password: 'hashed_password',
          first_name: 'Existing',
          last_name: 'User',
          role: 'user',
          status: 'active',
          created_at: new Date('2023-01-01')
        };
      }

      if (email === 'inactive@example.com') {
        return {
          id: 2,
          email,
          password: 'hashed_password',
          first_name: 'Inactive',
          last_name: 'User',
          role: 'user',
          status: 'inactive',
          created_at: new Date('2023-01-01')
        };
      }

      if (email === 'reset@example.com') {
        return {
          id: 3,
          email,
          password: 'hashed_password',
          first_name: 'Reset',
          last_name: 'User',
          role: 'user',
          status: 'active',
          reset_token: 'valid_reset_token',
          reset_token_expires: new Date(Date.now() + 3600000), // 1 hour from now
          created_at: new Date('2023-01-01')
        };
      }

      if (email === 'expired@example.com') {
        return {
          id: 4,
          email,
          password: 'hashed_password',
          first_name: 'Expired',
          last_name: 'User',
          role: 'user',
          status: 'active',
          reset_token: 'expired_reset_token',
          reset_token_expires: new Date(Date.now() - 3600000), // 1 hour ago
          created_at: new Date('2023-01-01')
        };
      }

      return null;
    });

    mockUserRepository.findById.mockImplementation((id) => {
      if (id === 1) {
        return {
          id,
          email: 'existing@example.com',
          password: 'hashed_password',
          first_name: 'Existing',
          last_name: 'User',
          role: 'user',
          status: 'active',
          created_at: new Date('2023-01-01')
        };
      }

      if (id === 2) {
        return {
          id,
          email: 'inactive@example.com',
          password: 'hashed_password',
          first_name: 'Inactive',
          last_name: 'User',
          role: 'user',
          status: 'inactive',
          created_at: new Date('2023-01-01')
        };
      }

      if (id === 3) {
        return {
          id,
          email: 'reset@example.com',
          password: 'hashed_password',
          first_name: 'Reset',
          last_name: 'User',
          role: 'user',
          status: 'active',
          reset_token: 'valid_reset_token',
          reset_token_expires: new Date(Date.now() + 3600000), // 1 hour from now
          created_at: new Date('2023-01-01')
        };
      }

      return null;
    });

    mockUserRepository.create.mockImplementation((userData) => ({
      id: 5,
      ...userData
    }));

    mockUserRepository.update.mockImplementation((id, userData) => ({
      id,
      ...userData
    }));

    mockTokenService.generateToken.mockResolvedValue('jwt_token');

    mockTokenService.verifyToken.mockImplementation((token) => {
      if (token === 'valid_token') {
        return { id: 1, email: 'existing@example.com', role: 'user' };
      }

      if (token === 'inactive_token') {
        return { id: 2, email: 'inactive@example.com', role: 'user' };
      }

      throw new Error('Invalid or expired token');
    });

    mockTokenService.generateResetToken.mockResolvedValue('reset_token');

    mockTokenService.verifyResetToken.mockImplementation((token) => {
      if (token === 'valid_reset_token') {
        return { id: 3, email: 'reset@example.com' };
      }

      if (token === 'expired_reset_token') {
        return { id: 4, email: 'expired@example.com' };
      }

      throw new Error('Invalid token');
    });

    mockEmailService.sendEmail.mockResolvedValue({ success: true });

    mockPasswordService.hashPassword.mockResolvedValue('hashed_password');

    mockPasswordService.comparePassword.mockImplementation((password, hashedPassword) => {
      return Promise.resolve(password === 'correct_password');
    });
  });

  describe('register', () => {
    test('should register a new user', async () => {
      // Arrange
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User'
      };

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(userData.password);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: userData.email,
        password: 'hashed_password',
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: 'user',
        status: 'active',
        created_at: expect.any(Date)
      });

      expect(mockTokenService.generateToken).toHaveBeenCalledWith({
        id: 5,
        email: userData.email,
        role: 'user'
      });

      expect(result).toEqual({
        user: {
          id: 5,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: 'user'
        },
        token: 'jwt_token'
      });
    });

    test('should register a user with custom role', async () => {
      // Arrange
      const userData = {
        email: 'admin@example.com',
        password: 'password123',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      };

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        role: 'admin'
      }));

      expect(result.user.role).toBe('admin');
    });

    test('should throw error when user already exists', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        first_name: 'Existing',
        last_name: 'User'
      };

      // Act & Assert
      await expect(authService.register(userData))
        .rejects.toThrow('User with this email already exists');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    test('should throw error when required fields are missing', async () => {
      // Arrange
      const incompleteData = {
        email: 'new@example.com',
        // Missing password
        first_name: 'New',
        last_name: 'User'
      };

      // Act & Assert
      await expect(authService.register(incompleteData))
        .rejects.toThrow('Email, password, first name, and last name are required');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    test('should login a user with valid credentials', async () => {
      // Arrange
      const credentials = {
        email: 'existing@example.com',
        password: 'correct_password'
      };

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(mockPasswordService.comparePassword).toHaveBeenCalledWith(credentials.password, 'hashed_password');

      expect(mockTokenService.generateToken).toHaveBeenCalledWith({
        id: 1,
        email: credentials.email,
        role: 'user'
      });

      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        last_login: expect.any(Date)
      });

      expect(result).toEqual({
        user: {
          id: 1,
          email: credentials.email,
          first_name: 'Existing',
          last_name: 'User',
          role: 'user'
        },
        token: 'jwt_token'
      });
    });

    test('should throw error with invalid password', async () => {
      // Arrange
      const credentials = {
        email: 'existing@example.com',
        password: 'wrong_password'
      };

      // Act & Assert
      await expect(authService.login(credentials))
        .rejects.toThrow('Invalid email or password');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(mockPasswordService.comparePassword).toHaveBeenCalledWith(credentials.password, 'hashed_password');
      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    test('should throw error with non-existent email', async () => {
      // Arrange
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      // Act & Assert
      await expect(authService.login(credentials))
        .rejects.toThrow('Invalid email or password');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(mockPasswordService.comparePassword).not.toHaveBeenCalled();
      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    test('should throw error when user is inactive', async () => {
      // Arrange
      const credentials = {
        email: 'inactive@example.com',
        password: 'correct_password'
      };

      // Act & Assert
      await expect(authService.login(credentials))
        .rejects.toThrow('User account is not active');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(mockPasswordService.comparePassword).not.toHaveBeenCalled();
      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    test('should throw error when credentials are missing', async () => {
      // Arrange
      const incompleteCredentials = {
        email: 'existing@example.com'
        // Missing password
      };

      // Act & Assert
      await expect(authService.login(incompleteCredentials))
        .rejects.toThrow('Email and password are required');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockPasswordService.comparePassword).not.toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    test('should verify a valid token', async () => {
      // Arrange
      const token = 'valid_token';

      // Act
      const result = await authService.verifyToken(token);

      // Assert
      expect(mockTokenService.verifyToken).toHaveBeenCalledWith(token);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);

      expect(result).toEqual({
        id: 1,
        email: 'existing@example.com',
        role: 'user'
      });
    });

    test('should throw error with invalid token', async () => {
      // Arrange
      const token = 'invalid_token';

      // Act & Assert
      await expect(authService.verifyToken(token))
        .rejects.toThrow('Invalid or expired token');
      expect(mockTokenService.verifyToken).toHaveBeenCalledWith(token);
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    test('should throw error when user is not found', async () => {
      // Arrange
      mockTokenService.verifyToken.mockResolvedValueOnce({ id: 999, email: 'nonexistent@example.com' });
      const token = 'token_for_nonexistent_user';

      // Act & Assert
      await expect(authService.verifyToken(token))
        .rejects.toThrow('User not found');
      expect(mockTokenService.verifyToken).toHaveBeenCalledWith(token);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(999);
    });

    test('should throw error when user is inactive', async () => {
      // Arrange
      const token = 'inactive_token';

      // Act & Assert
      await expect(authService.verifyToken(token))
        .rejects.toThrow('User account is not active');
      expect(mockTokenService.verifyToken).toHaveBeenCalledWith(token);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(2);
    });

    test('should throw error when token is missing', async () => {
      // Act & Assert
      await expect(authService.verifyToken())
        .rejects.toThrow('Token is required');
      expect(mockTokenService.verifyToken).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    test('should generate reset token for existing user', async () => {
      // Arrange
      const email = 'existing@example.com';

      // Act
      const result = await authService.forgotPassword(email);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockTokenService.generateResetToken).toHaveBeenCalledWith({
        id: 1,
        email
      });

      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        reset_token: 'reset_token',
        reset_token_expires: expect.any(Date)
      });

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: email,
        subject: 'Password Reset',
        body: expect.stringContaining('reset_token')
      });

      expect(result).toEqual({ success: true });
    });

    test('should not reveal non-existent user', async () => {
      // Arrange
      const email = 'nonexistent@example.com';

      // Act
      const result = await authService.forgotPassword(email);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockTokenService.generateResetToken).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();

      // Still return success to not reveal user existence
      expect(result).toEqual({ success: true });
    });

    test('should throw error when email is missing', async () => {
      // Act & Assert
      await expect(authService.forgotPassword())
        .rejects.toThrow('Email is required');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    test('should reset password with valid token', async () => {
      // Arrange
      const resetData = {
        token: 'valid_reset_token',
        password: 'new_password'
      };

      // Act
      const result = await authService.resetPassword(resetData);

      // Assert
      expect(mockTokenService.verifyResetToken).toHaveBeenCalledWith(resetData.token);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(3);
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(resetData.password);

      expect(mockUserRepository.update).toHaveBeenCalledWith(3, {
        password: 'hashed_password',
        reset_token: null,
        reset_token_expires: null,
        updated_at: expect.any(Date)
      });

      expect(result).toEqual({ success: true });
    });

    test('should throw error with invalid token', async () => {
      // Arrange
      const resetData = {
        token: 'invalid_reset_token',
        password: 'new_password'
      };

      // Act & Assert
      await expect(authService.resetPassword(resetData))
        .rejects.toThrow('Invalid or expired token');
      expect(mockTokenService.verifyResetToken).toHaveBeenCalledWith(resetData.token);
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    test('should throw error when token or password is missing', async () => {
      // Arrange
      const incompleteData = {
        token: 'valid_reset_token'
        // Missing password
      };

      // Act & Assert
      await expect(authService.resetPassword(incompleteData))
        .rejects.toThrow('Token and password are required');
      expect(mockTokenService.verifyResetToken).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    test('should change password with valid current password', async () => {
      // Arrange
      const userId = 1;
      const passwordData = {
        currentPassword: 'correct_password',
        newPassword: 'new_password'
      };

      // Act
      const result = await authService.changePassword(userId, passwordData);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockPasswordService.comparePassword).toHaveBeenCalledWith(passwordData.currentPassword, 'hashed_password');
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(passwordData.newPassword);

      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        password: 'hashed_password',
        updated_at: expect.any(Date)
      });

      expect(result).toEqual({ success: true });
    });

    test('should throw error with incorrect current password', async () => {
      // Arrange
      const userId = 1;
      const passwordData = {
        currentPassword: 'wrong_password',
        newPassword: 'new_password'
      };

      // Act & Assert
      await expect(authService.changePassword(userId, passwordData))
        .rejects.toThrow('Current password is incorrect');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockPasswordService.comparePassword).toHaveBeenCalledWith(passwordData.currentPassword, 'hashed_password');
      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    test('should throw error when user is not found', async () => {
      // Arrange
      const userId = 999;
      const passwordData = {
        currentPassword: 'correct_password',
        newPassword: 'new_password'
      };

      // Act & Assert
      await expect(authService.changePassword(userId, passwordData))
        .rejects.toThrow('User not found');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockPasswordService.comparePassword).not.toHaveBeenCalled();
      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    test('should throw error when required fields are missing', async () => {
      // Arrange
      const userId = 1;
      const incompleteData = {
        // Missing currentPassword
        newPassword: 'new_password'
      };

      // Act & Assert
      await expect(authService.changePassword(userId, incompleteData))
        .rejects.toThrow('User ID, current password, and new password are required');
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });
  });
});
