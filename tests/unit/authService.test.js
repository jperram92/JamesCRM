/**
 * Unit tests for authentication service
 */

describe('Authentication Service', () => {
  // Mock dependencies
  const mockBcrypt = {
    hash: jest.fn(),
    compare: jest.fn()
  };

  const mockJwt = {
    sign: jest.fn(),
    verify: jest.fn()
  };

  const mockUserRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  };

  // Mock auth service
  const authService = {
    login: async (email, password) => {
      const user = await mockUserRepository.findByEmail(email);

      if (!user) {
        throw new Error('User not found');
      }

      const isPasswordValid = await mockBcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      const token = mockJwt.sign(
        { id: user.id, email: user.email, role: user.role },
        'secret-key',
        { expiresIn: '1h' }
      );

      return { token, user: { id: user.id, email: user.email, role: user.role } };
    },

    register: async (userData) => {
      const existingUser = await mockUserRepository.findByEmail(userData.email);

      if (existingUser) {
        throw new Error('Email already in use');
      }

      const hashedPassword = await mockBcrypt.hash(userData.password, 10);

      const user = await mockUserRepository.create({
        ...userData,
        password: hashedPassword,
        role: userData.role || 'user'
      });

      const token = mockJwt.sign(
        { id: user.id, email: user.email, role: user.role },
        'secret-key',
        { expiresIn: '1h' }
      );

      return { token, user: { id: user.id, email: user.email, role: user.role } };
    },

    verifyToken: async (token) => {
      try {
        const decoded = mockJwt.verify(token, 'secret-key');
        const user = await mockUserRepository.findById(decoded.id);

        if (!user) {
          throw new Error('User not found');
        }

        return { id: user.id, email: user.email, role: user.role };
      } catch (error) {
        if (error.message === 'User not found') {
          throw error;
        }
        throw new Error('Invalid token');
      }
    },

    changePassword: async (userId, currentPassword, newPassword) => {
      const user = await mockUserRepository.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const isPasswordValid = await mockBcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      const hashedPassword = await mockBcrypt.hash(newPassword, 10);

      await mockUserRepository.update(userId, { password: hashedPassword });

      return true;
    },

    resetPasswordRequest: async (email) => {
      const user = await mockUserRepository.findByEmail(email);

      if (!user) {
        throw new Error('User not found');
      }

      const resetToken = mockJwt.sign(
        { id: user.id, email: user.email, purpose: 'password-reset' },
        'reset-secret-key',
        { expiresIn: '1h' }
      );

      await mockUserRepository.update(user.id, { resetToken });

      return resetToken;
    },

    resetPassword: async (resetToken, newPassword) => {
      try {
        const decoded = mockJwt.verify(resetToken, 'reset-secret-key');

        if (decoded.purpose !== 'password-reset') {
          throw new Error('Invalid token purpose');
        }

        const user = await mockUserRepository.findById(decoded.id);

        if (!user || user.resetToken !== resetToken) {
          throw new Error('Invalid or expired token');
        }

        const hashedPassword = await mockBcrypt.hash(newPassword, 10);

        await mockUserRepository.update(user.id, {
          password: hashedPassword,
          resetToken: null
        });

        return true;
      } catch (error) {
        if (error.message === 'Invalid token purpose') {
          throw error;
        }
        throw new Error('Invalid or expired token');
      }
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockBcrypt.hash.mockReset();
    mockBcrypt.compare.mockReset();
    mockJwt.sign.mockReset();
    mockJwt.verify.mockReset();
    mockUserRepository.findByEmail.mockReset();
    mockUserRepository.findById.mockReset();
    mockUserRepository.create.mockReset();
    mockUserRepository.update.mockReset();

    // Default mock implementations
    mockBcrypt.hash.mockImplementation((password) => `hashed_${password}`);
    mockBcrypt.compare.mockImplementation((password, hash) => hash === `hashed_${password}`);
    mockJwt.sign.mockImplementation(() => 'mock-token');
    mockJwt.verify.mockImplementation(() => ({ id: 1, email: 'test@example.com', role: 'user' }));
  });

  describe('login', () => {
    test('should login successfully with valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = {
        id: 1,
        email,
        password: 'hashed_password123',
        role: 'user'
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);
      mockJwt.sign.mockReturnValue('mock-token');

      // Act
      const result = await authService.login(email, password);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        'secret-key',
        { expiresIn: '1h' }
      );

      expect(result).toEqual({
        token: 'mock-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role
        }
      });
    });

    test('should throw error when user is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'password123';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow('User not found');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
      expect(mockJwt.sign).not.toHaveBeenCalled();
    });

    test('should throw error when password is invalid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const mockUser = {
        id: 1,
        email,
        password: 'hashed_password123',
        role: 'user'
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow('Invalid password');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(mockJwt.sign).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    test('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User'
      };

      const createdUser = {
        id: 1,
        email: userData.email,
        password: 'hashed_password123',
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: 'user'
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashed_password123');
      mockUserRepository.create.mockResolvedValue(createdUser);
      mockJwt.sign.mockReturnValue('mock-token');

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...userData,
        password: 'hashed_password123',
        role: 'user'
      });
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { id: createdUser.id, email: createdUser.email, role: createdUser.role },
        'secret-key',
        { expiresIn: '1h' }
      );

      expect(result).toEqual({
        token: 'mock-token',
        user: {
          id: createdUser.id,
          email: createdUser.email,
          role: createdUser.role
        }
      });
    });

    test('should register a new user with specified role', async () => {
      // Arrange
      const userData = {
        email: 'admin@example.com',
        password: 'password123',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      };

      const createdUser = {
        id: 1,
        email: userData.email,
        password: 'hashed_password123',
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: 'admin'
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashed_password123');
      mockUserRepository.create.mockResolvedValue(createdUser);
      mockJwt.sign.mockReturnValue('mock-token');

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...userData,
        password: 'hashed_password123',
        role: 'admin'
      });

      expect(result.user.role).toBe('admin');
    });

    test('should throw error when email is already in use', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User'
      };

      const existingUser = {
        id: 1,
        email: userData.email,
        password: 'hashed_password123',
        role: 'user'
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow('Email already in use');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockJwt.sign).not.toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    test('should verify a valid token', async () => {
      // Arrange
      const token = 'valid-token';
      const decodedToken = { id: 1, email: 'test@example.com', role: 'user' };
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'user'
      };

      mockJwt.verify.mockReturnValue(decodedToken);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await authService.verifyToken(token);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'secret-key');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(decodedToken.id);
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      });
    });

    test('should throw error when token is invalid', async () => {
      // Arrange
      const token = 'invalid-token';

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(authService.verifyToken(token)).rejects.toThrow('Invalid token');
      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'secret-key');
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    test('should throw error when user is not found', async () => {
      // Arrange
      const token = 'valid-token';
      const decodedToken = { id: 999, email: 'nonexistent@example.com', role: 'user' };

      mockJwt.verify.mockReturnValue(decodedToken);
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.verifyToken(token)).rejects.toThrow('User not found');
      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'secret-key');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(decodedToken.id);
    });
  });

  describe('changePassword', () => {
    test('should change password successfully', async () => {
      // Arrange
      const userId = 1;
      const currentPassword = 'password123';
      const newPassword = 'newpassword123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        password: 'hashed_password123',
        role: 'user'
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);
      mockBcrypt.hash.mockResolvedValue('hashed_newpassword123');
      mockUserRepository.update.mockResolvedValue(true);

      // Act
      const result = await authService.changePassword(userId, currentPassword, newPassword);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(currentPassword, mockUser.password);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, { password: 'hashed_newpassword123' });
      expect(result).toBe(true);
    });

    test('should throw error when user is not found', async () => {
      // Arrange
      const userId = 999;
      const currentPassword = 'password123';
      const newPassword = 'newpassword123';

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.changePassword(userId, currentPassword, newPassword)).rejects.toThrow('User not found');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    test('should throw error when current password is incorrect', async () => {
      // Arrange
      const userId = 1;
      const currentPassword = 'wrongpassword';
      const newPassword = 'newpassword123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        password: 'hashed_password123',
        role: 'user'
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(authService.changePassword(userId, currentPassword, newPassword)).rejects.toThrow('Current password is incorrect');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(currentPassword, mockUser.password);
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('resetPasswordRequest', () => {
    test('should generate reset token successfully', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockUser = {
        id: 1,
        email,
        password: 'hashed_password123',
        role: 'user'
      };
      const resetToken = 'reset-token';

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockJwt.sign.mockReturnValue(resetToken);
      mockUserRepository.update.mockResolvedValue(true);

      // Act
      const result = await authService.resetPasswordRequest(email);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { id: mockUser.id, email: mockUser.email, purpose: 'password-reset' },
        'reset-secret-key',
        { expiresIn: '1h' }
      );
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, { resetToken });
      expect(result).toBe(resetToken);
    });

    test('should throw error when user is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.resetPasswordRequest(email)).rejects.toThrow('User not found');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockJwt.sign).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    test('should reset password successfully', async () => {
      // Arrange
      const resetToken = 'valid-reset-token';
      const newPassword = 'newpassword123';
      const decodedToken = {
        id: 1,
        email: 'test@example.com',
        purpose: 'password-reset'
      };
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password123',
        resetToken: 'valid-reset-token',
        role: 'user'
      };

      mockJwt.verify.mockReturnValue(decodedToken);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockBcrypt.hash.mockResolvedValue('hashed_newpassword123');
      mockUserRepository.update.mockResolvedValue(true);

      // Act
      const result = await authService.resetPassword(resetToken, newPassword);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith(resetToken, 'reset-secret-key');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(decodedToken.id);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, {
        password: 'hashed_newpassword123',
        resetToken: null
      });
      expect(result).toBe(true);
    });

    test('should throw error when token is invalid', async () => {
      // Arrange
      const resetToken = 'invalid-reset-token';
      const newPassword = 'newpassword123';

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(authService.resetPassword(resetToken, newPassword)).rejects.toThrow('Invalid or expired token');
      expect(mockJwt.verify).toHaveBeenCalledWith(resetToken, 'reset-secret-key');
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    test('should throw error when token purpose is invalid', async () => {
      // Arrange
      const resetToken = 'valid-token-wrong-purpose';
      const newPassword = 'newpassword123';
      const decodedToken = {
        id: 1,
        email: 'test@example.com',
        purpose: 'wrong-purpose'
      };

      mockJwt.verify.mockReturnValue(decodedToken);

      // Act & Assert
      await expect(authService.resetPassword(resetToken, newPassword)).rejects.toThrow('Invalid token purpose');
      expect(mockJwt.verify).toHaveBeenCalledWith(resetToken, 'reset-secret-key');
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    test('should throw error when user is not found', async () => {
      // Arrange
      const resetToken = 'valid-reset-token';
      const newPassword = 'newpassword123';
      const decodedToken = {
        id: 999,
        email: 'nonexistent@example.com',
        purpose: 'password-reset'
      };

      mockJwt.verify.mockReturnValue(decodedToken);
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.resetPassword(resetToken, newPassword)).rejects.toThrow('Invalid or expired token');
      expect(mockJwt.verify).toHaveBeenCalledWith(resetToken, 'reset-secret-key');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(decodedToken.id);
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    test('should throw error when reset token does not match', async () => {
      // Arrange
      const resetToken = 'valid-reset-token';
      const newPassword = 'newpassword123';
      const decodedToken = {
        id: 1,
        email: 'test@example.com',
        purpose: 'password-reset'
      };
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password123',
        resetToken: 'different-reset-token',
        role: 'user'
      };

      mockJwt.verify.mockReturnValue(decodedToken);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.resetPassword(resetToken, newPassword)).rejects.toThrow('Invalid or expired token');
      expect(mockJwt.verify).toHaveBeenCalledWith(resetToken, 'reset-secret-key');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(decodedToken.id);
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });
});
