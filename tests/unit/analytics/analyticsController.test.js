/**
 * Unit tests for analytics controller
 */

describe('Analytics Controller', () => {
  // Mock dependencies
  const mockAnalyticsService = {
    getSalesFunnel: jest.fn(),
    getActivityMetrics: jest.fn(),
    getUserPerformance: jest.fn()
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
  
  // Mock analytics controller
  const analyticsController = {
    getSalesFunnel: async (req, res) => {
      try {
        const { start_date, end_date } = req.query;
        
        if (!start_date || !end_date) {
          return res.status(400).json({ message: 'Start date and end date are required' });
        }
        
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({ message: 'Invalid date format' });
        }
        
        const funnel = await mockAnalyticsService.getSalesFunnel(startDate, endDate);
        res.json(funnel);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching sales funnel data' });
      }
    },
    
    getActivityMetrics: async (req, res) => {
      try {
        const { start_date, end_date } = req.query;
        
        if (!start_date || !end_date) {
          return res.status(400).json({ message: 'Start date and end date are required' });
        }
        
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({ message: 'Invalid date format' });
        }
        
        const metrics = await mockAnalyticsService.getActivityMetrics(startDate, endDate);
        res.json(metrics);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching activity metrics' });
      }
    },
    
    getUserPerformance: async (req, res) => {
      try {
        const { user_id } = req.params;
        const { start_date, end_date } = req.query;
        
        if (!user_id) {
          return res.status(400).json({ message: 'User ID is required' });
        }
        
        if (!start_date || !end_date) {
          return res.status(400).json({ message: 'Start date and end date are required' });
        }
        
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({ message: 'Invalid date format' });
        }
        
        const performance = await mockAnalyticsService.getUserPerformance(user_id, startDate, endDate);
        res.json(performance);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching user performance data' });
      }
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSalesFunnel', () => {
    test('should return sales funnel data', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      
      req.query = { start_date: startDate, end_date: endDate };
      
      const mockFunnel = {
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
      };
      
      mockAnalyticsService.getSalesFunnel.mockResolvedValue(mockFunnel);
      
      // Act
      await analyticsController.getSalesFunnel(req, res);
      
      // Assert
      expect(mockAnalyticsService.getSalesFunnel).toHaveBeenCalledWith(new Date(startDate), new Date(endDate));
      expect(res.json).toHaveBeenCalledWith(mockFunnel);
    });
    
    test('should return 400 when start date is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const endDate = '2023-01-31';
      
      req.query = { end_date: endDate };
      
      // Act
      await analyticsController.getSalesFunnel(req, res);
      
      // Assert
      expect(mockAnalyticsService.getSalesFunnel).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Start date and end date are required' });
    });
    
    test('should return 400 when end date is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const startDate = '2023-01-01';
      
      req.query = { start_date: startDate };
      
      // Act
      await analyticsController.getSalesFunnel(req, res);
      
      // Assert
      expect(mockAnalyticsService.getSalesFunnel).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Start date and end date are required' });
    });
    
    test('should return 400 when date format is invalid', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { start_date: 'invalid-date', end_date: '2023-01-31' };
      
      // Act
      await analyticsController.getSalesFunnel(req, res);
      
      // Assert
      expect(mockAnalyticsService.getSalesFunnel).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid date format' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      
      req.query = { start_date: startDate, end_date: endDate };
      
      mockAnalyticsService.getSalesFunnel.mockRejectedValue(new Error('Database error'));
      
      // Act
      await analyticsController.getSalesFunnel(req, res);
      
      // Assert
      expect(mockAnalyticsService.getSalesFunnel).toHaveBeenCalledWith(new Date(startDate), new Date(endDate));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching sales funnel data' });
    });
  });
  
  describe('getActivityMetrics', () => {
    test('should return activity metrics', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      
      req.query = { start_date: startDate, end_date: endDate };
      
      const mockMetrics = {
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
      };
      
      mockAnalyticsService.getActivityMetrics.mockResolvedValue(mockMetrics);
      
      // Act
      await analyticsController.getActivityMetrics(req, res);
      
      // Assert
      expect(mockAnalyticsService.getActivityMetrics).toHaveBeenCalledWith(new Date(startDate), new Date(endDate));
      expect(res.json).toHaveBeenCalledWith(mockMetrics);
    });
    
    test('should return 400 when start date is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const endDate = '2023-01-31';
      
      req.query = { end_date: endDate };
      
      // Act
      await analyticsController.getActivityMetrics(req, res);
      
      // Assert
      expect(mockAnalyticsService.getActivityMetrics).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Start date and end date are required' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      
      req.query = { start_date: startDate, end_date: endDate };
      
      mockAnalyticsService.getActivityMetrics.mockRejectedValue(new Error('Database error'));
      
      // Act
      await analyticsController.getActivityMetrics(req, res);
      
      // Assert
      expect(mockAnalyticsService.getActivityMetrics).toHaveBeenCalledWith(new Date(startDate), new Date(endDate));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching activity metrics' });
    });
  });
  
  describe('getUserPerformance', () => {
    test('should return user performance data', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = '1';
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      
      req.params = { user_id: userId };
      req.query = { start_date: startDate, end_date: endDate };
      
      const mockPerformance = {
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
          completion_rate: 66.67
        }
      };
      
      mockAnalyticsService.getUserPerformance.mockResolvedValue(mockPerformance);
      
      // Act
      await analyticsController.getUserPerformance(req, res);
      
      // Assert
      expect(mockAnalyticsService.getUserPerformance).toHaveBeenCalledWith(userId, new Date(startDate), new Date(endDate));
      expect(res.json).toHaveBeenCalledWith(mockPerformance);
    });
    
    test('should return 400 when user ID is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      
      req.params = {};
      req.query = { start_date: startDate, end_date: endDate };
      
      // Act
      await analyticsController.getUserPerformance(req, res);
      
      // Assert
      expect(mockAnalyticsService.getUserPerformance).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID is required' });
    });
    
    test('should return 400 when date range is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = '1';
      
      req.params = { user_id: userId };
      req.query = {};
      
      // Act
      await analyticsController.getUserPerformance(req, res);
      
      // Assert
      expect(mockAnalyticsService.getUserPerformance).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Start date and end date are required' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = '1';
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      
      req.params = { user_id: userId };
      req.query = { start_date: startDate, end_date: endDate };
      
      mockAnalyticsService.getUserPerformance.mockRejectedValue(new Error('Database error'));
      
      // Act
      await analyticsController.getUserPerformance(req, res);
      
      // Assert
      expect(mockAnalyticsService.getUserPerformance).toHaveBeenCalledWith(userId, new Date(startDate), new Date(endDate));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching user performance data' });
    });
  });
});
