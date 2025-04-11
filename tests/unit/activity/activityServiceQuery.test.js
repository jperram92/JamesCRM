/**
 * Unit tests for activity service - query operations
 */

describe('Activity Service - Query Operations', () => {
  // Mock dependencies
  const mockActivityRepository = {
    findByCompanyId: jest.fn(),
    findByDealId: jest.fn(),
    findByType: jest.fn(),
    findByStatus: jest.fn(),
    findByDateRange: jest.fn()
  };
  
  // Mock activity service
  const activityService = {
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
    mockActivityRepository.findByCompanyId.mockReset();
    mockActivityRepository.findByDealId.mockReset();
    mockActivityRepository.findByType.mockReset();
    mockActivityRepository.findByStatus.mockReset();
    mockActivityRepository.findByDateRange.mockReset();
    
    // Default mock implementations
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

  describe('getActivitiesByCompany', () => {
    test('should return activities for company 1', async () => {
      // Arrange
      const companyId = 1;
      
      // Act
      const result = await activityService.getActivitiesByCompany(companyId);
      
      // Assert
      expect(mockActivityRepository.findByCompanyId).toHaveBeenCalledWith(companyId);
      expect(result).toHaveLength(1);
      expect(result[0].company_id).toBe(companyId);
      expect(result[0].type).toBe('Call');
    });
    
    test('should return activities for company 2', async () => {
      // Arrange
      const companyId = 2;
      
      // Act
      const result = await activityService.getActivitiesByCompany(companyId);
      
      // Assert
      expect(mockActivityRepository.findByCompanyId).toHaveBeenCalledWith(companyId);
      expect(result).toHaveLength(1);
      expect(result[0].company_id).toBe(companyId);
      expect(result[0].type).toBe('Meeting');
    });
    
    test('should return empty array when company has no activities', async () => {
      // Arrange
      const companyId = 999;
      
      // Act
      const result = await activityService.getActivitiesByCompany(companyId);
      
      // Assert
      expect(mockActivityRepository.findByCompanyId).toHaveBeenCalledWith(companyId);
      expect(result).toEqual([]);
    });
  });
  
  describe('getActivitiesByDeal', () => {
    test('should return activities for a deal', async () => {
      // Arrange
      const dealId = 1;
      
      // Act
      const result = await activityService.getActivitiesByDeal(dealId);
      
      // Assert
      expect(mockActivityRepository.findByDealId).toHaveBeenCalledWith(dealId);
      expect(result).toHaveLength(1);
      expect(result[0].deal_id).toBe(dealId);
      expect(result[0].type).toBe('Meeting');
    });
    
    test('should return empty array when deal has no activities', async () => {
      // Arrange
      const dealId = 999;
      
      // Act
      const result = await activityService.getActivitiesByDeal(dealId);
      
      // Assert
      expect(mockActivityRepository.findByDealId).toHaveBeenCalledWith(dealId);
      expect(result).toEqual([]);
    });
  });
  
  describe('getActivitiesByType', () => {
    test('should return activities with Call type', async () => {
      // Arrange
      const type = 'Call';
      
      // Act
      const result = await activityService.getActivitiesByType(type);
      
      // Assert
      expect(mockActivityRepository.findByType).toHaveBeenCalledWith(type);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(type);
      expect(result[0].subject).toBe('Sales call');
    });
    
    test('should return activities with Meeting type', async () => {
      // Arrange
      const type = 'Meeting';
      
      // Act
      const result = await activityService.getActivitiesByType(type);
      
      // Assert
      expect(mockActivityRepository.findByType).toHaveBeenCalledWith(type);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(type);
      expect(result[0].subject).toBe('Product demo');
    });
    
    test('should return empty array when no activities with type exist', async () => {
      // Arrange
      const type = 'Nonexistent Type';
      
      // Act
      const result = await activityService.getActivitiesByType(type);
      
      // Assert
      expect(mockActivityRepository.findByType).toHaveBeenCalledWith(type);
      expect(result).toEqual([]);
    });
  });
  
  describe('getActivitiesByStatus', () => {
    test('should return activities with Completed status', async () => {
      // Arrange
      const status = 'Completed';
      
      // Act
      const result = await activityService.getActivitiesByStatus(status);
      
      // Assert
      expect(mockActivityRepository.findByStatus).toHaveBeenCalledWith(status);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(status);
      expect(result[0].type).toBe('Call');
    });
    
    test('should return activities with Scheduled status', async () => {
      // Arrange
      const status = 'Scheduled';
      
      // Act
      const result = await activityService.getActivitiesByStatus(status);
      
      // Assert
      expect(mockActivityRepository.findByStatus).toHaveBeenCalledWith(status);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(status);
      expect(result[0].type).toBe('Meeting');
    });
    
    test('should return empty array when no activities with status exist', async () => {
      // Arrange
      const status = 'Nonexistent Status';
      
      // Act
      const result = await activityService.getActivitiesByStatus(status);
      
      // Assert
      expect(mockActivityRepository.findByStatus).toHaveBeenCalledWith(status);
      expect(result).toEqual([]);
    });
  });
  
  describe('getActivitiesByDateRange', () => {
    test('should return activities within date range', async () => {
      // Arrange
      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-31T23:59:59Z');
      
      // Act
      const result = await activityService.getActivitiesByDateRange(startDate, endDate);
      
      // Assert
      expect(mockActivityRepository.findByDateRange).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toHaveLength(2);
    });
    
    test('should return activities for first half of January', async () => {
      // Arrange
      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-15T23:59:59Z');
      
      // Mock implementation for this specific test
      mockActivityRepository.findByDateRange.mockImplementation((start, end) => {
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
          }
        ];
      });
      
      // Act
      const result = await activityService.getActivitiesByDateRange(startDate, endDate);
      
      // Assert
      expect(mockActivityRepository.findByDateRange).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].type).toBe('Call');
    });
    
    test('should return activities for second half of January', async () => {
      // Arrange
      const startDate = new Date('2023-01-16T00:00:00Z');
      const endDate = new Date('2023-01-31T23:59:59Z');
      
      // Mock implementation for this specific test
      mockActivityRepository.findByDateRange.mockImplementation((start, end) => {
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
            deal_id: 1,
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: new Date('2023-01-02T00:00:00Z')
          }
        ];
      });
      
      // Act
      const result = await activityService.getActivitiesByDateRange(startDate, endDate);
      
      // Assert
      expect(mockActivityRepository.findByDateRange).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
      expect(result[0].type).toBe('Meeting');
    });
    
    test('should return empty array when no activities in date range', async () => {
      // Arrange
      const startDate = new Date('2023-02-01T00:00:00Z');
      const endDate = new Date('2023-02-28T23:59:59Z');
      
      // Mock implementation for this specific test
      mockActivityRepository.findByDateRange.mockResolvedValue([]);
      
      // Act
      const result = await activityService.getActivitiesByDateRange(startDate, endDate);
      
      // Assert
      expect(mockActivityRepository.findByDateRange).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual([]);
    });
    
    test('should return empty array when start date is after end date', async () => {
      // Arrange
      const startDate = new Date('2023-02-01T00:00:00Z');
      const endDate = new Date('2023-01-01T00:00:00Z');
      
      // Act
      const result = await activityService.getActivitiesByDateRange(startDate, endDate);
      
      // Assert
      expect(mockActivityRepository.findByDateRange).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual([]);
    });
  });
});
