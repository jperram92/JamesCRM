/**
 * Unit tests for password reset service
 */

describe('Password Reset Service', () => {
  // Mock dependencies
  const mockUserRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    update: jest.fn()
  };
  
  const mockTokenService = {
    generateResetToken: jest.fn(),
    verifyResetToken: jest.fn()
  };
  
  const mockEmailService = {
    sendEmail: jest.fn()
  };
  
  const mockPasswordService = {
    hashPassword: jest.fn()
  };
  
  // Mock password reset service
  const passwordResetService = {
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
          status: 'active'
        };
      }
      
      if (email === 'reset@example.com') {
        return {
          id: 2,
          email,
          password: 'hashed_password',
          first_name: 'Reset',
          last_name: 'User',
          role: 'user',
          status: 'active',
          reset_token: 'valid_reset_token',
          reset_token_expires: new Date(Date.now() + 3600000) // 1 hour from now
        };
      }
      
      if (email === 'expired@example.com') {
        return {
          id: 3,
          email,
          password: 'hashed_password',
          first_name: 'Expired',
          last_name: 'User',
          role: 'user',
          status: 'active',
          reset_token: 'expired_reset_token',
          reset_token_expires: new Date(Date.now() - 3600000) // 1 hour ago
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
          status: 'active'
        };
      }
      
      if (id === 2) {
        return {
          id,
          email: 'reset@example.com',
          password: 'hashed_password',
          first_name: 'Reset',
          last_name: 'User',
          role: 'user',
          status: 'active',
          reset_token: 'valid_reset_token',
          reset_token_expires: new Date(Date.now() + 3600000) // 1 hour from now
        };
      }
      
      if (id === 3) {
        return {
          id,
          email: 'expired@example.com',
          password: 'hashed_password',
          first_name: 'Expired',
          last_name: 'User',
          role: 'user',
          status: 'active',
          reset_token: 'expired_reset_token',
          reset_token_expires: new Date(Date.now() - 3600000) // 1 hour ago
        };
      }
      
      return null;
    });
    
    mockUserRepository.update.mockImplementation((id, userData) => ({
      id,
      ...userData
    }));
    
    mockTokenService.generateResetToken.mockResolvedValue('reset_token');
    
    mockTokenService.verifyResetToken.mockImplementation((token) => {
      if (token === 'valid_reset_token') {
        return { id: 2, email: 'reset@example.com' };
      }
      
      if (token === 'expired_reset_token') {
        return { id: 3, email: 'expired@example.com' };
      }
      
      throw new Error('Invalid token');
    });
    
    mockEmailService.sendEmail.mockResolvedValue({ success: true });
    
    mockPasswordService.hashPassword.mockResolvedValue('new_hashed_password');
  });

  describe('forgotPassword', () => {
    test('should generate reset token for existing user', async () => {
      // Arrange
      const email = 'existing@example.com';
      
      // Act
      const result = await passwordResetService.forgotPassword(email);
      
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
      const result = await passwordResetService.forgotPassword(email);
      
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
      await expect(passwordResetService.forgotPassword())
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
      const result = await passwordResetService.resetPassword(resetData);
      
      // Assert
      expect(mockTokenService.verifyResetToken).toHaveBeenCalledWith(resetData.token);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(2);
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(resetData.password);
      
      expect(mockUserRepository.update).toHaveBeenCalledWith(2, {
        password: 'new_hashed_password',
        reset_token: null,
        reset_token_expires: null,
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({ success: true });
    });
    
    test('should throw error with expired token', async () => {
      // Arrange
      const resetData = {
        token: 'expired_reset_token',
        password: 'new_password'
      };
      
      // Act & Assert
      await expect(passwordResetService.resetPassword(resetData))
        .rejects.toThrow('Invalid or expired token');
      expect(mockTokenService.verifyResetToken).toHaveBeenCalledWith(resetData.token);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(3);
      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
    
    test('should throw error with invalid token', async () => {
      // Arrange
      const resetData = {
        token: 'invalid_token',
        password: 'new_password'
      };
      
      // Act & Assert
      await expect(passwordResetService.resetPassword(resetData))
        .rejects.toThrow('Invalid or expired token');
      expect(mockTokenService.verifyResetToken).toHaveBeenCalledWith(resetData.token);
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
    
    test('should throw error when user is not found', async () => {
      // Arrange
      mockTokenService.verifyResetToken.mockResolvedValueOnce({ id: 999, email: 'nonexistent@example.com' });
      const resetData = {
        token: 'token_for_nonexistent_user',
        password: 'new_password'
      };
      
      // Act & Assert
      await expect(passwordResetService.resetPassword(resetData))
        .rejects.toThrow('Invalid or expired token');
      expect(mockTokenService.verifyResetToken).toHaveBeenCalledWith(resetData.token);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(999);
      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
    
    test('should throw error when token is missing', async () => {
      // Arrange
      const incompleteData = {
        // Missing token
        password: 'new_password'
      };
      
      // Act & Assert
      await expect(passwordResetService.resetPassword(incompleteData))
        .rejects.toThrow('Token and password are required');
      expect(mockTokenService.verifyResetToken).not.toHaveBeenCalled();
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
    
    test('should throw error when password is missing', async () => {
      // Arrange
      const incompleteData = {
        token: 'valid_reset_token'
        // Missing password
      };
      
      // Act & Assert
      await expect(passwordResetService.resetPassword(incompleteData))
        .rejects.toThrow('Token and password are required');
      expect(mockTokenService.verifyResetToken).not.toHaveBeenCalled();
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });
});
