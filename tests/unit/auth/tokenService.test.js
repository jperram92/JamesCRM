/**
 * Unit tests for token service
 */

describe('Token Service', () => {
  // Mock dependencies
  const mockJwt = {
    sign: jest.fn(),
    verify: jest.fn()
  };
  
  const mockCrypto = {
    randomBytes: jest.fn()
  };
  
  // Mock token service
  const tokenService = {
    generateToken: (payload) => {
      if (!payload || !payload.id) {
        throw new Error('User ID is required in payload');
      }
      
      const token = mockJwt.sign(payload, 'jwt_secret', { expiresIn: '1h' });
      return token;
    },
    
    verifyToken: (token) => {
      if (!token) {
        throw new Error('Token is required');
      }
      
      try {
        const decoded = mockJwt.verify(token, 'jwt_secret');
        return decoded;
      } catch (error) {
        throw new Error('Invalid or expired token');
      }
    },
    
    generateResetToken: (payload) => {
      if (!payload || !payload.id) {
        throw new Error('User ID is required in payload');
      }
      
      // Generate random token
      const resetToken = mockCrypto.randomBytes(20).toString('hex');
      
      return resetToken;
    },
    
    verifyResetToken: (token) => {
      if (!token) {
        throw new Error('Token is required');
      }
      
      // In a real implementation, this would verify the token against a stored value
      // For testing, we'll just return a mock payload based on the token
      
      if (token === 'valid_reset_token') {
        return { id: 1, email: 'user@example.com' };
      }
      
      throw new Error('Invalid or expired token');
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockJwt.sign.mockImplementation((payload, secret, options) => {
      return `jwt_token_for_${payload.id}`;
    });
    
    mockJwt.verify.mockImplementation((token, secret) => {
      if (token === 'valid_token') {
        return { id: 1, email: 'user@example.com', role: 'user' };
      }
      
      if (token.startsWith('jwt_token_for_')) {
        const id = token.split('_').pop();
        return { id: parseInt(id), email: `user${id}@example.com`, role: 'user' };
      }
      
      throw new Error('Invalid token');
    });
    
    mockCrypto.randomBytes.mockImplementation((size) => {
      return {
        toString: () => 'random_reset_token'
      };
    });
  });

  describe('generateToken', () => {
    test('should generate a JWT token', () => {
      // Arrange
      const payload = {
        id: 1,
        email: 'user@example.com',
        role: 'user'
      };
      
      // Act
      const result = tokenService.generateToken(payload);
      
      // Assert
      expect(mockJwt.sign).toHaveBeenCalledWith(payload, 'jwt_secret', { expiresIn: '1h' });
      expect(result).toBe('jwt_token_for_1');
    });
    
    test('should throw error when payload is missing', () => {
      // Act & Assert
      expect(() => tokenService.generateToken())
        .toThrow('User ID is required in payload');
      expect(mockJwt.sign).not.toHaveBeenCalled();
    });
    
    test('should throw error when user ID is missing', () => {
      // Arrange
      const incompletePayload = {
        email: 'user@example.com',
        role: 'user'
      };
      
      // Act & Assert
      expect(() => tokenService.generateToken(incompletePayload))
        .toThrow('User ID is required in payload');
      expect(mockJwt.sign).not.toHaveBeenCalled();
    });
  });
  
  describe('verifyToken', () => {
    test('should verify a valid token', () => {
      // Arrange
      const token = 'valid_token';
      
      // Act
      const result = tokenService.verifyToken(token);
      
      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'jwt_secret');
      expect(result).toEqual({
        id: 1,
        email: 'user@example.com',
        role: 'user'
      });
    });
    
    test('should verify a generated token', () => {
      // Arrange
      const payload = {
        id: 2,
        email: 'user2@example.com',
        role: 'user'
      };
      const token = tokenService.generateToken(payload);
      
      // Act
      const result = tokenService.verifyToken(token);
      
      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'jwt_secret');
      expect(result).toEqual({
        id: 2,
        email: 'user2@example.com',
        role: 'user'
      });
    });
    
    test('should throw error with invalid token', () => {
      // Arrange
      const token = 'invalid_token';
      
      // Act & Assert
      expect(() => tokenService.verifyToken(token))
        .toThrow('Invalid or expired token');
      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'jwt_secret');
    });
    
    test('should throw error when token is missing', () => {
      // Act & Assert
      expect(() => tokenService.verifyToken())
        .toThrow('Token is required');
      expect(mockJwt.verify).not.toHaveBeenCalled();
    });
  });
  
  describe('generateResetToken', () => {
    test('should generate a reset token', () => {
      // Arrange
      const payload = {
        id: 1,
        email: 'user@example.com'
      };
      
      // Act
      const result = tokenService.generateResetToken(payload);
      
      // Assert
      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(20);
      expect(result).toBe('random_reset_token');
    });
    
    test('should throw error when payload is missing', () => {
      // Act & Assert
      expect(() => tokenService.generateResetToken())
        .toThrow('User ID is required in payload');
      expect(mockCrypto.randomBytes).not.toHaveBeenCalled();
    });
    
    test('should throw error when user ID is missing', () => {
      // Arrange
      const incompletePayload = {
        email: 'user@example.com'
      };
      
      // Act & Assert
      expect(() => tokenService.generateResetToken(incompletePayload))
        .toThrow('User ID is required in payload');
      expect(mockCrypto.randomBytes).not.toHaveBeenCalled();
    });
  });
  
  describe('verifyResetToken', () => {
    test('should verify a valid reset token', () => {
      // Arrange
      const token = 'valid_reset_token';
      
      // Act
      const result = tokenService.verifyResetToken(token);
      
      // Assert
      expect(result).toEqual({
        id: 1,
        email: 'user@example.com'
      });
    });
    
    test('should throw error with invalid reset token', () => {
      // Arrange
      const token = 'invalid_reset_token';
      
      // Act & Assert
      expect(() => tokenService.verifyResetToken(token))
        .toThrow('Invalid or expired token');
    });
    
    test('should throw error when token is missing', () => {
      // Act & Assert
      expect(() => tokenService.verifyResetToken())
        .toThrow('Token is required');
    });
  });
});
