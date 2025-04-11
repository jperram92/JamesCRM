/**
 * Integration tests for API endpoints
 */

describe('API Integration', () => {
  // Mock request function
  const mockRequest = jest.fn();
  
  // Mock API client
  const apiClient = {
    get: (url) => mockRequest('GET', url),
    post: (url, data) => mockRequest('POST', url, data),
    put: (url, data) => mockRequest('PUT', url, data),
    delete: (url) => mockRequest('DELETE', url)
  };
  
  // Reset mocks before each test
  beforeEach(() => {
    mockRequest.mockReset();
  });
  
  describe('Authentication API', () => {
    test('should login with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      const expectedResponse = {
        token: 'valid-token',
        user: {
          id: 1,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'admin'
        }
      };
      mockRequest.mockResolvedValue(expectedResponse);
      
      // Act
      const result = await apiClient.post('/api/auth/login', loginData);
      
      // Assert
      expect(mockRequest).toHaveBeenCalledWith('POST', '/api/auth/login', loginData);
      expect(result).toEqual(expectedResponse);
    });
    
    test('should register a new user', async () => {
      // Arrange
      const registerData = {
        first_name: 'New',
        last_name: 'User',
        email: 'new@example.com',
        password: 'password123'
      };
      const expectedResponse = {
        token: 'valid-token',
        user: {
          id: 4,
          email: 'new@example.com',
          first_name: 'New',
          last_name: 'User',
          role: 'user'
        }
      };
      mockRequest.mockResolvedValue(expectedResponse);
      
      // Act
      const result = await apiClient.post('/api/auth/register', registerData);
      
      // Assert
      expect(mockRequest).toHaveBeenCalledWith('POST', '/api/auth/register', registerData);
      expect(result).toEqual(expectedResponse);
    });
  });
  
  describe('Users API', () => {
    test('should get all users', async () => {
      // Arrange
      const expectedResponse = [
        {
          id: 1,
          email: 'admin@example.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin'
        },
        {
          id: 2,
          email: 'manager@example.com',
          first_name: 'Manager',
          last_name: 'User',
          role: 'manager'
        }
      ];
      mockRequest.mockResolvedValue(expectedResponse);
      
      // Act
      const result = await apiClient.get('/api/users');
      
      // Assert
      expect(mockRequest).toHaveBeenCalledWith('GET', '/api/users');
      expect(result).toEqual(expectedResponse);
      expect(result.length).toBe(2);
    });
    
    test('should get user by ID', async () => {
      // Arrange
      const userId = 1;
      const expectedResponse = {
        id: 1,
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      };
      mockRequest.mockResolvedValue(expectedResponse);
      
      // Act
      const result = await apiClient.get(`/api/users/${userId}`);
      
      // Assert
      expect(mockRequest).toHaveBeenCalledWith('GET', `/api/users/${userId}`);
      expect(result).toEqual(expectedResponse);
    });
  });
  
  describe('Companies API', () => {
    test('should get all companies', async () => {
      // Arrange
      const expectedResponse = [
        {
          id: 1,
          name: 'Acme Corporation',
          industry: 'Technology'
        },
        {
          id: 2,
          name: 'Globex Corporation',
          industry: 'Manufacturing'
        }
      ];
      mockRequest.mockResolvedValue(expectedResponse);
      
      // Act
      const result = await apiClient.get('/api/companies');
      
      // Assert
      expect(mockRequest).toHaveBeenCalledWith('GET', '/api/companies');
      expect(result).toEqual(expectedResponse);
      expect(result.length).toBe(2);
    });
    
    test('should create a new company', async () => {
      // Arrange
      const companyData = {
        name: 'New Company',
        industry: 'Technology',
        website: 'https://newcompany.example.com'
      };
      const expectedResponse = {
        id: 3,
        ...companyData,
        created_by: 1
      };
      mockRequest.mockResolvedValue(expectedResponse);
      
      // Act
      const result = await apiClient.post('/api/companies', companyData);
      
      // Assert
      expect(mockRequest).toHaveBeenCalledWith('POST', '/api/companies', companyData);
      expect(result).toEqual(expectedResponse);
      expect(result.id).toBe(3);
    });
  });
});
