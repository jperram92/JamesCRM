/**
 * Unit tests for authentication functionality
 */

describe('Authentication', () => {
  // Mock user data
  const validUser = {
    id: 1,
    email: 'test@example.com',
    password: 'password123',
    first_name: 'Test',
    last_name: 'User',
    role: 'admin'
  };

  // Mock functions
  const mockFindUser = jest.fn();
  const mockComparePassword = jest.fn();
  const mockGenerateToken = jest.fn();

  // Mock authentication service
  const authService = {
    findUserByEmail: mockFindUser,
    comparePassword: mockComparePassword,
    generateToken: mockGenerateToken
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockFindUser.mockReset();
    mockComparePassword.mockReset();
    mockGenerateToken.mockReset();
  });

  test('should authenticate user with valid credentials', async () => {
    // Arrange
    mockFindUser.mockResolvedValue(validUser);
    mockComparePassword.mockResolvedValue(true);
    mockGenerateToken.mockReturnValue('valid-token');

    // Act
    const result = await authenticate('test@example.com', 'password123');

    // Assert
    expect(mockFindUser).toHaveBeenCalledWith('test@example.com');
    expect(mockComparePassword).toHaveBeenCalledWith('password123', validUser.password);
    expect(mockGenerateToken).toHaveBeenCalledWith(validUser);
    expect(result).toEqual({
      token: 'valid-token',
      user: {
        id: validUser.id,
        email: validUser.email,
        first_name: validUser.first_name,
        last_name: validUser.last_name,
        role: validUser.role
      }
    });
  });

  test('should reject authentication with invalid email', async () => {
    // Arrange
    mockFindUser.mockResolvedValue(null);

    // Act & Assert
    await expect(authenticate('wrong@example.com', 'password123')).rejects.toThrow('Invalid credentials');
    expect(mockFindUser).toHaveBeenCalledWith('wrong@example.com');
    expect(mockComparePassword).not.toHaveBeenCalled();
    expect(mockGenerateToken).not.toHaveBeenCalled();
  });

  test('should reject authentication with invalid password', async () => {
    // Arrange
    mockFindUser.mockResolvedValue(validUser);
    mockComparePassword.mockResolvedValue(false);

    // Act & Assert
    await expect(authenticate('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    expect(mockFindUser).toHaveBeenCalledWith('test@example.com');
    expect(mockComparePassword).toHaveBeenCalledWith('wrongpassword', validUser.password);
    expect(mockGenerateToken).not.toHaveBeenCalled();
  });

  // Mock authenticate function
  async function authenticate(email, password) {
    const user = await authService.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await authService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = authService.generateToken(user);
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    };
  }
});
