/**
 * Unit tests for reporting controller
 */

describe('Reporting Controller', () => {
  // Mock dependencies
  const mockReportingService = {
    generateSalesReport: jest.fn(),
    generateActivityReport: jest.fn(),
    generatePerformanceReport: jest.fn(),
    saveReport: jest.fn(),
    getReportById: jest.fn(),
    getUserReports: jest.fn()
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
  
  // Mock reporting controller
  const reportingController = {
    generateSalesReport: async (req, res) => {
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
        
        const report = await mockReportingService.generateSalesReport(startDate, endDate, req.user.id);
        res.json(report);
      } catch (error) {
        res.status(500).json({ message: 'Error generating sales report' });
      }
    },
    
    generateActivityReport: async (req, res) => {
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
        
        const report = await mockReportingService.generateActivityReport(startDate, endDate, req.user.id);
        res.json(report);
      } catch (error) {
        res.status(500).json({ message: 'Error generating activity report' });
      }
    },
    
    generatePerformanceReport: async (req, res) => {
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
        
        const report = await mockReportingService.generatePerformanceReport(startDate, endDate, req.user.id);
        res.json(report);
      } catch (error) {
        res.status(500).json({ message: 'Error generating performance report' });
      }
    },
    
    saveReport: async (req, res) => {
      try {
        const { report_type, report_data, name, description } = req.body;
        
        if (!report_type || !report_data) {
          return res.status(400).json({ message: 'Report type and data are required' });
        }
        
        const reportData = {
          type: report_type,
          data: report_data,
          name: name || `${report_type} Report`,
          description: description || '',
          created_by: req.user.id
        };
        
        const savedReport = await mockReportingService.saveReport(reportData);
        res.status(201).json(savedReport);
      } catch (error) {
        res.status(500).json({ message: 'Error saving report' });
      }
    },
    
    getReportById: async (req, res) => {
      try {
        const { id } = req.params;
        
        if (!id) {
          return res.status(400).json({ message: 'Report ID is required' });
        }
        
        const report = await mockReportingService.getReportById(id);
        
        if (!report) {
          return res.status(404).json({ message: 'Report not found' });
        }
        
        res.json(report);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching report' });
      }
    },
    
    getUserReports: async (req, res) => {
      try {
        const userId = req.user.id;
        const reports = await mockReportingService.getUserReports(userId);
        res.json(reports);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching user reports' });
      }
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSalesReport', () => {
    test('should generate a sales report', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      
      req.query = { start_date: startDate, end_date: endDate };
      
      const mockReport = {
        type: 'sales',
        period: {
          start: new Date(startDate),
          end: new Date(endDate)
        },
        generatedBy: req.user.id,
        generatedAt: new Date(),
        data: {
          total_deals: 10,
          total_value: 50000,
          by_stage: {
            lead: 2,
            qualified: 3,
            proposal: 2,
            negotiation: 1,
            closed_won: 1,
            closed_lost: 1
          },
          by_value: {
            lead: 5000,
            qualified: 15000,
            proposal: 10000,
            negotiation: 8000,
            closed_won: 7000,
            closed_lost: 5000
          }
        }
      };
      
      mockReportingService.generateSalesReport.mockResolvedValue(mockReport);
      
      // Act
      await reportingController.generateSalesReport(req, res);
      
      // Assert
      expect(mockReportingService.generateSalesReport).toHaveBeenCalledWith(new Date(startDate), new Date(endDate), req.user.id);
      expect(res.json).toHaveBeenCalledWith(mockReport);
    });
    
    test('should return 400 when start date is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const endDate = '2023-01-31';
      
      req.query = { end_date: endDate };
      
      // Act
      await reportingController.generateSalesReport(req, res);
      
      // Assert
      expect(mockReportingService.generateSalesReport).not.toHaveBeenCalled();
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
      await reportingController.generateSalesReport(req, res);
      
      // Assert
      expect(mockReportingService.generateSalesReport).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Start date and end date are required' });
    });
    
    test('should return 400 when date format is invalid', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { start_date: 'invalid-date', end_date: '2023-01-31' };
      
      // Act
      await reportingController.generateSalesReport(req, res);
      
      // Assert
      expect(mockReportingService.generateSalesReport).not.toHaveBeenCalled();
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
      
      mockReportingService.generateSalesReport.mockRejectedValue(new Error('Database error'));
      
      // Act
      await reportingController.generateSalesReport(req, res);
      
      // Assert
      expect(mockReportingService.generateSalesReport).toHaveBeenCalledWith(new Date(startDate), new Date(endDate), req.user.id);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error generating sales report' });
    });
  });
  
  describe('generateActivityReport', () => {
    test('should generate an activity report', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      
      req.query = { start_date: startDate, end_date: endDate };
      
      const mockReport = {
        type: 'activity',
        period: {
          start: new Date(startDate),
          end: new Date(endDate)
        },
        generatedBy: req.user.id,
        generatedAt: new Date(),
        data: {
          total_activities: 20,
          by_type: {
            call: 5,
            meeting: 3,
            email: 8,
            task: 4
          },
          by_status: {
            completed: 12,
            pending: 5,
            overdue: 3
          },
          completion_rate: 60
        }
      };
      
      mockReportingService.generateActivityReport.mockResolvedValue(mockReport);
      
      // Act
      await reportingController.generateActivityReport(req, res);
      
      // Assert
      expect(mockReportingService.generateActivityReport).toHaveBeenCalledWith(new Date(startDate), new Date(endDate), req.user.id);
      expect(res.json).toHaveBeenCalledWith(mockReport);
    });
    
    test('should return 400 when start date is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const endDate = '2023-01-31';
      
      req.query = { end_date: endDate };
      
      // Act
      await reportingController.generateActivityReport(req, res);
      
      // Assert
      expect(mockReportingService.generateActivityReport).not.toHaveBeenCalled();
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
      
      mockReportingService.generateActivityReport.mockRejectedValue(new Error('Database error'));
      
      // Act
      await reportingController.generateActivityReport(req, res);
      
      // Assert
      expect(mockReportingService.generateActivityReport).toHaveBeenCalledWith(new Date(startDate), new Date(endDate), req.user.id);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error generating activity report' });
    });
  });
  
  describe('generatePerformanceReport', () => {
    test('should generate a performance report', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      
      req.query = { start_date: startDate, end_date: endDate };
      
      const mockReport = {
        type: 'performance',
        period: {
          start: new Date(startDate),
          end: new Date(endDate)
        },
        generatedBy: req.user.id,
        generatedAt: new Date(),
        userPerformance: [
          {
            userId: 1,
            userName: 'John Doe',
            deals: {
              total: 3,
              won: 1,
              winRate: 33.33,
              totalValue: 30000,
              wonValue: 10000
            },
            activities: {
              total: 15,
              completed: 12,
              completionRate: 80
            }
          },
          {
            userId: 2,
            userName: 'Jane Smith',
            deals: {
              total: 5,
              won: 2,
              winRate: 40,
              totalValue: 50000,
              wonValue: 20000
            },
            activities: {
              total: 20,
              completed: 18,
              completionRate: 90
            }
          }
        ]
      };
      
      mockReportingService.generatePerformanceReport.mockResolvedValue(mockReport);
      
      // Act
      await reportingController.generatePerformanceReport(req, res);
      
      // Assert
      expect(mockReportingService.generatePerformanceReport).toHaveBeenCalledWith(new Date(startDate), new Date(endDate), req.user.id);
      expect(res.json).toHaveBeenCalledWith(mockReport);
    });
    
    test('should return 400 when start date is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const endDate = '2023-01-31';
      
      req.query = { end_date: endDate };
      
      // Act
      await reportingController.generatePerformanceReport(req, res);
      
      // Assert
      expect(mockReportingService.generatePerformanceReport).not.toHaveBeenCalled();
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
      
      mockReportingService.generatePerformanceReport.mockRejectedValue(new Error('Database error'));
      
      // Act
      await reportingController.generatePerformanceReport(req, res);
      
      // Assert
      expect(mockReportingService.generatePerformanceReport).toHaveBeenCalledWith(new Date(startDate), new Date(endDate), req.user.id);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error generating performance report' });
    });
  });
  
  describe('saveReport', () => {
    test('should save a report', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        report_type: 'sales',
        report_data: {
          total_deals: 10,
          total_value: 50000
        },
        name: 'Monthly Sales Report',
        description: 'Sales report for January 2023'
      };
      
      const reportData = {
        type: 'sales',
        data: {
          total_deals: 10,
          total_value: 50000
        },
        name: 'Monthly Sales Report',
        description: 'Sales report for January 2023',
        created_by: req.user.id
      };
      
      const savedReport = {
        id: 1,
        ...reportData,
        created_at: new Date()
      };
      
      mockReportingService.saveReport.mockResolvedValue(savedReport);
      
      // Act
      await reportingController.saveReport(req, res);
      
      // Assert
      expect(mockReportingService.saveReport).toHaveBeenCalledWith(reportData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(savedReport);
    });
    
    test('should return 400 when report type is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        report_data: {
          total_deals: 10,
          total_value: 50000
        }
      };
      
      // Act
      await reportingController.saveReport(req, res);
      
      // Assert
      expect(mockReportingService.saveReport).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Report type and data are required' });
    });
    
    test('should return 400 when report data is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        report_type: 'sales'
      };
      
      // Act
      await reportingController.saveReport(req, res);
      
      // Assert
      expect(mockReportingService.saveReport).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Report type and data are required' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        report_type: 'sales',
        report_data: {
          total_deals: 10,
          total_value: 50000
        }
      };
      
      mockReportingService.saveReport.mockRejectedValue(new Error('Database error'));
      
      // Act
      await reportingController.saveReport(req, res);
      
      // Assert
      expect(mockReportingService.saveReport).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error saving report' });
    });
  });
  
  describe('getReportById', () => {
    test('should return a report by ID', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const reportId = '1';
      
      req.params = { id: reportId };
      
      const mockReport = {
        id: 1,
        type: 'sales',
        data: {
          total_deals: 10,
          total_value: 50000
        },
        name: 'Monthly Sales Report',
        description: 'Sales report for January 2023',
        created_by: 1,
        created_at: new Date()
      };
      
      mockReportingService.getReportById.mockResolvedValue(mockReport);
      
      // Act
      await reportingController.getReportById(req, res);
      
      // Assert
      expect(mockReportingService.getReportById).toHaveBeenCalledWith(reportId);
      expect(res.json).toHaveBeenCalledWith(mockReport);
    });
    
    test('should return 400 when report ID is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {};
      
      // Act
      await reportingController.getReportById(req, res);
      
      // Assert
      expect(mockReportingService.getReportById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Report ID is required' });
    });
    
    test('should return 404 when report is not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const reportId = '999';
      
      req.params = { id: reportId };
      
      mockReportingService.getReportById.mockResolvedValue(null);
      
      // Act
      await reportingController.getReportById(req, res);
      
      // Assert
      expect(mockReportingService.getReportById).toHaveBeenCalledWith(reportId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Report not found' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const reportId = '1';
      
      req.params = { id: reportId };
      
      mockReportingService.getReportById.mockRejectedValue(new Error('Database error'));
      
      // Act
      await reportingController.getReportById(req, res);
      
      // Assert
      expect(mockReportingService.getReportById).toHaveBeenCalledWith(reportId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching report' });
    });
  });
  
  describe('getUserReports', () => {
    test('should return user reports', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      
      req.user.id = userId;
      
      const mockReports = [
        {
          id: 1,
          type: 'sales',
          data: {
            total_deals: 10,
            total_value: 50000
          },
          name: 'Monthly Sales Report',
          description: 'Sales report for January 2023',
          created_by: userId,
          created_at: new Date()
        },
        {
          id: 2,
          type: 'activity',
          data: {
            total_activities: 20,
            completion_rate: 60
          },
          name: 'Monthly Activity Report',
          description: 'Activity report for January 2023',
          created_by: userId,
          created_at: new Date()
        }
      ];
      
      mockReportingService.getUserReports.mockResolvedValue(mockReports);
      
      // Act
      await reportingController.getUserReports(req, res);
      
      // Assert
      expect(mockReportingService.getUserReports).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith(mockReports);
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      
      req.user.id = userId;
      
      mockReportingService.getUserReports.mockRejectedValue(new Error('Database error'));
      
      // Act
      await reportingController.getUserReports(req, res);
      
      // Assert
      expect(mockReportingService.getUserReports).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching user reports' });
    });
  });
});
