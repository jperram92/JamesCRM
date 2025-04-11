/**
 * Unit tests for chat group members functionality
 */

describe('Chat Group Members', () => {
  // Mock dependencies
  const mockGroupRepository = {
    getGroup: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
    getGroupMembers: jest.fn(),
    getUserGroups: jest.fn()
  };
  
  // Mock chat group service
  const chatGroupService = {
    addMember: async (groupId, userId, role = 'member') => {
      const group = await mockGroupRepository.getGroup(groupId);
      
      if (!group) {
        throw new Error('Group not found');
      }
      
      return await mockGroupRepository.addMember(groupId, userId, role);
    },
    
    removeMember: async (groupId, userId) => {
      const group = await mockGroupRepository.getGroup(groupId);
      
      if (!group) {
        throw new Error('Group not found');
      }
      
      return await mockGroupRepository.removeMember(groupId, userId);
    },
    
    getGroupMembers: async (groupId) => {
      const group = await mockGroupRepository.getGroup(groupId);
      
      if (!group) {
        throw new Error('Group not found');
      }
      
      return await mockGroupRepository.getGroupMembers(groupId);
    },
    
    getUserGroups: async (userId) => {
      return await mockGroupRepository.getUserGroups(userId);
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockGroupRepository.getGroup.mockReset();
    mockGroupRepository.addMember.mockReset();
    mockGroupRepository.removeMember.mockReset();
    mockGroupRepository.getGroupMembers.mockReset();
    mockGroupRepository.getUserGroups.mockReset();
    
    // Default mock implementations
    mockGroupRepository.getGroup.mockImplementation((groupId) => {
      if (groupId === 'nonexistent-group') {
        return null;
      }
      
      return {
        id: groupId,
        name: 'Test Group',
        description: 'A test group',
        createdBy: 'user-1',
        createdAt: new Date('2023-01-01T00:00:00Z')
      };
    });
    
    mockGroupRepository.addMember.mockResolvedValue(true);
    
    mockGroupRepository.removeMember.mockResolvedValue(true);
    
    mockGroupRepository.getGroupMembers.mockResolvedValue([
      { userId: 'user-1', role: 'admin', joinedAt: new Date('2023-01-01T00:00:00Z') },
      { userId: 'user-2', role: 'member', joinedAt: new Date('2023-01-02T00:00:00Z') }
    ]);
    
    mockGroupRepository.getUserGroups.mockResolvedValue([
      {
        id: 'group-1',
        name: 'Group 1',
        description: 'First group',
        role: 'admin',
        unreadCount: 0
      },
      {
        id: 'group-2',
        name: 'Group 2',
        description: 'Second group',
        role: 'member',
        unreadCount: 5
      }
    ]);
  });

  describe('addMember', () => {
    test('should add a member to a group', async () => {
      // Arrange
      const groupId = 'group-123';
      const userId = 'user-3';
      const role = 'member';
      
      // Act
      const result = await chatGroupService.addMember(groupId, userId, role);
      
      // Assert
      expect(mockGroupRepository.getGroup).toHaveBeenCalledWith(groupId);
      expect(mockGroupRepository.addMember).toHaveBeenCalledWith(groupId, userId, role);
      expect(result).toBe(true);
    });
    
    test('should add a member with admin role', async () => {
      // Arrange
      const groupId = 'group-123';
      const userId = 'user-3';
      const role = 'admin';
      
      // Act
      const result = await chatGroupService.addMember(groupId, userId, role);
      
      // Assert
      expect(mockGroupRepository.getGroup).toHaveBeenCalledWith(groupId);
      expect(mockGroupRepository.addMember).toHaveBeenCalledWith(groupId, userId, role);
      expect(result).toBe(true);
    });
    
    test('should add a member with default role', async () => {
      // Arrange
      const groupId = 'group-123';
      const userId = 'user-3';
      
      // Act
      const result = await chatGroupService.addMember(groupId, userId);
      
      // Assert
      expect(mockGroupRepository.getGroup).toHaveBeenCalledWith(groupId);
      expect(mockGroupRepository.addMember).toHaveBeenCalledWith(groupId, userId, 'member');
      expect(result).toBe(true);
    });
    
    test('should throw error when group is not found', async () => {
      // Arrange
      const groupId = 'nonexistent-group';
      const userId = 'user-3';
      
      // Act & Assert
      await expect(chatGroupService.addMember(groupId, userId)).rejects.toThrow('Group not found');
      expect(mockGroupRepository.getGroup).toHaveBeenCalledWith(groupId);
      expect(mockGroupRepository.addMember).not.toHaveBeenCalled();
    });
  });
  
  describe('removeMember', () => {
    test('should remove a member from a group', async () => {
      // Arrange
      const groupId = 'group-123';
      const userId = 'user-2';
      
      // Act
      const result = await chatGroupService.removeMember(groupId, userId);
      
      // Assert
      expect(mockGroupRepository.getGroup).toHaveBeenCalledWith(groupId);
      expect(mockGroupRepository.removeMember).toHaveBeenCalledWith(groupId, userId);
      expect(result).toBe(true);
    });
    
    test('should throw error when group is not found', async () => {
      // Arrange
      const groupId = 'nonexistent-group';
      const userId = 'user-2';
      
      // Act & Assert
      await expect(chatGroupService.removeMember(groupId, userId)).rejects.toThrow('Group not found');
      expect(mockGroupRepository.getGroup).toHaveBeenCalledWith(groupId);
      expect(mockGroupRepository.removeMember).not.toHaveBeenCalled();
    });
  });
  
  describe('getGroupMembers', () => {
    test('should get members of a group', async () => {
      // Arrange
      const groupId = 'group-123';
      
      // Act
      const result = await chatGroupService.getGroupMembers(groupId);
      
      // Assert
      expect(mockGroupRepository.getGroup).toHaveBeenCalledWith(groupId);
      expect(mockGroupRepository.getGroupMembers).toHaveBeenCalledWith(groupId);
      expect(result).toEqual([
        { userId: 'user-1', role: 'admin', joinedAt: expect.any(Date) },
        { userId: 'user-2', role: 'member', joinedAt: expect.any(Date) }
      ]);
    });
    
    test('should throw error when group is not found', async () => {
      // Arrange
      const groupId = 'nonexistent-group';
      
      // Act & Assert
      await expect(chatGroupService.getGroupMembers(groupId)).rejects.toThrow('Group not found');
      expect(mockGroupRepository.getGroup).toHaveBeenCalledWith(groupId);
      expect(mockGroupRepository.getGroupMembers).not.toHaveBeenCalled();
    });
  });
  
  describe('getUserGroups', () => {
    test('should get groups of a user', async () => {
      // Arrange
      const userId = 'user-1';
      
      // Act
      const result = await chatGroupService.getUserGroups(userId);
      
      // Assert
      expect(mockGroupRepository.getUserGroups).toHaveBeenCalledWith(userId);
      expect(result).toEqual([
        {
          id: 'group-1',
          name: 'Group 1',
          description: 'First group',
          role: 'admin',
          unreadCount: 0
        },
        {
          id: 'group-2',
          name: 'Group 2',
          description: 'Second group',
          role: 'member',
          unreadCount: 5
        }
      ]);
    });
    
    test('should return empty array when user has no groups', async () => {
      // Arrange
      const userId = 'user-no-groups';
      mockGroupRepository.getUserGroups.mockResolvedValue([]);
      
      // Act
      const result = await chatGroupService.getUserGroups(userId);
      
      // Assert
      expect(mockGroupRepository.getUserGroups).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });
});
