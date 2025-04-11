/**
 * Unit tests for register service
 */

describe('Register Service', () => {
  // Mock dependencies
  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn()
  };
  
  const mockTokenService = {
    generateToken: jest.fn()
  };
  
  const mockPasswordService = {
    hashPassword: jest.fn()
  };
  
  // Mock register service
  const registerService = {
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
      
      return null;
    });
    
    mockUserRepository.create.mockImplementation((userData) => ({
      id: 2,
      ...userData
    }));
    
    mockTokenService.generateToken.mockResolvedValue('jwt_token');
    
    mockPasswordService.hashPassword.mockResolvedValue('hashed_password');
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
      const result = await registerService.register(userData);
      
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
        id: 2,
        email: userData.email,
        role: 'user'
      });
      
      expect(result).toEqual({
        user: {
          id: 2,
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
      const result = await registerService.register(userData);
      
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
      await expect(registerService.register(userData))
        .rejects.toThrow('User with this email already exists');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
    
    test('should throw error when email is missing', async () => {
      // Arrange
      const incompleteData = {
        // Missing email
        password: 'password123',
        first_name: 'New',
        last_name: 'User'
      };
      
      // Act & Assert
      await expect(registerService.register(incompleteData))
        .rejects.toThrow('Email, password, first name, and last name are required');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
    
    test('should throw error when password is missing', async () => {
      // Arrange
      const incompleteData = {
        email: 'new@example.com',
        // Missing password
        first_name: 'New',
        last_name: 'User'
      };
      
      // Act & Assert
      await expect(registerService.register(incompleteData))
        .rejects.toThrow('Email, password, first name, and last name are required');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
    
    test('should throw error when first name is missing', async () => {
      // Arrange
      const incompleteData = {
        email: 'new@example.com',
        password: 'password123',
        // Missing first_name
        last_name: 'User'
      };
      
      // Act & Assert
      await expect(registerService.register(incompleteData))
        .rejects.toThrow('Email, password, first name, and last name are required');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
    
    test('should throw error when last name is missing', async () => {
      // Arrange
      const incompleteData = {
        email: 'new@example.com',
        password: 'password123',
        first_name: 'New'
        // Missing last_name
      };
      
      // Act & Assert
      await expect(registerService.register(incompleteData))
        .rejects.toThrow('Email, password, first name, and last name are required');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });
});
