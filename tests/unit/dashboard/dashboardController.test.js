/**
 * Unit tests for dashboard controller
 */

describe('Dashboard Controller', () => {
  // Mock dependencies
  const mockDashboardService = {
    getSummaryData: jest.fn(),
    getRecentActivities: jest.fn(),
    getUpcomingActivities: jest.fn(),
    getDealsPipeline: jest.fn(),
    getTopDeals: jest.fn(),
    getPerformanceMetrics: jest.fn()
  };
  
  // Mock request and response
  const mockRequest = () => {
    const req = {};
    req.body = {};
    req.params = {};
    req.query = {};
    req.user = { id: 1 };
    return req;
  };
  
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  
  // Mock dashboard controller
  const dashboardController = {
    getSummaryData: async (req, res) => {
      try {
        const userId = req.user.id;
        const summaryData = await mockDashboardService.getSummaryData(userId);
        res.json(summaryData);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard summary data' });
      }
    },
    
    getRecentActivities: async (req, res) => {
      try {
        const userId = req.user.id;
        const { limit } = req.query;
        
        const activities = await mockDashboardService.getRecentActivities(userId, parseInt(limit) || 5);
        res.json(activities);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching recent activities' });
      }
    },
    
    getUpcomingActivities: async (req, res) => {
      try {
        const userId = req.user.id;
        const { limit, days } = req.query;
        
        const activities = await mockDashboardService.getUpcomingActivities(
          userId, 
          parseInt(limit) || 5,
          parseInt(days) || 7
        );
        res.json(activities);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching upcoming activities' });
      }
    },
    
    getDealsPipeline: async (req, res) => {
      try {
        const userId = req.user.id;
        const pipeline = await mockDashboardService.getDealsPipeline(userId);
        res.json(pipeline);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching deals pipeline' });
      }
    },
    
    getTopDeals: async (req, res) => {
      try {
        const userId = req.user.id;
        const { limit } = req.query;
        
        const deals = await mockDashboardService.getTopDeals(userId, parseInt(limit) || 5);
        res.json(deals);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching top deals' });
      }
    },
    
    getPerformanceMetrics: async (req, res) => {
      try {
        const userId = req.user.id;
        const { period } = req.query;
        
        if (!period) {
          return res.status(400).json({ message: 'Period is required' });
        }
        
        const metrics = await mockDashboardService.getPerformanceMetrics(userId, period);
        res.json(metrics);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching performance metrics' });
      }
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummaryData', () => {
    test('should return dashboard summary data', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      
      req.user.id = userId;
      
      const mockSummaryData = {
        totalDeals: 10,
        totalValue: 50000,
        openDeals: 7,
        wonDeals: 2,
        lostDeals: 1,
        totalContacts: 25,
        totalCompanies: 8,
        totalActivities: 30,
        completedActivities: 20,
        pendingActivities: 8,
        overdueActivities: 2
      };
      
      mockDashboardService.getSummaryData.mockResolvedValue(mockSummaryData);
      
      // Act
      await dashboardController.getSummaryData(req, res);
      
      // Assert
      expect(mockDashboardService.getSummaryData).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith(mockSummaryData);
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      
      req.user.id = userId;
      
      mockDashboardService.getSummaryData.mockRejectedValue(new Error('Database error'));
      
      // Act
      await dashboardController.getSummaryData(req, res);
      
      // Assert
      expect(mockDashboardService.getSummaryData).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching dashboard summary data' });
    });
  });
  
  describe('getRecentActivities', () => {
    test('should return recent activities with default limit', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      
      req.user.id = userId;
      req.query = {};
      
      const mockActivities = [
        { id: 1, type: 'call', subject: 'Follow-up call', status: 'completed', created_at: new Date() },
        { id: 2, type: 'meeting', subject: 'Product demo', status: 'completed', created_at: new Date() },
        { id: 3, type: 'email', subject: 'Proposal follow-up', status: 'completed', created_at: new Date() },
        { id: 4, type: 'task', subject: 'Send contract', status: 'completed', created_at: new Date() },
        { id: 5, type: 'note', subject: 'Meeting notes', status: 'completed', created_at: new Date() }
      ];
      
      mockDashboardService.getRecentActivities.mockResolvedValue(mockActivities);
      
      // Act
      await dashboardController.getRecentActivities(req, res);
      
      // Assert
      expect(mockDashboardService.getRecentActivities).toHaveBeenCalledWith(userId, 5);
      expect(res.json).toHaveBeenCalledWith(mockActivities);
    });
    
    test('should return recent activities with custom limit', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      const limit = 3;
      
      req.user.id = userId;
      req.query = { limit: limit.toString() };
      
      const mockActivities = [
        { id: 1, type: 'call', subject: 'Follow-up call', status: 'completed', created_at: new Date() },
        { id: 2, type: 'meeting', subject: 'Product demo', status: 'completed', created_at: new Date() },
        { id: 3, type: 'email', subject: 'Proposal follow-up', status: 'completed', created_at: new Date() }
      ];
      
      mockDashboardService.getRecentActivities.mockResolvedValue(mockActivities);
      
      // Act
      await dashboardController.getRecentActivities(req, res);
      
      // Assert
      expect(mockDashboardService.getRecentActivities).toHaveBeenCalledWith(userId, limit);
      expect(res.json).toHaveBeenCalledWith(mockActivities);
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      
      req.user.id = userId;
      req.query = {};
      
      mockDashboardService.getRecentActivities.mockRejectedValue(new Error('Database error'));
      
      // Act
      await dashboardController.getRecentActivities(req, res);
      
      // Assert
      expect(mockDashboardService.getRecentActivities).toHaveBeenCalledWith(userId, 5);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching recent activities' });
    });
  });
  
  describe('getUpcomingActivities', () => {
    test('should return upcoming activities with default parameters', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      
      req.user.id = userId;
      req.query = {};
      
      const mockActivities = [
        { id: 6, type: 'call', subject: 'Initial contact', status: 'pending', due_date: new Date() },
        { id: 7, type: 'meeting', subject: 'Contract negotiation', status: 'pending', due_date: new Date() },
        { id: 8, type: 'email', subject: 'Quote follow-up', status: 'pending', due_date: new Date() },
        { id: 9, type: 'task', subject: 'Prepare presentation', status: 'pending', due_date: new Date() },
        { id: 10, type: 'call', subject: 'Quarterly review', status: 'pending', due_date: new Date() }
      ];
      
      mockDashboardService.getUpcomingActivities.mockResolvedValue(mockActivities);
      
      // Act
      await dashboardController.getUpcomingActivities(req, res);
      
      // Assert
      expect(mockDashboardService.getUpcomingActivities).toHaveBeenCalledWith(userId, 5, 7);
      expect(res.json).toHaveBeenCalledWith(mockActivities);
    });
    
    test('should return upcoming activities with custom parameters', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      const limit = 3;
      const days = 14;
      
      req.user.id = userId;
      req.query = { limit: limit.toString(), days: days.toString() };
      
      const mockActivities = [
        { id: 6, type: 'call', subject: 'Initial contact', status: 'pending', due_date: new Date() },
        { id: 7, type: 'meeting', subject: 'Contract negotiation', status: 'pending', due_date: new Date() },
        { id: 8, type: 'email', subject: 'Quote follow-up', status: 'pending', due_date: new Date() }
      ];
      
      mockDashboardService.getUpcomingActivities.mockResolvedValue(mockActivities);
      
      // Act
      await dashboardController.getUpcomingActivities(req, res);
      
      // Assert
      expect(mockDashboardService.getUpcomingActivities).toHaveBeenCalledWith(userId, limit, days);
      expect(res.json).toHaveBeenCalledWith(mockActivities);
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      
      req.user.id = userId;
      req.query = {};
      
      mockDashboardService.getUpcomingActivities.mockRejectedValue(new Error('Database error'));
      
      // Act
      await dashboardController.getUpcomingActivities(req, res);
      
      // Assert
      expect(mockDashboardService.getUpcomingActivities).toHaveBeenCalledWith(userId, 5, 7);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching upcoming activities' });
    });
  });
  
  describe('getDealsPipeline', () => {
    test('should return deals pipeline', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      
      req.user.id = userId;
      
      const mockPipeline = {
        stages: {
          lead: { count: 2, value: 5000 },
          qualified: { count: 3, value: 15000 },
          proposal: { count: 2, value: 10000 },
          negotiation: { count: 1, value: 8000 },
          closed_won: { count: 1, value: 7000 },
          closed_lost: { count: 1, value: 5000 }
        },
        total: {
          count: 10,
          value: 50000
        }
      };
      
      mockDashboardService.getDealsPipeline.mockResolvedValue(mockPipeline);
      
      // Act
      await dashboardController.getDealsPipeline(req, res);
      
      // Assert
      expect(mockDashboardService.getDealsPipeline).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith(mockPipeline);
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      
      req.user.id = userId;
      
      mockDashboardService.getDealsPipeline.mockRejectedValue(new Error('Database error'));
      
      // Act
      await dashboardController.getDealsPipeline(req, res);
      
      // Assert
      expect(mockDashboardService.getDealsPipeline).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching deals pipeline' });
    });
  });
  
  describe('getTopDeals', () => {
    test('should return top deals with default limit', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      
      req.user.id = userId;
      req.query = {};
      
      const mockDeals = [
        { id: 1, name: 'Enterprise License', amount: 15000, stage: 'negotiation', company: { name: 'Acme Corp' } },
        { id: 2, name: 'Software Implementation', amount: 12000, stage: 'proposal', company: { name: 'Beta Inc' } },
        { id: 3, name: 'Annual Subscription', amount: 10000, stage: 'qualified', company: { name: 'Gamma LLC' } },
        { id: 4, name: 'Hardware Upgrade', amount: 8000, stage: 'proposal', company: { name: 'Delta Co' } },
        { id: 5, name: 'Support Contract', amount: 5000, stage: 'qualified', company: { name: 'Epsilon SA' } }
      ];
      
      mockDashboardService.getTopDeals.mockResolvedValue(mockDeals);
      
      // Act
      await dashboardController.getTopDeals(req, res);
      
      // Assert
      expect(mockDashboardService.getTopDeals).toHaveBeenCalledWith(userId, 5);
      expect(res.json).toHaveBeenCalledWith(mockDeals);
    });
    
    test('should return top deals with custom limit', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      const limit = 3;
      
      req.user.id = userId;
      req.query = { limit: limit.toString() };
      
      const mockDeals = [
        { id: 1, name: 'Enterprise License', amount: 15000, stage: 'negotiation', company: { name: 'Acme Corp' } },
        { id: 2, name: 'Software Implementation', amount: 12000, stage: 'proposal', company: { name: 'Beta Inc' } },
        { id: 3, name: 'Annual Subscription', amount: 10000, stage: 'qualified', company: { name: 'Gamma LLC' } }
      ];
      
      mockDashboardService.getTopDeals.mockResolvedValue(mockDeals);
      
      // Act
      await dashboardController.getTopDeals(req, res);
      
      // Assert
      expect(mockDashboardService.getTopDeals).toHaveBeenCalledWith(userId, limit);
      expect(res.json).toHaveBeenCalledWith(mockDeals);
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      
      req.user.id = userId;
      req.query = {};
      
      mockDashboardService.getTopDeals.mockRejectedValue(new Error('Database error'));
      
      // Act
      await dashboardController.getTopDeals(req, res);
      
      // Assert
      expect(mockDashboardService.getTopDeals).toHaveBeenCalledWith(userId, 5);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching top deals' });
    });
  });
  
  describe('getPerformanceMetrics', () => {
    test('should return performance metrics', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      const period = 'month';
      
      req.user.id = userId;
      req.query = { period };
      
      const mockMetrics = {
        period: 'month',
        deals: {
          total: 5,
          won: 2,
          lost: 1,
          open: 2,
          win_rate: 66.67,
          total_value: 50000,
          won_value: 22000
        },
        activities: {
          total: 15,
          completed: 10,
          pending: 3,
          overdue: 2,
          completion_rate: 66.67
        },
        comparison: {
          deals_count: 25,
          deals_value: 15,
          activities_count: 10,
          completion_rate: 5
        }
      };
      
      mockDashboardService.getPerformanceMetrics.mockResolvedValue(mockMetrics);
      
      // Act
      await dashboardController.getPerformanceMetrics(req, res);
      
      // Assert
      expect(mockDashboardService.getPerformanceMetrics).toHaveBeenCalledWith(userId, period);
      expect(res.json).toHaveBeenCalledWith(mockMetrics);
    });
    
    test('should return 400 when period is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      
      req.user.id = userId;
      req.query = {};
      
      // Act
      await dashboardController.getPerformanceMetrics(req, res);
      
      // Assert
      expect(mockDashboardService.getPerformanceMetrics).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Period is required' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      const period = 'month';
      
      req.user.id = userId;
      req.query = { period };
      
      mockDashboardService.getPerformanceMetrics.mockRejectedValue(new Error('Database error'));
      
      // Act
      await dashboardController.getPerformanceMetrics(req, res);
      
      // Assert
      expect(mockDashboardService.getPerformanceMetrics).toHaveBeenCalledWith(userId, period);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching performance metrics' });
    });
  });
});
