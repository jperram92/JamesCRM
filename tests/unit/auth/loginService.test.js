/**
 * Unit tests for login service
 */

describe('Login Service', () => {
  // Mock dependencies
  const mockUserRepository = {
    findByEmail: jest.fn()
  };
  
  const mockTokenService = {
    generateToken: jest.fn()
  };
  
  const mockPasswordService = {
    comparePassword: jest.fn()
  };
  
  // Mock login service
  const loginService = {
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
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUserRepository.findByEmail.mockImplementation((email) => {
      if (email === 'active@example.com') {
        return {
          id: 1,
          email,
          password: 'hashed_password',
          first_name: 'Active',
          last_name: 'User',
          role: 'user',
          status: 'active'
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
          status: 'inactive'
        };
      }
      
      if (email === 'admin@example.com') {
        return {
          id: 3,
          email,
          password: 'hashed_password',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          status: 'active'
        };
      }
      
      return null;
    });
    
    mockTokenService.generateToken.mockResolvedValue('jwt_token');
    
    mockPasswordService.comparePassword.mockImplementation((password, hashedPassword) => {
      return Promise.resolve(password === 'correct_password');
    });
  });

  describe('login', () => {
    test('should login a user with valid credentials', async () => {
      // Arrange
      const credentials = {
        email: 'active@example.com',
        password: 'correct_password'
      };
      
      // Act
      const result = await loginService.login(credentials);
      
      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(mockPasswordService.comparePassword).toHaveBeenCalledWith(credentials.password, 'hashed_password');
      
      expect(mockTokenService.generateToken).toHaveBeenCalledWith({
        id: 1,
        email: credentials.email,
        role: 'user'
      });
      
      expect(result).toEqual({
        user: {
          id: 1,
          email: credentials.email,
          first_name: 'Active',
          last_name: 'User',
          role: 'user'
        },
        token: 'jwt_token'
      });
    });
    
    test('should login an admin user with valid credentials', async () => {
      // Arrange
      const credentials = {
        email: 'admin@example.com',
        password: 'correct_password'
      };
      
      // Act
      const result = await loginService.login(credentials);
      
      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(mockPasswordService.comparePassword).toHaveBeenCalledWith(credentials.password, 'hashed_password');
      
      expect(mockTokenService.generateToken).toHaveBeenCalledWith({
        id: 3,
        email: credentials.email,
        role: 'admin'
      });
      
      expect(result).toEqual({
        user: {
          id: 3,
          email: credentials.email,
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin'
        },
        token: 'jwt_token'
      });
    });
    
    test('should throw error with invalid password', async () => {
      // Arrange
      const credentials = {
        email: 'active@example.com',
        password: 'wrong_password'
      };
      
      // Act & Assert
      await expect(loginService.login(credentials))
        .rejects.toThrow('Invalid email or password');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(mockPasswordService.comparePassword).toHaveBeenCalledWith(credentials.password, 'hashed_password');
      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
    });
    
    test('should throw error with non-existent email', async () => {
      // Arrange
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      // Act & Assert
      await expect(loginService.login(credentials))
        .rejects.toThrow('Invalid email or password');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(mockPasswordService.comparePassword).not.toHaveBeenCalled();
      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
    });
    
    test('should throw error when user is inactive', async () => {
      // Arrange
      const credentials = {
        email: 'inactive@example.com',
        password: 'correct_password'
      };
      
      // Act & Assert
      await expect(loginService.login(credentials))
        .rejects.toThrow('User account is not active');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(mockPasswordService.comparePassword).not.toHaveBeenCalled();
      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
    });
    
    test('should throw error when email is missing', async () => {
      // Arrange
      const incompleteCredentials = {
        // Missing email
        password: 'password123'
      };
      
      // Act & Assert
      await expect(loginService.login(incompleteCredentials))
        .rejects.toThrow('Email and password are required');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockPasswordService.comparePassword).not.toHaveBeenCalled();
      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
    });
    
    test('should throw error when password is missing', async () => {
      // Arrange
      const incompleteCredentials = {
        email: 'active@example.com'
        // Missing password
      };
      
      // Act & Assert
      await expect(loginService.login(incompleteCredentials))
        .rejects.toThrow('Email and password are required');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockPasswordService.comparePassword).not.toHaveBeenCalled();
      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
    });
  });
});
