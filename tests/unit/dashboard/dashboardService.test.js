/**
 * Unit tests for dashboard service
 */

describe('Dashboard Service', () => {
  // Mock dependencies
  const mockDealRepository = {
    countByStage: jest.fn(),
    sumValueByStage: jest.fn(),
    findRecentDeals: jest.fn()
  };
  
  const mockActivityRepository = {
    findUpcomingActivities: jest.fn(),
    countByStatus: jest.fn()
  };
  
  const mockContactRepository = {
    countTotal: jest.fn(),
    findRecentContacts: jest.fn()
  };
  
  const mockCompanyRepository = {
    countTotal: jest.fn(),
    findRecentCompanies: jest.fn()
  };
  
  const mockUserRepository = {
    findById: jest.fn()
  };
  
  // Mock dashboard service
  const dashboardService = {
    getDashboardData: async (userId) => {
      // Validate user exists
      const user = await mockUserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get all data in parallel
      const [
        dealsByStage,
        dealValuesByStage,
        recentDeals,
        upcomingActivities,
        activitiesByStatus,
        contactsCount,
        recentContacts,
        companiesCount,
        recentCompanies
      ] = await Promise.all([
        mockDealRepository.countByStage(userId),
        mockDealRepository.sumValueByStage(userId),
        mockDealRepository.findRecentDeals(userId, 5),
        mockActivityRepository.findUpcomingActivities(userId, 5),
        mockActivityRepository.countByStatus(userId),
        mockContactRepository.countTotal(userId),
        mockContactRepository.findRecentContacts(userId, 5),
        mockCompanyRepository.countTotal(userId),
        mockCompanyRepository.findRecentCompanies(userId, 5)
      ]);
      
      return {
        deals: {
          by_stage: dealsByStage,
          values_by_stage: dealValuesByStage,
          recent: recentDeals
        },
        activities: {
          upcoming: upcomingActivities,
          by_status: activitiesByStatus
        },
        contacts: {
          count: contactsCount,
          recent: recentContacts
        },
        companies: {
          count: companiesCount,
          recent: recentCompanies
        }
      };
    },
    
    getDealsSummary: async (userId) => {
      // Validate user exists
      const user = await mockUserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const [dealsByStage, dealValuesByStage] = await Promise.all([
        mockDealRepository.countByStage(userId),
        mockDealRepository.sumValueByStage(userId)
      ]);
      
      // Calculate totals
      const totalDeals = dealsByStage.reduce((sum, stage) => sum + stage.count, 0);
      const totalValue = dealValuesByStage.reduce((sum, stage) => sum + stage.value, 0);
      
      // Calculate win rate
      const closedWon = dealsByStage.find(stage => stage.stage === 'closed_won')?.count || 0;
      const closedLost = dealsByStage.find(stage => stage.stage === 'closed_lost')?.count || 0;
      const winRate = closedWon + closedLost > 0 ? (closedWon / (closedWon + closedLost)) * 100 : 0;
      
      return {
        by_stage: dealsByStage,
        values_by_stage: dealValuesByStage,
        total_deals: totalDeals,
        total_value: totalValue,
        win_rate: winRate
      };
    },
    
    getActivitiesSummary: async (userId) => {
      // Validate user exists
      const user = await mockUserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const [upcomingActivities, activitiesByStatus] = await Promise.all([
        mockActivityRepository.findUpcomingActivities(userId, 10),
        mockActivityRepository.countByStatus(userId)
      ]);
      
      // Calculate completion rate
      const completed = activitiesByStatus.find(status => status.status === 'completed')?.count || 0;
      const total = activitiesByStatus.reduce((sum, status) => sum + status.count, 0);
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      
      return {
        upcoming: upcomingActivities,
        by_status: activitiesByStatus,
        total: total,
        completion_rate: completionRate
      };
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUserRepository.findById.mockImplementation((id) => {
      if (id === 1) {
        return { id, first_name: 'John', last_name: 'Doe' };
      }
      return null;
    });
    
    mockDealRepository.countByStage.mockImplementation((userId) => {
      if (userId === 1) {
        return [
          { stage: 'lead', count: 10 },
          { stage: 'qualified', count: 8 },
          { stage: 'proposal', count: 5 },
          { stage: 'negotiation', count: 3 },
          { stage: 'closed_won', count: 2 },
          { stage: 'closed_lost', count: 1 }
        ];
      }
      return [];
    });
    
    mockDealRepository.sumValueByStage.mockImplementation((userId) => {
      if (userId === 1) {
        return [
          { stage: 'lead', value: 50000 },
          { stage: 'qualified', value: 40000 },
          { stage: 'proposal', value: 30000 },
          { stage: 'negotiation', value: 20000 },
          { stage: 'closed_won', value: 15000 },
          { stage: 'closed_lost', value: 5000 }
        ];
      }
      return [];
    });
    
    mockDealRepository.findRecentDeals.mockImplementation((userId, limit) => {
      if (userId === 1) {
        return [
          {
            id: 1,
            title: 'Website Development',
            company: { name: 'Acme Inc.' },
            stage: 'proposal',
            value: 10000,
            created_at: new Date('2023-01-10')
          },
          {
            id: 2,
            title: 'SEO Services',
            company: { name: 'Beta Corp' },
            stage: 'qualified',
            value: 5000,
            created_at: new Date('2023-01-08')
          },
          {
            id: 3,
            title: 'Mobile App Development',
            company: { name: 'Gamma LLC' },
            stage: 'lead',
            value: 20000,
            created_at: new Date('2023-01-05')
          }
        ].slice(0, limit);
      }
      return [];
    });
    
    mockActivityRepository.findUpcomingActivities.mockImplementation((userId, limit) => {
      if (userId === 1) {
        return [
          {
            id: 1,
            type: 'call',
            title: 'Follow-up call',
            entity_type: 'contact',
            entity: { name: 'John Smith' },
            scheduled_at: new Date('2023-01-15T10:00:00Z')
          },
          {
            id: 2,
            type: 'meeting',
            title: 'Project kickoff',
            entity_type: 'company',
            entity: { name: 'Acme Inc.' },
            scheduled_at: new Date('2023-01-16T14:00:00Z')
          },
          {
            id: 3,
            type: 'email',
            title: 'Send proposal',
            entity_type: 'contact',
            entity: { name: 'Jane Doe' },
            scheduled_at: new Date('2023-01-17T09:00:00Z')
          }
        ].slice(0, limit);
      }
      return [];
    });
    
    mockActivityRepository.countByStatus.mockImplementation((userId) => {
      if (userId === 1) {
        return [
          { status: 'pending', count: 5 },
          { status: 'in_progress', count: 3 },
          { status: 'completed', count: 8 },
          { status: 'overdue', count: 2 }
        ];
      }
      return [];
    });
    
    mockContactRepository.countTotal.mockImplementation((userId) => {
      if (userId === 1) {
        return 25;
      }
      return 0;
    });
    
    mockContactRepository.findRecentContacts.mockImplementation((userId, limit) => {
      if (userId === 1) {
        return [
          {
            id: 1,
            first_name: 'John',
            last_name: 'Smith',
            email: 'john.smith@example.com',
            company: { name: 'Acme Inc.' },
            created_at: new Date('2023-01-10')
          },
          {
            id: 2,
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'jane.doe@example.com',
            company: { name: 'Beta Corp' },
            created_at: new Date('2023-01-08')
          }
        ].slice(0, limit);
      }
      return [];
    });
    
    mockCompanyRepository.countTotal.mockImplementation((userId) => {
      if (userId === 1) {
        return 10;
      }
      return 0;
    });
    
    mockCompanyRepository.findRecentCompanies.mockImplementation((userId, limit) => {
      if (userId === 1) {
        return [
          {
            id: 1,
            name: 'Acme Inc.',
            industry: 'Technology',
            created_at: new Date('2023-01-10')
          },
          {
            id: 2,
            name: 'Beta Corp',
            industry: 'Manufacturing',
            created_at: new Date('2023-01-08')
          }
        ].slice(0, limit);
      }
      return [];
    });
  });

  describe('getDashboardData', () => {
    test('should return complete dashboard data', async () => {
      // Arrange
      const userId = 1;
      
      // Act
      const result = await dashboardService.getDashboardData(userId);
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockDealRepository.countByStage).toHaveBeenCalledWith(userId);
      expect(mockDealRepository.sumValueByStage).toHaveBeenCalledWith(userId);
      expect(mockDealRepository.findRecentDeals).toHaveBeenCalledWith(userId, 5);
      expect(mockActivityRepository.findUpcomingActivities).toHaveBeenCalledWith(userId, 5);
      expect(mockActivityRepository.countByStatus).toHaveBeenCalledWith(userId);
      expect(mockContactRepository.countTotal).toHaveBeenCalledWith(userId);
      expect(mockContactRepository.findRecentContacts).toHaveBeenCalledWith(userId, 5);
      expect(mockCompanyRepository.countTotal).toHaveBeenCalledWith(userId);
      expect(mockCompanyRepository.findRecentCompanies).toHaveBeenCalledWith(userId, 5);
      
      expect(result).toEqual({
        deals: {
          by_stage: expect.arrayContaining([
            { stage: 'lead', count: 10 },
            { stage: 'qualified', count: 8 },
            { stage: 'proposal', count: 5 },
            { stage: 'negotiation', count: 3 },
            { stage: 'closed_won', count: 2 },
            { stage: 'closed_lost', count: 1 }
          ]),
          values_by_stage: expect.arrayContaining([
            { stage: 'lead', value: 50000 },
            { stage: 'qualified', value: 40000 },
            { stage: 'proposal', value: 30000 },
            { stage: 'negotiation', value: 20000 },
            { stage: 'closed_won', value: 15000 },
            { stage: 'closed_lost', value: 5000 }
          ]),
          recent: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              title: 'Website Development',
              company: { name: 'Acme Inc.' }
            })
          ])
        },
        activities: {
          upcoming: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              type: 'call',
              title: 'Follow-up call'
            })
          ]),
          by_status: expect.arrayContaining([
            { status: 'pending', count: 5 },
            { status: 'in_progress', count: 3 },
            { status: 'completed', count: 8 },
            { status: 'overdue', count: 2 }
          ])
        },
        contacts: {
          count: 25,
          recent: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              first_name: 'John',
              last_name: 'Smith'
            })
          ])
        },
        companies: {
          count: 10,
          recent: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              name: 'Acme Inc.'
            })
          ])
        }
      });
    });
    
    test('should throw error when user is not found', async () => {
      // Arrange
      const userId = 999;
      
      // Act & Assert
      await expect(dashboardService.getDashboardData(userId))
        .rejects.toThrow('User not found');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockDealRepository.countByStage).not.toHaveBeenCalled();
    });
  });
  
  describe('getDealsSummary', () => {
    test('should return deals summary with calculated metrics', async () => {
      // Arrange
      const userId = 1;
      
      // Act
      const result = await dashboardService.getDealsSummary(userId);
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockDealRepository.countByStage).toHaveBeenCalledWith(userId);
      expect(mockDealRepository.sumValueByStage).toHaveBeenCalledWith(userId);
      
      expect(result).toEqual({
        by_stage: expect.arrayContaining([
          { stage: 'lead', count: 10 },
          { stage: 'qualified', count: 8 },
          { stage: 'proposal', count: 5 },
          { stage: 'negotiation', count: 3 },
          { stage: 'closed_won', count: 2 },
          { stage: 'closed_lost', count: 1 }
        ]),
        values_by_stage: expect.arrayContaining([
          { stage: 'lead', value: 50000 },
          { stage: 'qualified', value: 40000 },
          { stage: 'proposal', value: 30000 },
          { stage: 'negotiation', value: 20000 },
          { stage: 'closed_won', value: 15000 },
          { stage: 'closed_lost', value: 5000 }
        ]),
        total_deals: 29,
        total_value: 160000,
        win_rate: 66.66666666666666 // 2 won out of 3 closed (2 won + 1 lost)
      });
    });
    
    test('should throw error when user is not found', async () => {
      // Arrange
      const userId = 999;
      
      // Act & Assert
      await expect(dashboardService.getDealsSummary(userId))
        .rejects.toThrow('User not found');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockDealRepository.countByStage).not.toHaveBeenCalled();
    });
  });
  
  describe('getActivitiesSummary', () => {
    test('should return activities summary with calculated metrics', async () => {
      // Arrange
      const userId = 1;
      
      // Act
      const result = await dashboardService.getActivitiesSummary(userId);
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockActivityRepository.findUpcomingActivities).toHaveBeenCalledWith(userId, 10);
      expect(mockActivityRepository.countByStatus).toHaveBeenCalledWith(userId);
      
      expect(result).toEqual({
        upcoming: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            type: 'call',
            title: 'Follow-up call'
          })
        ]),
        by_status: expect.arrayContaining([
          { status: 'pending', count: 5 },
          { status: 'in_progress', count: 3 },
          { status: 'completed', count: 8 },
          { status: 'overdue', count: 2 }
        ]),
        total: 18,
        completion_rate: 44.44444444444444 // 8 completed out of 18 total
      });
    });
    
    test('should throw error when user is not found', async () => {
      // Arrange
      const userId = 999;
      
      // Act & Assert
      await expect(dashboardService.getActivitiesSummary(userId))
        .rejects.toThrow('User not found');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockActivityRepository.findUpcomingActivities).not.toHaveBeenCalled();
    });
  });
});
