/**
 * Unit tests for deal service - update and delete operations
 */

describe('Deal Service - Update and Delete', () => {
  // Mock dependencies
  const mockDealRepository = {
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByCompanyId: jest.fn(),
    findByUserId: jest.fn(),
    findByStatus: jest.fn()
  };
  
  // Mock deal service
  const dealService = {
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
    mockDealRepository.findById.mockReset();
    mockDealRepository.update.mockReset();
    mockDealRepository.delete.mockReset();
    mockDealRepository.findByCompanyId.mockReset();
    mockDealRepository.findByUserId.mockReset();
    mockDealRepository.findByStatus.mockReset();
    
    // Default mock implementations
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

  describe('updateDeal', () => {
    test('should update a deal successfully', async () => {
      // Arrange
      const dealId = 1;
      const dealData = {
        name: 'Updated Deal',
        amount: 15000,
        status: 'Proposal'
      };
      
      // Act
      const result = await dealService.updateDeal(dealId, dealData);
      
      // Assert
      expect(mockDealRepository.findById).toHaveBeenCalledWith(dealId);
      expect(mockDealRepository.update).toHaveBeenCalledWith(dealId, {
        ...dealData,
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: dealId,
        ...dealData,
        updated_at: expect.any(Date)
      });
    });
    
    test('should throw error when deal is not found', async () => {
      // Arrange
      const dealId = 999;
      const dealData = {
        name: 'Updated Deal',
        amount: 15000
      };
      
      // Act & Assert
      await expect(dealService.updateDeal(dealId, dealData)).rejects.toThrow('Deal not found');
      expect(mockDealRepository.findById).toHaveBeenCalledWith(dealId);
      expect(mockDealRepository.update).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteDeal', () => {
    test('should delete a deal successfully', async () => {
      // Arrange
      const dealId = 1;
      
      // Act
      const result = await dealService.deleteDeal(dealId);
      
      // Assert
      expect(mockDealRepository.findById).toHaveBeenCalledWith(dealId);
      expect(mockDealRepository.delete).toHaveBeenCalledWith(dealId);
      expect(result).toBe(true);
    });
    
    test('should throw error when deal is not found', async () => {
      // Arrange
      const dealId = 999;
      
      // Act & Assert
      await expect(dealService.deleteDeal(dealId)).rejects.toThrow('Deal not found');
      expect(mockDealRepository.findById).toHaveBeenCalledWith(dealId);
      expect(mockDealRepository.delete).not.toHaveBeenCalled();
    });
  });
  
  describe('getDealsByCompany', () => {
    test('should return deals for a company', async () => {
      // Arrange
      const companyId = 1;
      
      // Act
      const result = await dealService.getDealsByCompany(companyId);
      
      // Assert
      expect(mockDealRepository.findByCompanyId).toHaveBeenCalledWith(companyId);
      expect(result).toHaveLength(2);
      expect(result[0].company_id).toBe(companyId);
      expect(result[1].company_id).toBe(companyId);
    });
    
    test('should return empty array when company has no deals', async () => {
      // Arrange
      const companyId = 999;
      
      // Act
      const result = await dealService.getDealsByCompany(companyId);
      
      // Assert
      expect(mockDealRepository.findByCompanyId).toHaveBeenCalledWith(companyId);
      expect(result).toEqual([]);
    });
  });
  
  describe('getDealsByUser', () => {
    test('should return deals for a user', async () => {
      // Arrange
      const userId = 1;
      
      // Act
      const result = await dealService.getDealsByUser(userId);
      
      // Assert
      expect(mockDealRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(2);
      expect(result[0].owner_id).toBe(userId);
      expect(result[1].owner_id).toBe(userId);
    });
    
    test('should return empty array when user has no deals', async () => {
      // Arrange
      const userId = 999;
      
      // Act
      const result = await dealService.getDealsByUser(userId);
      
      // Assert
      expect(mockDealRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });
  
  describe('getDealsByStatus', () => {
    test('should return deals with Negotiation status', async () => {
      // Arrange
      const status = 'Negotiation';
      
      // Act
      const result = await dealService.getDealsByStatus(status);
      
      // Assert
      expect(mockDealRepository.findByStatus).toHaveBeenCalledWith(status);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(status);
    });
    
    test('should return deals with Closed Won status', async () => {
      // Arrange
      const status = 'Closed Won';
      
      // Act
      const result = await dealService.getDealsByStatus(status);
      
      // Assert
      expect(mockDealRepository.findByStatus).toHaveBeenCalledWith(status);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(status);
    });
    
    test('should return empty array when no deals with status exist', async () => {
      // Arrange
      const status = 'Nonexistent Status';
      
      // Act
      const result = await dealService.getDealsByStatus(status);
      
      // Assert
      expect(mockDealRepository.findByStatus).toHaveBeenCalledWith(status);
      expect(result).toEqual([]);
    });
  });
});
