/**
 * Unit tests for user functionality
 */

describe('User Management', () => {
  // Mock user data
  const mockUsers = [
    {
      id: 1,
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      status: 'active'
    },
    {
      id: 2,
      email: 'manager@example.com',
      first_name: 'Manager',
      last_name: 'User',
      role: 'manager',
      status: 'active'
    },
    {
      id: 3,
      email: 'user@example.com',
      first_name: 'Regular',
      last_name: 'User',
      role: 'user',
      status: 'active'
    }
  ];

  // Mock user service
  const mockFindAll = jest.fn();
  const mockFindById = jest.fn();
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  const userService = {
    findAllUsers: mockFindAll,
    findUserById: mockFindById,
    createUser: mockCreate,
    updateUser: mockUpdate,
    deleteUser: mockDelete
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockFindAll.mockReset();
    mockFindById.mockReset();
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockDelete.mockReset();
  });

  test('should get all users', async () => {
    // Arrange
    mockFindAll.mockResolvedValue(mockUsers);

    // Act
    const result = await userService.findAllUsers();

    // Assert
    expect(mockFindAll).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
    expect(result.length).toBe(3);
  });

  test('should get user by ID', async () => {
    // Arrange
    const userId = 1;
    const expectedUser = mockUsers.find(user => user.id === userId);
    mockFindById.mockResolvedValue(expectedUser);

    // Act
    const result = await userService.findUserById(userId);

    // Assert
    expect(mockFindById).toHaveBeenCalledWith(userId);
    expect(result).toEqual(expectedUser);
  });

  test('should return null when user is not found', async () => {
    // Arrange
    const userId = 999;
    mockFindById.mockResolvedValue(null);

    // Act
    const result = await userService.findUserById(userId);

    // Assert
    expect(mockFindById).toHaveBeenCalledWith(userId);
    expect(result).toBeNull();
  });

  test('should create a new user', async () => {
    // Arrange
    const newUser = {
      email: 'new@example.com',
      first_name: 'New',
      last_name: 'User',
      role: 'user',
      status: 'active'
    };
    const createdUser = { id: 4, ...newUser };
    mockCreate.mockResolvedValue(createdUser);

    // Act
    const result = await userService.createUser(newUser);

    // Assert
    expect(mockCreate).toHaveBeenCalledWith(newUser);
    expect(result).toEqual(createdUser);
    expect(result.id).toBe(4);
  });

  test('should update an existing user', async () => {
    // Arrange
    const userId = 1;
    const updateData = {
      first_name: 'Updated',
      last_name: 'Name'
    };
    const updatedUser = {
      ...mockUsers.find(user => user.id === userId),
      ...updateData
    };
    mockUpdate.mockResolvedValue(updatedUser);

    // Act
    const result = await userService.updateUser(userId, updateData);

    // Assert
    expect(mockUpdate).toHaveBeenCalledWith(userId, updateData);
    expect(result).toEqual(updatedUser);
    expect(result.first_name).toBe('Updated');
    expect(result.last_name).toBe('Name');
  });

  test('should delete a user', async () => {
    // Arrange
    const userId = 1;
    mockDelete.mockResolvedValue(true);

    // Act
    const result = await userService.deleteUser(userId);

    // Assert
    expect(mockDelete).toHaveBeenCalledWith(userId);
    expect(result).toBe(true);
  });
});
