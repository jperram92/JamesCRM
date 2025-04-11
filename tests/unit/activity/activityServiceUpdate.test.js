/**
 * Unit tests for activity service - update and delete operations
 */

describe('Activity Service - Update and Delete', () => {
  // Mock dependencies
  const mockActivityRepository = {
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByUserId: jest.fn(),
    findByContactId: jest.fn(),
    findByCompanyId: jest.fn(),
    findByDealId: jest.fn(),
    findByType: jest.fn(),
    findByStatus: jest.fn(),
    findByDateRange: jest.fn()
  };
  
  // Mock activity service
  const activityService = {
    updateActivity: async (id, activityData) => {
      const activity = await mockActivityRepository.findById(id);
      
      if (!activity) {
        throw new Error('Activity not found');
      }
      
      return await mockActivityRepository.update(id, {
        ...activityData,
        updated_at: new Date()
      });
    },
    
    deleteActivity: async (id) => {
      const activity = await mockActivityRepository.findById(id);
      
      if (!activity) {
        throw new Error('Activity not found');
      }
      
      return await mockActivityRepository.delete(id);
    },
    
    getActivitiesByUser: async (userId) => {
      return await mockActivityRepository.findByUserId(userId);
    },
    
    getActivitiesByContact: async (contactId) => {
      return await mockActivityRepository.findByContactId(contactId);
    },
    
    getActivitiesByCompany: async (companyId) => {
      return await mockActivityRepository.findByCompanyId(companyId);
    },
    
    getActivitiesByDeal: async (dealId) => {
      return await mockActivityRepository.findByDealId(dealId);
    },
    
    getActivitiesByType: async (type) => {
      return await mockActivityRepository.findByType(type);
    },
    
    getActivitiesByStatus: async (status) => {
      return await mockActivityRepository.findByStatus(status);
    },
    
    getActivitiesByDateRange: async (startDate, endDate) => {
      return await mockActivityRepository.findByDateRange(startDate, endDate);
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockActivityRepository.findById.mockReset();
    mockActivityRepository.update.mockReset();
    mockActivityRepository.delete.mockReset();
    mockActivityRepository.findByUserId.mockReset();
    mockActivityRepository.findByContactId.mockReset();
    mockActivityRepository.findByCompanyId.mockReset();
    mockActivityRepository.findByDealId.mockReset();
    mockActivityRepository.findByType.mockReset();
    mockActivityRepository.findByStatus.mockReset();
    mockActivityRepository.findByDateRange.mockReset();
    
    // Default mock implementations
    mockActivityRepository.findById.mockImplementation((id) => {
      if (id === 999) {
        return null;
      }
      
      return {
        id,
        type: id === 1 ? 'Call' : 'Meeting',
        subject: id === 1 ? 'Sales call' : 'Product demo',
        description: id === 1 ? 'Discuss new product features' : 'Show new features to client',
        status: id === 1 ? 'Completed' : 'Scheduled',
        due_date: id === 1 ? new Date('2023-01-15T10:00:00Z') : new Date('2023-01-20T14:00:00Z'),
        owner_id: 1,
        contact_id: id === 1 ? 1 : 2,
        company_id: id === 1 ? 1 : 2,
        deal_id: id === 1 ? null : 1,
        created_at: id === 1 ? new Date('2023-01-01T00:00:00Z') : new Date('2023-01-02T00:00:00Z'),
        updated_at: id === 1 ? new Date('2023-01-01T00:00:00Z') : new Date('2023-01-02T00:00:00Z')
      };
    });
    
    mockActivityRepository.update.mockImplementation((id, activityData) => ({
      id,
      ...activityData
    }));
    
    mockActivityRepository.delete.mockResolvedValue(true);
    
    mockActivityRepository.findByUserId.mockImplementation((userId) => {
      if (userId === 999) {
        return [];
      }
      
      return [
        {
          id: 1,
          type: 'Call',
          subject: 'Sales call',
          description: 'Discuss new product features',
          status: 'Completed',
          due_date: new Date('2023-01-15T10:00:00Z'),
          owner_id: userId,
          contact_id: 1,
          company_id: 1,
          deal_id: null,
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: new Date('2023-01-01T00:00:00Z')
        },
        {
          id: 2,
          type: 'Meeting',
          subject: 'Product demo',
          description: 'Show new features to client',
          status: 'Scheduled',
          due_date: new Date('2023-01-20T14:00:00Z'),
          owner_id: userId,
          contact_id: 2,
          company_id: 2,
          deal_id: 1,
          created_at: new Date('2023-01-02T00:00:00Z'),
          updated_at: new Date('2023-01-02T00:00:00Z')
        }
      ];
    });
    
    mockActivityRepository.findByContactId.mockImplementation((contactId) => {
      if (contactId === 999) {
        return [];
      }
      
      if (contactId === 1) {
        return [
          {
            id: 1,
            type: 'Call',
            subject: 'Sales call',
            description: 'Discuss new product features',
            status: 'Completed',
            due_date: new Date('2023-01-15T10:00:00Z'),
            owner_id: 1,
            contact_id: contactId,
            company_id: 1,
            deal_id: null,
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: new Date('2023-01-01T00:00:00Z')
          }
        ];
      }
      
      if (contactId === 2) {
        return [
          {
            id: 2,
            type: 'Meeting',
            subject: 'Product demo',
            description: 'Show new features to client',
            status: 'Scheduled',
            due_date: new Date('2023-01-20T14:00:00Z'),
            owner_id: 1,
            contact_id: contactId,
            company_id: 2,
            deal_id: 1,
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: new Date('2023-01-02T00:00:00Z')
          }
        ];
      }
      
      return [];
    });
    
    mockActivityRepository.findByCompanyId.mockImplementation((companyId) => {
      if (companyId === 999) {
        return [];
      }
      
      if (companyId === 1) {
        return [
          {
            id: 1,
            type: 'Call',
            subject: 'Sales call',
            description: 'Discuss new product features',
            status: 'Completed',
            due_date: new Date('2023-01-15T10:00:00Z'),
            owner_id: 1,
            contact_id: 1,
            company_id: companyId,
            deal_id: null,
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: new Date('2023-01-01T00:00:00Z')
          }
        ];
      }
      
      if (companyId === 2) {
        return [
          {
            id: 2,
            type: 'Meeting',
            subject: 'Product demo',
            description: 'Show new features to client',
            status: 'Scheduled',
            due_date: new Date('2023-01-20T14:00:00Z'),
            owner_id: 1,
            contact_id: 2,
            company_id: companyId,
            deal_id: 1,
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: new Date('2023-01-02T00:00:00Z')
          }
        ];
      }
      
      return [];
    });
    
    mockActivityRepository.findByDealId.mockImplementation((dealId) => {
      if (dealId === 999) {
        return [];
      }
      
      if (dealId === 1) {
        return [
          {
            id: 2,
            type: 'Meeting',
            subject: 'Product demo',
            description: 'Show new features to client',
            status: 'Scheduled',
            due_date: new Date('2023-01-20T14:00:00Z'),
            owner_id: 1,
            contact_id: 2,
            company_id: 2,
            deal_id: dealId,
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: new Date('2023-01-02T00:00:00Z')
          }
        ];
      }
      
      return [];
    });
    
    mockActivityRepository.findByType.mockImplementation((type) => {
      if (type === 'Nonexistent Type') {
        return [];
      }
      
      if (type === 'Call') {
        return [
          {
            id: 1,
            type,
            subject: 'Sales call',
            description: 'Discuss new product features',
            status: 'Completed',
            due_date: new Date('2023-01-15T10:00:00Z'),
            owner_id: 1,
            contact_id: 1,
            company_id: 1,
            deal_id: null,
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: new Date('2023-01-01T00:00:00Z')
          }
        ];
      }
      
      if (type === 'Meeting') {
        return [
          {
            id: 2,
            type,
            subject: 'Product demo',
            description: 'Show new features to client',
            status: 'Scheduled',
            due_date: new Date('2023-01-20T14:00:00Z'),
            owner_id: 1,
            contact_id: 2,
            company_id: 2,
            deal_id: 1,
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: new Date('2023-01-02T00:00:00Z')
          }
        ];
      }
      
      return [];
    });
    
    mockActivityRepository.findByStatus.mockImplementation((status) => {
      if (status === 'Nonexistent Status') {
        return [];
      }
      
      if (status === 'Completed') {
        return [
          {
            id: 1,
            type: 'Call',
            subject: 'Sales call',
            description: 'Discuss new product features',
            status,
            due_date: new Date('2023-01-15T10:00:00Z'),
            owner_id: 1,
            contact_id: 1,
            company_id: 1,
            deal_id: null,
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: new Date('2023-01-01T00:00:00Z')
          }
        ];
      }
      
      if (status === 'Scheduled') {
        return [
          {
            id: 2,
            type: 'Meeting',
            subject: 'Product demo',
            description: 'Show new features to client',
            status,
            due_date: new Date('2023-01-20T14:00:00Z'),
            owner_id: 1,
            contact_id: 2,
            company_id: 2,
            deal_id: 1,
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: new Date('2023-01-02T00:00:00Z')
          }
        ];
      }
      
      return [];
    });
    
    mockActivityRepository.findByDateRange.mockImplementation((startDate, endDate) => {
      if (startDate > endDate) {
        return [];
      }
      
      return [
        {
          id: 1,
          type: 'Call',
          subject: 'Sales call',
          description: 'Discuss new product features',
          status: 'Completed',
          due_date: new Date('2023-01-15T10:00:00Z'),
          owner_id: 1,
          contact_id: 1,
          company_id: 1,
          deal_id: null,
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: new Date('2023-01-01T00:00:00Z')
        },
        {
          id: 2,
          type: 'Meeting',
          subject: 'Product demo',
          description: 'Show new features to client',
          status: 'Scheduled',
          due_date: new Date('2023-01-20T14:00:00Z'),
          owner_id: 1,
          contact_id: 2,
          company_id: 2,
          deal_id: 1,
          created_at: new Date('2023-01-02T00:00:00Z'),
          updated_at: new Date('2023-01-02T00:00:00Z')
        }
      ].filter(activity => {
        const dueDate = new Date(activity.due_date);
        return dueDate >= startDate && dueDate <= endDate;
      });
    });
  });

  describe('updateActivity', () => {
    test('should update an activity successfully', async () => {
      // Arrange
      const activityId = 1;
      const activityData = {
        subject: 'Updated subject',
        description: 'Updated description',
        status: 'In Progress'
      };
      
      // Act
      const result = await activityService.updateActivity(activityId, activityData);
      
      // Assert
      expect(mockActivityRepository.findById).toHaveBeenCalledWith(activityId);
      expect(mockActivityRepository.update).toHaveBeenCalledWith(activityId, {
        ...activityData,
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: activityId,
        ...activityData,
        updated_at: expect.any(Date)
      });
    });
    
    test('should throw error when activity is not found', async () => {
      // Arrange
      const activityId = 999;
      const activityData = {
        subject: 'Updated subject',
        status: 'In Progress'
      };
      
      // Act & Assert
      await expect(activityService.updateActivity(activityId, activityData)).rejects.toThrow('Activity not found');
      expect(mockActivityRepository.findById).toHaveBeenCalledWith(activityId);
      expect(mockActivityRepository.update).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteActivity', () => {
    test('should delete an activity successfully', async () => {
      // Arrange
      const activityId = 1;
      
      // Act
      const result = await activityService.deleteActivity(activityId);
      
      // Assert
      expect(mockActivityRepository.findById).toHaveBeenCalledWith(activityId);
      expect(mockActivityRepository.delete).toHaveBeenCalledWith(activityId);
      expect(result).toBe(true);
    });
    
    test('should throw error when activity is not found', async () => {
      // Arrange
      const activityId = 999;
      
      // Act & Assert
      await expect(activityService.deleteActivity(activityId)).rejects.toThrow('Activity not found');
      expect(mockActivityRepository.findById).toHaveBeenCalledWith(activityId);
      expect(mockActivityRepository.delete).not.toHaveBeenCalled();
    });
  });
  
  describe('getActivitiesByUser', () => {
    test('should return activities for a user', async () => {
      // Arrange
      const userId = 1;
      
      // Act
      const result = await activityService.getActivitiesByUser(userId);
      
      // Assert
      expect(mockActivityRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(2);
      expect(result[0].owner_id).toBe(userId);
      expect(result[1].owner_id).toBe(userId);
    });
    
    test('should return empty array when user has no activities', async () => {
      // Arrange
      const userId = 999;
      
      // Act
      const result = await activityService.getActivitiesByUser(userId);
      
      // Assert
      expect(mockActivityRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });
  
  describe('getActivitiesByContact', () => {
    test('should return activities for a contact', async () => {
      // Arrange
      const contactId = 1;
      
      // Act
      const result = await activityService.getActivitiesByContact(contactId);
      
      // Assert
      expect(mockActivityRepository.findByContactId).toHaveBeenCalledWith(contactId);
      expect(result).toHaveLength(1);
      expect(result[0].contact_id).toBe(contactId);
    });
    
    test('should return empty array when contact has no activities', async () => {
      // Arrange
      const contactId = 999;
      
      // Act
      const result = await activityService.getActivitiesByContact(contactId);
      
      // Assert
      expect(mockActivityRepository.findByContactId).toHaveBeenCalledWith(contactId);
      expect(result).toEqual([]);
    });
  });
});
