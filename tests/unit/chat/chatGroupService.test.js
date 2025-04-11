/**
 * Unit tests for chat group service
 */

describe('Chat Group Service', () => {
  // Mock dependencies
  const mockGroupRepository = {
    createGroup: jest.fn(),
    getGroup: jest.fn(),
    updateGroup: jest.fn(),
    deleteGroup: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
    getGroupMembers: jest.fn(),
    getUserGroups: jest.fn()
  };
  
  // Mock chat group service
  const chatGroupService = {
    createGroup: async (groupData) => {
      return await mockGroupRepository.createGroup(groupData);
    },
    
    getGroup: async (groupId) => {
      const group = await mockGroupRepository.getGroup(groupId);
      
      if (!group) {
        throw new Error('Group not found');
      }
      
      return group;
    },
    
    updateGroup: async (groupId, groupData) => {
      const group = await mockGroupRepository.getGroup(groupId);
      
      if (!group) {
        throw new Error('Group not found');
      }
      
      return await mockGroupRepository.updateGroup(groupId, groupData);
    },
    
    deleteGroup: async (groupId) => {
      const group = await mockGroupRepository.getGroup(groupId);
      
      if (!group) {
        throw new Error('Group not found');
      }
      
      return await mockGroupRepository.deleteGroup(groupId);
    },
    
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
    mockGroupRepository.createGroup.mockReset();
    mockGroupRepository.getGroup.mockReset();
    mockGroupRepository.updateGroup.mockReset();
    mockGroupRepository.deleteGroup.mockReset();
    mockGroupRepository.addMember.mockReset();
    mockGroupRepository.removeMember.mockReset();
    mockGroupRepository.getGroupMembers.mockReset();
    mockGroupRepository.getUserGroups.mockReset();
    
    // Default mock implementations
    mockGroupRepository.createGroup.mockImplementation((groupData) => ({
      id: 'group-123',
      ...groupData,
      createdAt: new Date()
    }));
    
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
    
    mockGroupRepository.updateGroup.mockImplementation((groupId, groupData) => ({
      id: groupId,
      ...groupData,
      updatedAt: new Date()
    }));
    
    mockGroupRepository.deleteGroup.mockResolvedValue(true);
    
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

  describe('createGroup', () => {
    test('should create a group successfully', async () => {
      // Arrange
      const groupData = {
        name: 'New Group',
        description: 'A new group',
        createdBy: 'user-1'
      };
      
      // Act
      const result = await chatGroupService.createGroup(groupData);
      
      // Assert
      expect(mockGroupRepository.createGroup).toHaveBeenCalledWith(groupData);
      expect(result).toEqual({
        id: 'group-123',
        ...groupData,
        createdAt: expect.any(Date)
      });
    });
  });
  
  describe('getGroup', () => {
    test('should get a group by ID', async () => {
      // Arrange
      const groupId = 'group-123';
      
      // Act
      const result = await chatGroupService.getGroup(groupId);
      
      // Assert
      expect(mockGroupRepository.getGroup).toHaveBeenCalledWith(groupId);
      expect(result).toEqual({
        id: groupId,
        name: 'Test Group',
        description: 'A test group',
        createdBy: 'user-1',
        createdAt: expect.any(Date)
      });
    });
    
    test('should throw error when group is not found', async () => {
      // Arrange
      const groupId = 'nonexistent-group';
      
      // Act & Assert
      await expect(chatGroupService.getGroup(groupId)).rejects.toThrow('Group not found');
      expect(mockGroupRepository.getGroup).toHaveBeenCalledWith(groupId);
    });
  });
  
  describe('updateGroup', () => {
    test('should update a group successfully', async () => {
      // Arrange
      const groupId = 'group-123';
      const groupData = {
        name: 'Updated Group',
        description: 'Updated description'
      };
      
      // Act
      const result = await chatGroupService.updateGroup(groupId, groupData);
      
      // Assert
      expect(mockGroupRepository.getGroup).toHaveBeenCalledWith(groupId);
      expect(mockGroupRepository.updateGroup).toHaveBeenCalledWith(groupId, groupData);
      expect(result).toEqual({
        id: groupId,
        ...groupData,
        updatedAt: expect.any(Date)
      });
    });
    
    test('should throw error when group is not found', async () => {
      // Arrange
      const groupId = 'nonexistent-group';
      const groupData = {
        name: 'Updated Group'
      };
      
      // Act & Assert
      await expect(chatGroupService.updateGroup(groupId, groupData)).rejects.toThrow('Group not found');
      expect(mockGroupRepository.getGroup).toHaveBeenCalledWith(groupId);
      expect(mockGroupRepository.updateGroup).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteGroup', () => {
    test('should delete a group successfully', async () => {
      // Arrange
      const groupId = 'group-123';
      
      // Act
      const result = await chatGroupService.deleteGroup(groupId);
      
      // Assert
      expect(mockGroupRepository.getGroup).toHaveBeenCalledWith(groupId);
      expect(mockGroupRepository.deleteGroup).toHaveBeenCalledWith(groupId);
      expect(result).toBe(true);
    });
    
    test('should throw error when group is not found', async () => {
      // Arrange
      const groupId = 'nonexistent-group';
      
      // Act & Assert
      await expect(chatGroupService.deleteGroup(groupId)).rejects.toThrow('Group not found');
      expect(mockGroupRepository.getGroup).toHaveBeenCalledWith(groupId);
      expect(mockGroupRepository.deleteGroup).not.toHaveBeenCalled();
    });
  });
});
