/**
 * Unit tests for deal service
 */

describe('Deal Service', () => {
  // Mock dependencies
  const mockDealRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByCompanyId: jest.fn(),
    findByUserId: jest.fn(),
    findByStatus: jest.fn()
  };
  
  // Mock deal service
  const dealService = {
    getAllDeals: async () => {
      return await mockDealRepository.findAll();
    },
    
    getDealById: async (id) => {
      const deal = await mockDealRepository.findById(id);
      
      if (!deal) {
        throw new Error('Deal not found');
      }
      
      return deal;
    },
    
    createDeal: async (dealData) => {
      return await mockDealRepository.create({
        ...dealData,
        created_at: new Date(),
        updated_at: new Date()
      });
    },
    
    updateDeal: async (id, dealData) => {
      const deal = await mockDealRepository.findById(id);
      
      if (!deal) {
        throw new Error('Deal not found');
      }
      
      return await mockDealRepository.update(id, {
        ...dealData,
        updated_at: new Date()
      });
    },
    
    deleteDeal: async (id) => {
      const deal = await mockDealRepository.findById(id);
      
      if (!deal) {
        throw new Error('Deal not found');
      }
      
      return await mockDealRepository.delete(id);
    },
    
    getDealsByCompany: async (companyId) => {
      return await mockDealRepository.findByCompanyId(companyId);
    },
    
    getDealsByUser: async (userId) => {
      return await mockDealRepository.findByUserId(userId);
    },
    
    getDealsByStatus: async (status) => {
      return await mockDealRepository.findByStatus(status);
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockDealRepository.findAll.mockReset();
    mockDealRepository.findById.mockReset();
    mockDealRepository.create.mockReset();
    mockDealRepository.update.mockReset();
    mockDealRepository.delete.mockReset();
    mockDealRepository.findByCompanyId.mockReset();
    mockDealRepository.findByUserId.mockReset();
    mockDealRepository.findByStatus.mockReset();
    
    // Default mock implementations
    mockDealRepository.findAll.mockResolvedValue([
      {
        id: 1,
        name: 'Deal 1',
        amount: 10000,
        company_id: 1,
        contact_id: 1,
        owner_id: 1,
        status: 'Negotiation',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z')
      },
      {
        id: 2,
        name: 'Deal 2',
        amount: 20000,
        company_id: 2,
        contact_id: 2,
        owner_id: 1,
        status: 'Closed Won',
        created_at: new Date('2023-01-02T00:00:00Z'),
        updated_at: new Date('2023-01-02T00:00:00Z')
      }
    ]);
    
    mockDealRepository.findById.mockImplementation((id) => {
      if (id === 999) {
        return null;
      }
      
      return {
        id,
        name: `Deal ${id}`,
        amount: 10000 * id,
        company_id: 1,
        contact_id: 1,
        owner_id: 1,
        status: 'Negotiation',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z')
      };
    });
    
    mockDealRepository.create.mockImplementation((dealData) => ({
      id: 3,
      ...dealData
    }));
    
    mockDealRepository.update.mockImplementation((id, dealData) => ({
      id,
      ...dealData
    }));
    
    mockDealRepository.delete.mockResolvedValue(true);
    
    mockDealRepository.findByCompanyId.mockImplementation((companyId) => {
      if (companyId === 999) {
        return [];
      }
      
      return [
        {
          id: 1,
          name: 'Deal 1',
          amount: 10000,
          company_id: companyId,
          contact_id: 1,
          owner_id: 1,
          status: 'Negotiation',
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: new Date('2023-01-01T00:00:00Z')
        },
        {
          id: 3,
          name: 'Deal 3',
          amount: 30000,
          company_id: companyId,
          contact_id: 3,
          owner_id: 2,
          status: 'Proposal',
          created_at: new Date('2023-01-03T00:00:00Z'),
          updated_at: new Date('2023-01-03T00:00:00Z')
        }
      ];
    });
    
    mockDealRepository.findByUserId.mockImplementation((userId) => {
      if (userId === 999) {
        return [];
      }
      
      return [
        {
          id: 1,
          name: 'Deal 1',
          amount: 10000,
          company_id: 1,
          contact_id: 1,
          owner_id: userId,
          status: 'Negotiation',
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: new Date('2023-01-01T00:00:00Z')
        },
        {
          id: 2,
          name: 'Deal 2',
          amount: 20000,
          company_id: 2,
          contact_id: 2,
          owner_id: userId,
          status: 'Closed Won',
          created_at: new Date('2023-01-02T00:00:00Z'),
          updated_at: new Date('2023-01-02T00:00:00Z')
        }
      ];
    });
    
    mockDealRepository.findByStatus.mockImplementation((status) => {
      if (status === 'Nonexistent Status') {
        return [];
      }
      
      if (status === 'Negotiation') {
        return [
          {
            id: 1,
            name: 'Deal 1',
            amount: 10000,
            company_id: 1,
            contact_id: 1,
            owner_id: 1,
            status,
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: new Date('2023-01-01T00:00:00Z')
          }
        ];
      }
      
      if (status === 'Closed Won') {
        return [
          {
            id: 2,
            name: 'Deal 2',
            amount: 20000,
            company_id: 2,
            contact_id: 2,
            owner_id: 1,
            status,
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: new Date('2023-01-02T00:00:00Z')
          }
        ];
      }
      
      return [];
    });
  });

  describe('getAllDeals', () => {
    test('should return all deals', async () => {
      // Act
      const result = await dealService.getAllDeals();
      
      // Assert
      expect(mockDealRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });
  
  describe('getDealById', () => {
    test('should return deal by ID', async () => {
      // Arrange
      const dealId = 1;
      
      // Act
      const result = await dealService.getDealById(dealId);
      
      // Assert
      expect(mockDealRepository.findById).toHaveBeenCalledWith(dealId);
      expect(result).toEqual({
        id: dealId,
        name: `Deal ${dealId}`,
        amount: 10000 * dealId,
        company_id: 1,
        contact_id: 1,
        owner_id: 1,
        status: 'Negotiation',
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
    
    test('should throw error when deal is not found', async () => {
      // Arrange
      const dealId = 999;
      
      // Act & Assert
      await expect(dealService.getDealById(dealId)).rejects.toThrow('Deal not found');
      expect(mockDealRepository.findById).toHaveBeenCalledWith(dealId);
    });
  });
  
  describe('createDeal', () => {
    test('should create a new deal', async () => {
      // Arrange
      const dealData = {
        name: 'New Deal',
        amount: 50000,
        company_id: 3,
        contact_id: 3,
        owner_id: 2,
        status: 'Qualification'
      };
      
      // Act
      const result = await dealService.createDeal(dealData);
      
      // Assert
      expect(mockDealRepository.create).toHaveBeenCalledWith({
        ...dealData,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: 3,
        ...dealData,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
  });
});
