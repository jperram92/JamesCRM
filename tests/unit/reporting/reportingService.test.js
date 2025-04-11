/**
 * Unit tests for reporting service
 */

describe('Reporting Service', () => {
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

  const mockReportRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn()
  };

  // Mock reporting service
  const reportingService = {
    getDealsByPeriod: async (startDate, endDate) => {
      return await mockDealRepository.findByPeriod(startDate, endDate);
    },

    getDealsByStage: async (stage) => {
      return await mockDealRepository.findByStage(stage);
    },

    getDealsByOwner: async (ownerId) => {
      return await mockDealRepository.findByOwner(ownerId);
    },

    getActivitiesByPeriod: async (startDate, endDate) => {
      return await mockActivityRepository.findByPeriod(startDate, endDate);
    },

    getActivitiesByType: async (type) => {
      return await mockActivityRepository.findByType(type);
    },

    getActivitiesByUser: async (userId) => {
      return await mockActivityRepository.findByUser(userId);
    },

    generateReport: async (type, data) => {
      const report = {
        type,
        ...data,
        generatedAt: new Date(),
        generatedBy: data.userId || 1
      };

      return await mockReportRepository.create(report);
    },

    saveReport: async (report) => {
      return await mockReportRepository.create(report);
    },

    generateSalesReport: async (startDate, endDate, userId) => {
      const deals = await mockDealRepository.findByPeriod(startDate, endDate);

      const totalDeals = deals.length;
      const totalAmount = deals.reduce((sum, deal) => sum + deal.amount, 0);
      const wonDeals = deals.filter(deal => deal.status === 'won');
      const lostDeals = deals.filter(deal => deal.status === 'lost');
      const openDeals = deals.filter(deal => deal.status === 'open');

      const report = {
        type: 'sales',
        period: { start: startDate, end: endDate },
        totalDeals,
        totalAmount,
        wonDeals: wonDeals.length,
        wonAmount: wonDeals.reduce((sum, deal) => sum + deal.amount, 0),
        lostDeals: lostDeals.length,
        lostAmount: lostDeals.reduce((sum, deal) => sum + deal.amount, 0),
        openDeals: openDeals.length,
        openAmount: openDeals.reduce((sum, deal) => sum + deal.amount, 0),
        winRate: totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0,
        generatedAt: new Date(),
        generatedBy: userId || 1
      };

      return await mockReportRepository.create(report);
    },

    generateActivityReport: async (startDate, endDate, userId) => {
      const activities = await mockActivityRepository.findByPeriod(startDate, endDate);

      const totalActivities = activities.length;
      const completedActivities = activities.filter(activity => activity.status === 'completed');
      const pendingActivities = activities.filter(activity => activity.status === 'pending');

      const activityTypes = {};
      activities.forEach(activity => {
        if (!activityTypes[activity.type]) {
          activityTypes[activity.type] = 0;
        }
        activityTypes[activity.type]++;
      });

      const report = {
        type: 'activity',
        period: { start: startDate, end: endDate },
        totalActivities,
        completedActivities: completedActivities.length,
        pendingActivities: pendingActivities.length,
        completionRate: totalActivities > 0 ? (completedActivities.length / totalActivities) * 100 : 0,
        activityTypes,
        generatedAt: new Date(),
        generatedBy: userId || 1
      };

      return await mockReportRepository.create(report);
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
    mockReportRepository.create.mockReset();

    // Default mock implementations
    mockDealRepository.findByPeriod.mockResolvedValue([
      {
        id: 1,
        name: 'Deal 1',
        amount: 1000,
        status: 'open',
        created_at: new Date('2023-01-01T00:00:00Z')
      },
      {
        id: 2,
        name: 'Deal 2',
        amount: 2000,
        status: 'won',
        created_at: new Date('2023-01-15T00:00:00Z')
      }
    ]);

    mockDealRepository.findByStage.mockImplementation((stage) => {
      if (stage === 'open') {
        return [
          {
            id: 1,
            name: 'Deal 1',
            amount: 1000,
            status: 'open',
            created_at: new Date('2023-01-01T00:00:00Z')
          },
          {
            id: 3,
            name: 'Deal 3',
            amount: 3000,
            status: 'open',
            created_at: new Date('2023-01-20T00:00:00Z')
          }
        ];
      }

      if (stage === 'won') {
        return [
          {
            id: 2,
            name: 'Deal 2',
            amount: 2000,
            status: 'won',
            created_at: new Date('2023-01-15T00:00:00Z')
          }
        ];
      }

      if (stage === 'lost') {
        return [
          {
            id: 4,
            name: 'Deal 4',
            amount: 4000,
            status: 'lost',
            created_at: new Date('2023-01-25T00:00:00Z')
          }
        ];
      }

      return [];
    });

    mockDealRepository.findByOwner.mockImplementation((ownerId) => {
      if (ownerId === 1) {
        return [
          {
            id: 1,
            name: 'Deal 1',
            amount: 1000,
            status: 'open',
            owner_id: 1,
            created_at: new Date('2023-01-01T00:00:00Z')
          },
          {
            id: 2,
            name: 'Deal 2',
            amount: 2000,
            status: 'won',
            owner_id: 1,
            created_at: new Date('2023-01-15T00:00:00Z')
          }
        ];
      }

      if (ownerId === 2) {
        return [
          {
            id: 3,
            name: 'Deal 3',
            amount: 3000,
            status: 'open',
            owner_id: 2,
            created_at: new Date('2023-01-20T00:00:00Z')
          },
          {
            id: 4,
            name: 'Deal 4',
            amount: 4000,
            status: 'lost',
            owner_id: 2,
            created_at: new Date('2023-01-25T00:00:00Z')
          }
        ];
      }

      return [];
    });

    mockActivityRepository.findByPeriod.mockResolvedValue([
      {
        id: 1,
        type: 'call',
        subject: 'Sales Call',
        status: 'completed',
        created_at: new Date('2023-01-05T00:00:00Z')
      },
      {
        id: 2,
        type: 'meeting',
        subject: 'Product Demo',
        status: 'completed',
        created_at: new Date('2023-01-10T00:00:00Z')
      },
      {
        id: 3,
        type: 'email',
        subject: 'Follow-up Email',
        status: 'pending',
        created_at: new Date('2023-01-15T00:00:00Z')
      }
    ]);

    mockActivityRepository.findByType.mockImplementation((type) => {
      if (type === 'call') {
        return [
          {
            id: 1,
            type: 'call',
            subject: 'Sales Call',
            status: 'completed',
            created_at: new Date('2023-01-05T00:00:00Z')
          },
          {
            id: 4,
            type: 'call',
            subject: 'Follow-up Call',
            status: 'pending',
            created_at: new Date('2023-01-20T00:00:00Z')
          }
        ];
      }

      if (type === 'meeting') {
        return [
          {
            id: 2,
            type: 'meeting',
            subject: 'Product Demo',
            status: 'completed',
            created_at: new Date('2023-01-10T00:00:00Z')
          }
        ];
      }

      if (type === 'email') {
        return [
          {
            id: 3,
            type: 'email',
            subject: 'Follow-up Email',
            status: 'pending',
            created_at: new Date('2023-01-15T00:00:00Z')
          }
        ];
      }

      return [];
    });

    mockActivityRepository.findByUser.mockImplementation((userId) => {
      if (userId === 1) {
        return [
          {
            id: 1,
            type: 'call',
            subject: 'Sales Call',
            status: 'completed',
            user_id: 1,
            created_at: new Date('2023-01-05T00:00:00Z')
          },
          {
            id: 2,
            type: 'meeting',
            subject: 'Product Demo',
            status: 'completed',
            user_id: 1,
            created_at: new Date('2023-01-10T00:00:00Z')
          }
        ];
      }

      if (userId === 2) {
        return [
          {
            id: 3,
            type: 'email',
            subject: 'Follow-up Email',
            status: 'pending',
            user_id: 2,
            created_at: new Date('2023-01-15T00:00:00Z')
          },
          {
            id: 4,
            type: 'call',
            subject: 'Follow-up Call',
            status: 'pending',
            user_id: 2,
            created_at: new Date('2023-01-20T00:00:00Z')
          }
        ];
      }

      return [];
    });

    mockReportRepository.create.mockImplementation((report) => ({
      id: 1,
      ...report,
      created_at: new Date()
    }));
  });

  describe('getDealsByPeriod', () => {
    test('should get deals by period', async () => {
      // Arrange
      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-31T23:59:59Z');

      // Act
      const result = await reportingService.getDealsByPeriod(startDate, endDate);

      // Assert
      expect(mockDealRepository.findByPeriod).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });

  describe('getDealsByStage', () => {
    test('should get deals by stage', async () => {
      // Arrange
      const stage = 'open';

      // Act
      const result = await reportingService.getDealsByStage(stage);

      // Assert
      expect(mockDealRepository.findByStage).toHaveBeenCalledWith(stage);
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('open');
      expect(result[1].status).toBe('open');
    });

    test('should return empty array when no deals in stage', async () => {
      // Arrange
      const stage = 'nonexistent';

      // Act
      const result = await reportingService.getDealsByStage(stage);

      // Assert
      expect(mockDealRepository.findByStage).toHaveBeenCalledWith(stage);
      expect(result).toEqual([]);
    });
  });

  describe('getDealsByOwner', () => {
    test('should get deals by owner', async () => {
      // Arrange
      const ownerId = 1;

      // Act
      const result = await reportingService.getDealsByOwner(ownerId);

      // Assert
      expect(mockDealRepository.findByOwner).toHaveBeenCalledWith(ownerId);
      expect(result).toHaveLength(2);
      expect(result[0].owner_id).toBe(ownerId);
      expect(result[1].owner_id).toBe(ownerId);
    });

    test('should return empty array when owner has no deals', async () => {
      // Arrange
      const ownerId = 999;

      // Act
      const result = await reportingService.getDealsByOwner(ownerId);

      // Assert
      expect(mockDealRepository.findByOwner).toHaveBeenCalledWith(ownerId);
      expect(result).toEqual([]);
    });
  });

  describe('getActivitiesByPeriod', () => {
    test('should get activities by period', async () => {
      // Arrange
      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-31T23:59:59Z');

      // Act
      const result = await reportingService.getActivitiesByPeriod(startDate, endDate);

      // Assert
      expect(mockActivityRepository.findByPeriod).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toHaveLength(3);
    });
  });

  describe('getActivitiesByType', () => {
    test('should get activities by type', async () => {
      // Arrange
      const type = 'call';

      // Act
      const result = await reportingService.getActivitiesByType(type);

      // Assert
      expect(mockActivityRepository.findByType).toHaveBeenCalledWith(type);
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe(type);
      expect(result[1].type).toBe(type);
    });

    test('should return empty array when no activities of type exist', async () => {
      // Arrange
      const type = 'nonexistent';

      // Act
      const result = await reportingService.getActivitiesByType(type);

      // Assert
      expect(mockActivityRepository.findByType).toHaveBeenCalledWith(type);
      expect(result).toEqual([]);
    });
  });

  describe('getActivitiesByUser', () => {
    test('should get activities by user', async () => {
      // Arrange
      const userId = 1;

      // Act
      const result = await reportingService.getActivitiesByUser(userId);

      // Assert
      expect(mockActivityRepository.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(2);
      expect(result[0].user_id).toBe(userId);
      expect(result[1].user_id).toBe(userId);
    });

    test('should return empty array when user has no activities', async () => {
      // Arrange
      const userId = 999;

      // Act
      const result = await reportingService.getActivitiesByUser(userId);

      // Assert
      expect(mockActivityRepository.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });

  describe('generateReport', () => {
    test('should generate a custom report', async () => {
      // Arrange
      const reportType = 'custom';
      const reportData = {
        title: 'Custom Report',
        description: 'A custom report',
        data: { key: 'value' },
        userId: 1
      };

      // Act
      const result = await reportingService.generateReport(reportType, reportData);

      // Assert
      expect(mockReportRepository.create).toHaveBeenCalledWith({
        type: reportType,
        ...reportData,
        generatedAt: expect.any(Date),
        generatedBy: 1
      });

      expect(result).toEqual({
        id: 1,
        type: reportType,
        ...reportData,
        generatedAt: expect.any(Date),
        generatedBy: 1,
        created_at: expect.any(Date)
      });
    });
  });

  describe('generateSalesReport', () => {
    test('should generate a sales report', async () => {
      // Arrange
      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-31T23:59:59Z');
      const userId = 1;

      // Act
      const result = await reportingService.generateSalesReport(startDate, endDate, userId);

      // Assert
      expect(mockDealRepository.findByPeriod).toHaveBeenCalledWith(startDate, endDate);
      expect(mockReportRepository.create).toHaveBeenCalled();

      expect(result).toEqual({
        id: 1,
        type: 'sales',
        period: { start: startDate, end: endDate },
        totalDeals: 2,
        totalAmount: 3000,
        wonDeals: 1,
        wonAmount: 2000,
        lostDeals: 0,
        lostAmount: 0,
        openDeals: 1,
        openAmount: 1000,
        winRate: 50,
        generatedAt: expect.any(Date),
        generatedBy: userId,
        created_at: expect.any(Date)
      });
    });
  });

  describe('generateActivityReport', () => {
    test('should generate an activity report', async () => {
      // Arrange
      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-31T23:59:59Z');
      const userId = 1;

      // Act
      const result = await reportingService.generateActivityReport(startDate, endDate, userId);

      // Assert
      expect(mockActivityRepository.findByPeriod).toHaveBeenCalledWith(startDate, endDate);
      expect(mockReportRepository.create).toHaveBeenCalled();

      expect(result).toEqual({
        id: 1,
        type: 'activity',
        period: { start: startDate, end: endDate },
        totalActivities: 3,
        completedActivities: 2,
        pendingActivities: 1,
        completionRate: expect.any(Number),
        activityTypes: {
          call: 1,
          meeting: 1,
          email: 1
        },
        generatedAt: expect.any(Date),
        generatedBy: userId,
        created_at: expect.any(Date)
      });

      // Verify completion rate calculation
      expect(result.completionRate).toBe((2 / 3) * 100);
    });
  });
});
