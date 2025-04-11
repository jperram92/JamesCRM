/**
 * Unit tests for activity services
 */

describe('Activity Service', () => {
  // Mock dependencies
  const mockActivityRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
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
    getAllActivities: async () => {
      return await mockActivityRepository.findAll();
    },
    
    getActivityById: async (id) => {
      const activity = await mockActivityRepository.findById(id);
      
      if (!activity) {
        throw new Error('Activity not found');
      }
      
      return activity;
    },
    
    createActivity: async (activityData) => {
      return await mockActivityRepository.create({
        ...activityData,
        created_at: new Date(),
        updated_at: new Date()
      });
    },
    
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
    mockActivityRepository.findAll.mockReset();
    mockActivityRepository.findById.mockReset();
    mockActivityRepository.create.mockReset();
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
    mockActivityRepository.findAll.mockResolvedValue([
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
    ]);
    
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
    
    mockActivityRepository.create.mockImplementation((activityData) => ({
      id: 3,
      ...activityData
    }));
    
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

  describe('getAllActivities', () => {
    test('should return all activities', async () => {
      // Act
      const result = await activityService.getAllActivities();
      
      // Assert
      expect(mockActivityRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });
  
  describe('getActivityById', () => {
    test('should return activity by ID', async () => {
      // Arrange
      const activityId = 1;
      
      // Act
      const result = await activityService.getActivityById(activityId);
      
      // Assert
      expect(mockActivityRepository.findById).toHaveBeenCalledWith(activityId);
      expect(result).toEqual({
        id: activityId,
        type: 'Call',
        subject: 'Sales call',
        description: 'Discuss new product features',
        status: 'Completed',
        due_date: expect.any(Date),
        owner_id: 1,
        contact_id: 1,
        company_id: 1,
        deal_id: null,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
    
    test('should throw error when activity is not found', async () => {
      // Arrange
      const activityId = 999;
      
      // Act & Assert
      await expect(activityService.getActivityById(activityId)).rejects.toThrow('Activity not found');
      expect(mockActivityRepository.findById).toHaveBeenCalledWith(activityId);
    });
  });
  
  describe('createActivity', () => {
    test('should create a new activity', async () => {
      // Arrange
      const activityData = {
        type: 'Email',
        subject: 'Follow-up',
        description: 'Send follow-up email after meeting',
        status: 'Pending',
        due_date: new Date('2023-01-25T09:00:00Z'),
        owner_id: 2,
        contact_id: 3,
        company_id: 2,
        deal_id: 1
      };
      
      // Act
      const result = await activityService.createActivity(activityData);
      
      // Assert
      expect(mockActivityRepository.create).toHaveBeenCalledWith({
        ...activityData,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: 3,
        ...activityData,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
  });
});
