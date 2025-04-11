/**
 * Unit tests for company service
 */

describe('Company Service', () => {
  // Mock dependencies
  const mockCompanyRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };
  
  const mockContactRepository = {
    findByCompany: jest.fn()
  };
  
  const mockDealRepository = {
    findByCompany: jest.fn()
  };
  
  const mockActivityRepository = {
    findByEntity: jest.fn()
  };
  
  // Mock company service
  const companyService = {
    getAllCompanies: async () => {
      return await mockCompanyRepository.findAll();
    },
    
    getCompanyById: async (id) => {
      const company = await mockCompanyRepository.findById(id);
      
      if (!company) {
        throw new Error('Company not found');
      }
      
      return company;
    },
    
    createCompany: async (companyData) => {
      const { name, industry } = companyData;
      
      if (!name) {
        throw new Error('Company name is required');
      }
      
      return await mockCompanyRepository.create({
        ...companyData,
        created_at: new Date()
      });
    },
    
    updateCompany: async (id, companyData) => {
      const company = await mockCompanyRepository.findById(id);
      
      if (!company) {
        throw new Error('Company not found');
      }
      
      return await mockCompanyRepository.update(id, {
        ...companyData,
        updated_at: new Date()
      });
    },
    
    deleteCompany: async (id) => {
      const company = await mockCompanyRepository.findById(id);
      
      if (!company) {
        throw new Error('Company not found');
      }
      
      // Check if company has contacts
      const contacts = await mockContactRepository.findByCompany(id);
      if (contacts && contacts.length > 0) {
        throw new Error('Cannot delete company with associated contacts');
      }
      
      // Check if company has deals
      const deals = await mockDealRepository.findByCompany(id);
      if (deals && deals.length > 0) {
        throw new Error('Cannot delete company with associated deals');
      }
      
      return await mockCompanyRepository.delete(id);
    },
    
    getCompanyWithRelations: async (id) => {
      const company = await mockCompanyRepository.findById(id);
      
      if (!company) {
        throw new Error('Company not found');
      }
      
      // Get related data in parallel
      const [contacts, deals, activities] = await Promise.all([
        mockContactRepository.findByCompany(id),
        mockDealRepository.findByCompany(id),
        mockActivityRepository.findByEntity('company', id)
      ]);
      
      return {
        ...company,
        contacts,
        deals,
        activities
      };
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockCompanyRepository.findAll.mockResolvedValue([
      {
        id: 1,
        name: 'Acme Inc.',
        industry: 'Technology',
        website: 'https://acme.example.com',
        created_at: new Date('2023-01-01'),
        updated_at: null
      },
      {
        id: 2,
        name: 'Beta Corp',
        industry: 'Manufacturing',
        website: 'https://beta.example.com',
        created_at: new Date('2023-01-05'),
        updated_at: null
      }
    ]);
    
    mockCompanyRepository.findById.mockImplementation((id) => {
      if (id === 1) {
        return {
          id,
          name: 'Acme Inc.',
          industry: 'Technology',
          website: 'https://acme.example.com',
          created_at: new Date('2023-01-01'),
          updated_at: null
        };
      }
      
      if (id === 2) {
        return {
          id,
          name: 'Beta Corp',
          industry: 'Manufacturing',
          website: 'https://beta.example.com',
          created_at: new Date('2023-01-05'),
          updated_at: null
        };
      }
      
      return null;
    });
    
    mockCompanyRepository.create.mockImplementation((companyData) => ({
      id: 3,
      ...companyData
    }));
    
    mockCompanyRepository.update.mockImplementation((id, companyData) => ({
      id,
      ...(id === 1 ? {
        name: 'Acme Inc.',
        industry: 'Technology',
        website: 'https://acme.example.com',
        created_at: new Date('2023-01-01')
      } : {
        name: 'Beta Corp',
        industry: 'Manufacturing',
        website: 'https://beta.example.com',
        created_at: new Date('2023-01-05')
      }),
      ...companyData,
      updated_at: expect.any(Date)
    }));
    
    mockCompanyRepository.delete.mockResolvedValue(true);
    
    mockContactRepository.findByCompany.mockImplementation((companyId) => {
      if (companyId === 1) {
        return [
          {
            id: 1,
            first_name: 'John',
            last_name: 'Smith',
            email: 'john.smith@acme.example.com',
            company_id: companyId
          },
          {
            id: 2,
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'jane.doe@acme.example.com',
            company_id: companyId
          }
        ];
      }
      
      if (companyId === 2) {
        return [];
      }
      
      return [];
    });
    
    mockDealRepository.findByCompany.mockImplementation((companyId) => {
      if (companyId === 1) {
        return [
          {
            id: 1,
            title: 'Website Development',
            stage: 'proposal',
            value: 10000,
            company_id: companyId
          }
        ];
      }
      
      if (companyId === 2) {
        return [];
      }
      
      return [];
    });
    
    mockActivityRepository.findByEntity.mockImplementation((entityType, entityId) => {
      if (entityType === 'company' && entityId === 1) {
        return [
          {
            id: 1,
            type: 'call',
            title: 'Initial consultation',
            entity_type: entityType,
            entity_id: entityId
          },
          {
            id: 2,
            type: 'meeting',
            title: 'Project kickoff',
            entity_type: entityType,
            entity_id: entityId
          }
        ];
      }
      
      return [];
    });
  });

  describe('getAllCompanies', () => {
    test('should return all companies', async () => {
      // Act
      const result = await companyService.getAllCompanies();
      
      // Assert
      expect(mockCompanyRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });
  
  describe('getCompanyById', () => {
    test('should return company by ID', async () => {
      // Arrange
      const companyId = 1;
      
      // Act
      const result = await companyService.getCompanyById(companyId);
      
      // Assert
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(result).toEqual({
        id: companyId,
        name: 'Acme Inc.',
        industry: 'Technology',
        website: 'https://acme.example.com',
        created_at: expect.any(Date),
        updated_at: null
      });
    });
    
    test('should throw error when company is not found', async () => {
      // Arrange
      const companyId = 999;
      
      // Act & Assert
      await expect(companyService.getCompanyById(companyId))
        .rejects.toThrow('Company not found');
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
    });
  });
  
  describe('createCompany', () => {
    test('should create a new company', async () => {
      // Arrange
      const companyData = {
        name: 'Gamma LLC',
        industry: 'Consulting',
        website: 'https://gamma.example.com'
      };
      
      // Act
      const result = await companyService.createCompany(companyData);
      
      // Assert
      expect(mockCompanyRepository.create).toHaveBeenCalledWith({
        ...companyData,
        created_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: 3,
        ...companyData,
        created_at: expect.any(Date)
      });
    });
    
    test('should throw error when name is missing', async () => {
      // Arrange
      const incompleteData = {
        industry: 'Consulting',
        website: 'https://gamma.example.com'
      };
      
      // Act & Assert
      await expect(companyService.createCompany(incompleteData))
        .rejects.toThrow('Company name is required');
      expect(mockCompanyRepository.create).not.toHaveBeenCalled();
    });
  });
  
  describe('updateCompany', () => {
    test('should update an existing company', async () => {
      // Arrange
      const companyId = 1;
      const updateData = {
        name: 'Acme Corporation',
        industry: 'Software'
      };
      
      // Act
      const result = await companyService.updateCompany(companyId, updateData);
      
      // Assert
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(mockCompanyRepository.update).toHaveBeenCalledWith(companyId, {
        ...updateData,
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: companyId,
        name: 'Acme Corporation',
        industry: 'Software',
        website: 'https://acme.example.com',
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
    
    test('should throw error when company is not found', async () => {
      // Arrange
      const companyId = 999;
      const updateData = {
        name: 'Updated Company'
      };
      
      // Act & Assert
      await expect(companyService.updateCompany(companyId, updateData))
        .rejects.toThrow('Company not found');
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(mockCompanyRepository.update).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteCompany', () => {
    test('should delete a company without relations', async () => {
      // Arrange
      const companyId = 2; // Company without contacts or deals
      
      // Act
      const result = await companyService.deleteCompany(companyId);
      
      // Assert
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(mockContactRepository.findByCompany).toHaveBeenCalledWith(companyId);
      expect(mockDealRepository.findByCompany).toHaveBeenCalledWith(companyId);
      expect(mockCompanyRepository.delete).toHaveBeenCalledWith(companyId);
      expect(result).toBe(true);
    });
    
    test('should throw error when company is not found', async () => {
      // Arrange
      const companyId = 999;
      
      // Act & Assert
      await expect(companyService.deleteCompany(companyId))
        .rejects.toThrow('Company not found');
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(mockContactRepository.findByCompany).not.toHaveBeenCalled();
      expect(mockDealRepository.findByCompany).not.toHaveBeenCalled();
      expect(mockCompanyRepository.delete).not.toHaveBeenCalled();
    });
    
    test('should throw error when company has contacts', async () => {
      // Arrange
      const companyId = 1; // Company with contacts
      
      // Act & Assert
      await expect(companyService.deleteCompany(companyId))
        .rejects.toThrow('Cannot delete company with associated contacts');
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(mockContactRepository.findByCompany).toHaveBeenCalledWith(companyId);
      expect(mockCompanyRepository.delete).not.toHaveBeenCalled();
    });
  });
  
  describe('getCompanyWithRelations', () => {
    test('should return company with all relations', async () => {
      // Arrange
      const companyId = 1;
      
      // Act
      const result = await companyService.getCompanyWithRelations(companyId);
      
      // Assert
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(mockContactRepository.findByCompany).toHaveBeenCalledWith(companyId);
      expect(mockDealRepository.findByCompany).toHaveBeenCalledWith(companyId);
      expect(mockActivityRepository.findByEntity).toHaveBeenCalledWith('company', companyId);
      
      expect(result).toEqual({
        id: companyId,
        name: 'Acme Inc.',
        industry: 'Technology',
        website: 'https://acme.example.com',
        created_at: expect.any(Date),
        updated_at: null,
        contacts: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            first_name: 'John',
            last_name: 'Smith'
          }),
          expect.objectContaining({
            id: 2,
            first_name: 'Jane',
            last_name: 'Doe'
          })
        ]),
        deals: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            title: 'Website Development'
          })
        ]),
        activities: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            type: 'call',
            title: 'Initial consultation'
          }),
          expect.objectContaining({
            id: 2,
            type: 'meeting',
            title: 'Project kickoff'
          })
        ])
      });
    });
    
    test('should throw error when company is not found', async () => {
      // Arrange
      const companyId = 999;
      
      // Act & Assert
      await expect(companyService.getCompanyWithRelations(companyId))
        .rejects.toThrow('Company not found');
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(mockContactRepository.findByCompany).not.toHaveBeenCalled();
      expect(mockDealRepository.findByCompany).not.toHaveBeenCalled();
      expect(mockActivityRepository.findByEntity).not.toHaveBeenCalled();
    });
  });
});
