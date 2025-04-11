/**
 * Unit tests for analytics service
 */

describe('Analytics Service', () => {
  // Mock dependencies
  const mockDealRepository = {
    findByPeriod: jest.fn(),
    findByStage: jest.fn(),
    findByOwner: jest.fn()
  };
  
  const mockActivityRepository = {
    findByPeriod: jest.fn(),
    findByType: jest.fn(),
    findByUser: jest.fn()
  };
  
  // Mock analytics service
  const analyticsService = {
    getSalesFunnel: async (startDate, endDate) => {
      const deals = await mockDealRepository.findByPeriod(startDate, endDate);
      
      const stages = {
        lead: 0,
        qualified: 0,
        proposal: 0,
        negotiation: 0,
        closed_won: 0,
        closed_lost: 0
      };
      
      const values = {
        lead: 0,
        qualified: 0,
        proposal: 0,
        negotiation: 0,
        closed_won: 0,
        closed_lost: 0
      };
      
      deals.forEach(deal => {
        if (stages[deal.stage] !== undefined) {
          stages[deal.stage]++;
          values[deal.stage] += deal.amount || 0;
        }
      });
      
      return {
        count: stages,
        value: values,
        total_deals: deals.length,
        total_value: deals.reduce((sum, deal) => sum + (deal.amount || 0), 0),
        win_rate: stages.closed_won > 0 ? 
          (stages.closed_won / (stages.closed_won + stages.closed_lost)) * 100 : 0
      };
    },
    
    getActivityMetrics: async (startDate, endDate) => {
      const activities = await mockActivityRepository.findByPeriod(startDate, endDate);
      
      const types = {};
      const statuses = {
        completed: 0,
        pending: 0,
        overdue: 0
      };
      
      activities.forEach(activity => {
        // Count by type
        if (!types[activity.type]) {
          types[activity.type] = 0;
        }
        types[activity.type]++;
        
        // Count by status
        if (statuses[activity.status] !== undefined) {
          statuses[activity.status]++;
        }
      });
      
      return {
        by_type: types,
        by_status: statuses,
        total: activities.length,
        completion_rate: activities.length > 0 ? 
          (statuses.completed / activities.length) * 100 : 0
      };
    },
    
    getUserPerformance: async (userId, startDate, endDate) => {
      const deals = await mockDealRepository.findByOwner(userId);
      const activities = await mockActivityRepository.findByUser(userId);
      
      const filteredDeals = deals.filter(deal => {
        const dealDate = new Date(deal.created_at);
        return dealDate >= startDate && dealDate <= endDate;
      });
      
      const filteredActivities = activities.filter(activity => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= startDate && activityDate <= endDate;
      });
      
      const wonDeals = filteredDeals.filter(deal => deal.status === 'won');
      
      return {
        deals: {
          total: filteredDeals.length,
          won: wonDeals.length,
          win_rate: filteredDeals.length > 0 ? 
            (wonDeals.length / filteredDeals.length) * 100 : 0,
          total_value: filteredDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0),
          won_value: wonDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0)
        },
        activities: {
          total: filteredActivities.length,
          completed: filteredActivities.filter(a => a.status === 'completed').length,
          completion_rate: filteredActivities.length > 0 ? 
            (filteredActivities.filter(a => a.status === 'completed').length / filteredActivities.length) * 100 : 0
        }
      };
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockDealRepository.findByPeriod.mockReset();
    mockDealRepository.findByStage.mockReset();
    mockDealRepository.findByOwner.mockReset();
    mockActivityRepository.findByPeriod.mockReset();
    mockActivityRepository.findByType.mockReset();
    mockActivityRepository.findByUser.mockReset();
    
    // Default mock implementations
    mockDealRepository.findByPeriod.mockResolvedValue([
      { id: 1, name: 'Deal 1', stage: 'lead', amount: 1000, status: 'open', created_at: '2023-01-05' },
      { id: 2, name: 'Deal 2', stage: 'qualified', amount: 2000, status: 'open', created_at: '2023-01-10' },
      { id: 3, name: 'Deal 3', stage: 'proposal', amount: 3000, status: 'open', created_at: '2023-01-15' },
      { id: 4, name: 'Deal 4', stage: 'negotiation', amount: 4000, status: 'open', created_at: '2023-01-20' },
      { id: 5, name: 'Deal 5', stage: 'closed_won', amount: 5000, status: 'won', created_at: '2023-01-25' },
      { id: 6, name: 'Deal 6', stage: 'closed_lost', amount: 6000, status: 'lost', created_at: '2023-01-30' }
    ]);
    
    mockActivityRepository.findByPeriod.mockResolvedValue([
      { id: 1, type: 'call', status: 'completed', created_at: '2023-01-05' },
      { id: 2, type: 'meeting', status: 'completed', created_at: '2023-01-10' },
      { id: 3, type: 'email', status: 'pending', created_at: '2023-01-15' },
      { id: 4, type: 'call', status: 'overdue', created_at: '2023-01-20' }
    ]);
    
    mockDealRepository.findByOwner.mockImplementation((userId) => {
      if (userId === 1) {
        return [
          { id: 1, name: 'Deal 1', amount: 1000, status: 'open', owner_id: 1, created_at: '2023-01-05' },
          { id: 2, name: 'Deal 2', amount: 2000, status: 'won', owner_id: 1, created_at: '2023-01-15' }
        ];
      }
      return [];
    });
    
    mockActivityRepository.findByUser.mockImplementation((userId) => {
      if (userId === 1) {
        return [
          { id: 1, type: 'call', status: 'completed', user_id: 1, created_at: '2023-01-05' },
          { id: 2, type: 'meeting', status: 'completed', user_id: 1, created_at: '2023-01-10' },
          { id: 3, type: 'email', status: 'pending', user_id: 1, created_at: '2023-01-15' }
        ];
      }
      return [];
    });
  });

  describe('getSalesFunnel', () => {
    test('should return sales funnel data', async () => {
      // Arrange
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
      
      // Act
      const result = await analyticsService.getSalesFunnel(startDate, endDate);
      
      // Assert
      expect(mockDealRepository.findByPeriod).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual({
        count: {
          lead: 1,
          qualified: 1,
          proposal: 1,
          negotiation: 1,
          closed_won: 1,
          closed_lost: 1
        },
        value: {
          lead: 1000,
          qualified: 2000,
          proposal: 3000,
          negotiation: 4000,
          closed_won: 5000,
          closed_lost: 6000
        },
        total_deals: 6,
        total_value: 21000,
        win_rate: 50
      });
    });
    
    test('should handle empty deals array', async () => {
      // Arrange
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
      mockDealRepository.findByPeriod.mockResolvedValue([]);
      
      // Act
      const result = await analyticsService.getSalesFunnel(startDate, endDate);
      
      // Assert
      expect(mockDealRepository.findByPeriod).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual({
        count: {
          lead: 0,
          qualified: 0,
          proposal: 0,
          negotiation: 0,
          closed_won: 0,
          closed_lost: 0
        },
        value: {
          lead: 0,
          qualified: 0,
          proposal: 0,
          negotiation: 0,
          closed_won: 0,
          closed_lost: 0
        },
        total_deals: 0,
        total_value: 0,
        win_rate: 0
      });
    });
  });
  
  describe('getActivityMetrics', () => {
    test('should return activity metrics', async () => {
      // Arrange
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
      
      // Act
      const result = await analyticsService.getActivityMetrics(startDate, endDate);
      
      // Assert
      expect(mockActivityRepository.findByPeriod).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual({
        by_type: {
          call: 2,
          meeting: 1,
          email: 1
        },
        by_status: {
          completed: 2,
          pending: 1,
          overdue: 1
        },
        total: 4,
        completion_rate: 50
      });
    });
    
    test('should handle empty activities array', async () => {
      // Arrange
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
      mockActivityRepository.findByPeriod.mockResolvedValue([]);
      
      // Act
      const result = await analyticsService.getActivityMetrics(startDate, endDate);
      
      // Assert
      expect(mockActivityRepository.findByPeriod).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual({
        by_type: {},
        by_status: {
          completed: 0,
          pending: 0,
          overdue: 0
        },
        total: 0,
        completion_rate: 0
      });
    });
  });
  
  describe('getUserPerformance', () => {
    test('should return user performance data', async () => {
      // Arrange
      const userId = 1;
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
      
      // Act
      const result = await analyticsService.getUserPerformance(userId, startDate, endDate);
      
      // Assert
      expect(mockDealRepository.findByOwner).toHaveBeenCalledWith(userId);
      expect(mockActivityRepository.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        deals: {
          total: 2,
          won: 1,
          win_rate: 50,
          total_value: 3000,
          won_value: 2000
        },
        activities: {
          total: 3,
          completed: 2,
          completion_rate: 66.66666666666666
        }
      });
    });
    
    test('should handle user with no deals or activities', async () => {
      // Arrange
      const userId = 999;
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
      
      // Act
      const result = await analyticsService.getUserPerformance(userId, startDate, endDate);
      
      // Assert
      expect(mockDealRepository.findByOwner).toHaveBeenCalledWith(userId);
      expect(mockActivityRepository.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        deals: {
          total: 0,
          won: 0,
          win_rate: 0,
          total_value: 0,
          won_value: 0
        },
        activities: {
          total: 0,
          completed: 0,
          completion_rate: 0
        }
      });
    });
  });
});
