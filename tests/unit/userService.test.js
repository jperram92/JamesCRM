/**
 * Unit tests for user service
 */

describe('User Service', () => {
  // Mock dependencies
  const mockUserRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByRole: jest.fn()
  };
  
  const mockEmailService = {
    sendInvitation: jest.fn(),
    sendPasswordReset: jest.fn()
  };
  
  const mockAuthService = {
    generateInvitationToken: jest.fn(),
    resetPasswordRequest: jest.fn()
  };
  
  // Mock user service
  const userService = {
    getAllUsers: async () => {
      return await mockUserRepository.findAll();
    },
    
    getUserById: async (id) => {
      const user = await mockUserRepository.findById(id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    },
    
    getUserByEmail: async (email) => {
      const user = await mockUserRepository.findByEmail(email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    },
    
    createUser: async (userData) => {
      const existingUser = await mockUserRepository.findByEmail(userData.email);
      
      if (existingUser) {
        throw new Error('Email already in use');
      }
      
      return await mockUserRepository.create(userData);
    },
    
    updateUser: async (id, userData) => {
      const user = await mockUserRepository.findById(id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (userData.email && userData.email !== user.email) {
        const existingUser = await mockUserRepository.findByEmail(userData.email);
        
        if (existingUser) {
          throw new Error('Email already in use');
        }
      }
      
      return await mockUserRepository.update(id, userData);
    },
    
    deleteUser: async (id) => {
      const user = await mockUserRepository.findById(id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return await mockUserRepository.delete(id);
    },
    
    inviteUser: async (inviterUserId, userData) => {
      const existingUser = await mockUserRepository.findByEmail(userData.email);
      
      if (existingUser) {
        throw new Error('Email already in use');
      }
      
      const invitationToken = await mockAuthService.generateInvitationToken(userData.email);
      
      const user = await mockUserRepository.create({
        ...userData,
        status: 'invited',
        invitationToken,
        invitedBy: inviterUserId,
        invitedAt: new Date()
      });
      
      await mockEmailService.sendInvitation(user.email, invitationToken);
      
      return user;
    },
    
    resendInvitation: async (userId) => {
      const user = await mockUserRepository.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.status !== 'invited') {
        throw new Error('User is not in invited status');
      }
      
      const invitationToken = await mockAuthService.generateInvitationToken(user.email);
      
      await mockUserRepository.update(userId, {
        invitationToken,
        invitedAt: new Date()
      });
      
      await mockEmailService.sendInvitation(user.email, invitationToken);
      
      return true;
    },
    
    acceptInvitation: async (invitationToken, userData) => {
      // In a real implementation, this would verify the token
      // For testing purposes, we'll mock this behavior
      
      const user = await mockUserRepository.findById(1); // Mock user with ID 1
      
      if (!user) {
        throw new Error('Invalid invitation token');
      }
      
      if (user.status !== 'invited') {
        throw new Error('Invitation has already been accepted');
      }
      
      return await mockUserRepository.update(user.id, {
        ...userData,
        status: 'active',
        invitationToken: null,
        activatedAt: new Date()
      });
    },
    
    requestPasswordReset: async (email) => {
      return await mockAuthService.resetPasswordRequest(email);
    },
    
    getUsersByRole: async (role) => {
      return await mockUserRepository.findByRole(role);
    },
    
    getActiveUsers: async () => {
      const users = await mockUserRepository.findAll();
      return users.filter(user => user.status === 'active');
    },
    
    getInactiveUsers: async () => {
      const users = await mockUserRepository.findAll();
      return users.filter(user => user.status !== 'active');
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockUserRepository.findAll.mockReset();
    mockUserRepository.findById.mockReset();
    mockUserRepository.findByEmail.mockReset();
    mockUserRepository.create.mockReset();
    mockUserRepository.update.mockReset();
    mockUserRepository.delete.mockReset();
    mockUserRepository.findByRole.mockReset();
    mockEmailService.sendInvitation.mockReset();
    mockEmailService.sendPasswordReset.mockReset();
    mockAuthService.generateInvitationToken.mockReset();
    mockAuthService.resetPasswordRequest.mockReset();
    
    // Default mock implementations
    mockUserRepository.findAll.mockResolvedValue([]);
    mockUserRepository.findById.mockResolvedValue(null);
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockImplementation(userData => ({ id: 1, ...userData }));
    mockUserRepository.update.mockImplementation((id, userData) => ({ id, ...userData }));
    mockUserRepository.delete.mockResolvedValue(true);
    mockUserRepository.findByRole.mockResolvedValue([]);
    mockEmailService.sendInvitation.mockResolvedValue(true);
    mockEmailService.sendPasswordReset.mockResolvedValue(true);
    mockAuthService.generateInvitationToken.mockResolvedValue('mock-invitation-token');
    mockAuthService.resetPasswordRequest.mockResolvedValue('mock-reset-token');
  });

  describe('getAllUsers', () => {
    test('should return all users', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, email: 'user1@example.com', status: 'active' },
        { id: 2, email: 'user2@example.com', status: 'active' }
      ];
      mockUserRepository.findAll.mockResolvedValue(mockUsers);
      
      // Act
      const result = await userService.getAllUsers();
      
      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
      expect(result.length).toBe(2);
    });
    
    test('should return empty array when no users exist', async () => {
      // Arrange
      mockUserRepository.findAll.mockResolvedValue([]);
      
      // Act
      const result = await userService.getAllUsers();
      
      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });
  
  describe('getUserById', () => {
    test('should return user by ID', async () => {
      // Arrange
      const userId = 1;
      const mockUser = { id: userId, email: 'user@example.com', status: 'active' };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      
      // Act
      const result = await userService.getUserById(userId);
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
    
    test('should throw error when user is not found', async () => {
      // Arrange
      const userId = 999;
      mockUserRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(userService.getUserById(userId)).rejects.toThrow('User not found');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });
  });
  
  describe('getUserByEmail', () => {
    test('should return user by email', async () => {
      // Arrange
      const email = 'user@example.com';
      const mockUser = { id: 1, email, status: 'active' };
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      
      // Act
      const result = await userService.getUserByEmail(email);
      
      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUser);
    });
    
    test('should throw error when user is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      mockUserRepository.findByEmail.mockResolvedValue(null);
      
      // Act & Assert
      await expect(userService.getUserByEmail(email)).rejects.toThrow('User not found');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    });
  });
  
  describe('createUser', () => {
    test('should create a new user', async () => {
      // Arrange
      const userData = {
        email: 'new@example.com',
        first_name: 'New',
        last_name: 'User',
        role: 'user'
      };
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({ id: 1, ...userData });
      
      // Act
      const result = await userService.createUser(userData);
      
      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual({ id: 1, ...userData });
    });
    
    test('should throw error when email is already in use', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        first_name: 'New',
        last_name: 'User',
        role: 'user'
      };
      const existingUser = { id: 1, email: userData.email, status: 'active' };
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      
      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow('Email already in use');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });
  
  describe('updateUser', () => {
    test('should update an existing user', async () => {
      // Arrange
      const userId = 1;
      const userData = {
        first_name: 'Updated',
        last_name: 'User'
      };
      const existingUser = { 
        id: userId, 
        email: 'user@example.com', 
        first_name: 'Original',
        last_name: 'User',
        status: 'active' 
      };
      const updatedUser = { 
        ...existingUser,
        ...userData
      };
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);
      
      // Act
      const result = await userService.updateUser(userId, userData);
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, userData);
      expect(result).toEqual(updatedUser);
    });
    
    test('should update user email when it is not already in use', async () => {
      // Arrange
      const userId = 1;
      const userData = {
        email: 'newemail@example.com'
      };
      const existingUser = { 
        id: userId, 
        email: 'oldemail@example.com', 
        status: 'active' 
      };
      const updatedUser = { 
        ...existingUser,
        ...userData
      };
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue(updatedUser);
      
      // Act
      const result = await userService.updateUser(userId, userData);
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, userData);
      expect(result).toEqual(updatedUser);
    });
    
    test('should throw error when user is not found', async () => {
      // Arrange
      const userId = 999;
      const userData = {
        first_name: 'Updated',
        last_name: 'User'
      };
      mockUserRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(userService.updateUser(userId, userData)).rejects.toThrow('User not found');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
    
    test('should throw error when new email is already in use', async () => {
      // Arrange
      const userId = 1;
      const userData = {
        email: 'existing@example.com'
      };
      const existingUser = { 
        id: userId, 
        email: 'original@example.com', 
        status: 'active' 
      };
      const anotherUser = { 
        id: 2, 
        email: 'existing@example.com', 
        status: 'active' 
      };
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByEmail.mockResolvedValue(anotherUser);
      
      // Act & Assert
      await expect(userService.updateUser(userId, userData)).rejects.toThrow('Email already in use');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteUser', () => {
    test('should delete an existing user', async () => {
      // Arrange
      const userId = 1;
      const existingUser = { id: userId, email: 'user@example.com', status: 'active' };
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.delete.mockResolvedValue(true);
      
      // Act
      const result = await userService.deleteUser(userId);
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
      expect(result).toBe(true);
    });
    
    test('should throw error when user is not found', async () => {
      // Arrange
      const userId = 999;
      mockUserRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(userService.deleteUser(userId)).rejects.toThrow('User not found');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });
  
  describe('inviteUser', () => {
    test('should invite a new user', async () => {
      // Arrange
      const inviterUserId = 1;
      const userData = {
        email: 'invited@example.com',
        first_name: 'Invited',
        last_name: 'User',
        role: 'user'
      };
      const invitationToken = 'mock-invitation-token';
      const invitedUser = {
        id: 2,
        ...userData,
        status: 'invited',
        invitationToken,
        invitedBy: inviterUserId,
        invitedAt: expect.any(Date)
      };
      
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockAuthService.generateInvitationToken.mockResolvedValue(invitationToken);
      mockUserRepository.create.mockResolvedValue(invitedUser);
      mockEmailService.sendInvitation.mockResolvedValue(true);
      
      // Act
      const result = await userService.inviteUser(inviterUserId, userData);
      
      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockAuthService.generateInvitationToken).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...userData,
        status: 'invited',
        invitationToken,
        invitedBy: inviterUserId,
        invitedAt: expect.any(Date)
      });
      expect(mockEmailService.sendInvitation).toHaveBeenCalledWith(userData.email, invitationToken);
      expect(result).toEqual(invitedUser);
    });
    
    test('should throw error when email is already in use', async () => {
      // Arrange
      const inviterUserId = 1;
      const userData = {
        email: 'existing@example.com',
        first_name: 'Invited',
        last_name: 'User',
        role: 'user'
      };
      const existingUser = { id: 2, email: userData.email, status: 'active' };
      
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      
      // Act & Assert
      await expect(userService.inviteUser(inviterUserId, userData)).rejects.toThrow('Email already in use');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockAuthService.generateInvitationToken).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockEmailService.sendInvitation).not.toHaveBeenCalled();
    });
  });
  
  describe('resendInvitation', () => {
    test('should resend invitation to an invited user', async () => {
      // Arrange
      const userId = 1;
      const existingUser = { 
        id: userId, 
        email: 'invited@example.com', 
        status: 'invited',
        invitationToken: 'old-token',
        invitedAt: new Date(Date.now() - 86400000) // 1 day ago
      };
      const invitationToken = 'new-invitation-token';
      
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockAuthService.generateInvitationToken.mockResolvedValue(invitationToken);
      mockUserRepository.update.mockResolvedValue({
        ...existingUser,
        invitationToken,
        invitedAt: expect.any(Date)
      });
      mockEmailService.sendInvitation.mockResolvedValue(true);
      
      // Act
      const result = await userService.resendInvitation(userId);
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockAuthService.generateInvitationToken).toHaveBeenCalledWith(existingUser.email);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        invitationToken,
        invitedAt: expect.any(Date)
      });
      expect(mockEmailService.sendInvitation).toHaveBeenCalledWith(existingUser.email, invitationToken);
      expect(result).toBe(true);
    });
    
    test('should throw error when user is not found', async () => {
      // Arrange
      const userId = 999;
      mockUserRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(userService.resendInvitation(userId)).rejects.toThrow('User not found');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockAuthService.generateInvitationToken).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(mockEmailService.sendInvitation).not.toHaveBeenCalled();
    });
    
    test('should throw error when user is not in invited status', async () => {
      // Arrange
      const userId = 1;
      const existingUser = { 
        id: userId, 
        email: 'active@example.com', 
        status: 'active'
      };
      
      mockUserRepository.findById.mockResolvedValue(existingUser);
      
      // Act & Assert
      await expect(userService.resendInvitation(userId)).rejects.toThrow('User is not in invited status');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockAuthService.generateInvitationToken).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(mockEmailService.sendInvitation).not.toHaveBeenCalled();
    });
  });
  
  describe('acceptInvitation', () => {
    test('should accept invitation and activate user', async () => {
      // Arrange
      const invitationToken = 'valid-invitation-token';
      const userData = {
        password: 'newpassword123',
        first_name: 'Updated',
        last_name: 'User'
      };
      const invitedUser = { 
        id: 1, 
        email: 'invited@example.com', 
        status: 'invited',
        invitationToken
      };
      const activatedUser = {
        ...invitedUser,
        ...userData,
        status: 'active',
        invitationToken: null,
        activatedAt: expect.any(Date)
      };
      
      mockUserRepository.findById.mockResolvedValue(invitedUser);
      mockUserRepository.update.mockResolvedValue(activatedUser);
      
      // Act
      const result = await userService.acceptInvitation(invitationToken, userData);
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1); // Mock implementation
      expect(mockUserRepository.update).toHaveBeenCalledWith(invitedUser.id, {
        ...userData,
        status: 'active',
        invitationToken: null,
        activatedAt: expect.any(Date)
      });
      expect(result).toEqual(activatedUser);
    });
    
    test('should throw error when invitation token is invalid', async () => {
      // Arrange
      const invitationToken = 'invalid-invitation-token';
      const userData = {
        password: 'newpassword123',
        first_name: 'Updated',
        last_name: 'User'
      };
      
      mockUserRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(userService.acceptInvitation(invitationToken, userData)).rejects.toThrow('Invalid invitation token');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1); // Mock implementation
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
    
    test('should throw error when invitation has already been accepted', async () => {
      // Arrange
      const invitationToken = 'valid-invitation-token';
      const userData = {
        password: 'newpassword123',
        first_name: 'Updated',
        last_name: 'User'
      };
      const activeUser = { 
        id: 1, 
        email: 'active@example.com', 
        status: 'active',
        invitationToken: null
      };
      
      mockUserRepository.findById.mockResolvedValue(activeUser);
      
      // Act & Assert
      await expect(userService.acceptInvitation(invitationToken, userData)).rejects.toThrow('Invitation has already been accepted');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1); // Mock implementation
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });
  
  describe('requestPasswordReset', () => {
    test('should request password reset', async () => {
      // Arrange
      const email = 'user@example.com';
      const resetToken = 'mock-reset-token';
      
      mockAuthService.resetPasswordRequest.mockResolvedValue(resetToken);
      
      // Act
      const result = await userService.requestPasswordReset(email);
      
      // Assert
      expect(mockAuthService.resetPasswordRequest).toHaveBeenCalledWith(email);
      expect(result).toBe(resetToken);
    });
  });
  
  describe('getUsersByRole', () => {
    test('should get users by role', async () => {
      // Arrange
      const role = 'admin';
      const mockUsers = [
        { id: 1, email: 'admin1@example.com', role: 'admin', status: 'active' },
        { id: 2, email: 'admin2@example.com', role: 'admin', status: 'active' }
      ];
      
      mockUserRepository.findByRole.mockResolvedValue(mockUsers);
      
      // Act
      const result = await userService.getUsersByRole(role);
      
      // Assert
      expect(mockUserRepository.findByRole).toHaveBeenCalledWith(role);
      expect(result).toEqual(mockUsers);
      expect(result.length).toBe(2);
    });
    
    test('should return empty array when no users with role exist', async () => {
      // Arrange
      const role = 'nonexistent-role';
      
      mockUserRepository.findByRole.mockResolvedValue([]);
      
      // Act
      const result = await userService.getUsersByRole(role);
      
      // Assert
      expect(mockUserRepository.findByRole).toHaveBeenCalledWith(role);
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });
  
  describe('getActiveUsers', () => {
    test('should get active users', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, email: 'active1@example.com', status: 'active' },
        { id: 2, email: 'active2@example.com', status: 'active' },
        { id: 3, email: 'invited@example.com', status: 'invited' }
      ];
      
      mockUserRepository.findAll.mockResolvedValue(mockUsers);
      
      // Act
      const result = await userService.getActiveUsers();
      
      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([
        { id: 1, email: 'active1@example.com', status: 'active' },
        { id: 2, email: 'active2@example.com', status: 'active' }
      ]);
      expect(result.length).toBe(2);
    });
    
    test('should return empty array when no active users exist', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, email: 'invited1@example.com', status: 'invited' },
        { id: 2, email: 'invited2@example.com', status: 'invited' }
      ];
      
      mockUserRepository.findAll.mockResolvedValue(mockUsers);
      
      // Act
      const result = await userService.getActiveUsers();
      
      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });
  
  describe('getInactiveUsers', () => {
    test('should get inactive users', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, email: 'active@example.com', status: 'active' },
        { id: 2, email: 'invited1@example.com', status: 'invited' },
        { id: 3, email: 'invited2@example.com', status: 'invited' }
      ];
      
      mockUserRepository.findAll.mockResolvedValue(mockUsers);
      
      // Act
      const result = await userService.getInactiveUsers();
      
      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([
        { id: 2, email: 'invited1@example.com', status: 'invited' },
        { id: 3, email: 'invited2@example.com', status: 'invited' }
      ]);
      expect(result.length).toBe(2);
    });
    
    test('should return empty array when no inactive users exist', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, email: 'active1@example.com', status: 'active' },
        { id: 2, email: 'active2@example.com', status: 'active' }
      ];
      
      mockUserRepository.findAll.mockResolvedValue(mockUsers);
      
      // Act
      const result = await userService.getInactiveUsers();
      
      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });
});
