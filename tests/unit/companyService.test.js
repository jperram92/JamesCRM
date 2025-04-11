/**
 * Unit tests for company service
 */

describe('Company Service', () => {
  // Mock dependencies
  const mockCompanyRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByIndustry: jest.fn()
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

    getCompanyByName: async (name) => {
      const company = await mockCompanyRepository.findByName(name);

      if (!company) {
        throw new Error('Company not found');
      }

      return company;
    },

    createCompany: async (companyData) => {
      const existingCompany = await mockCompanyRepository.findByName(companyData.name);

      if (existingCompany) {
        throw new Error('Company name already exists');
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

      if (companyData.name && companyData.name !== company.name) {
        const existingCompany = await mockCompanyRepository.findByName(companyData.name);

        if (existingCompany && existingCompany.id !== id) {
          throw new Error('Company name already exists');
        }
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

      return await mockCompanyRepository.delete(id);
    },

    getCompaniesByIndustry: async (industry) => {
      return await mockCompanyRepository.findByIndustry(industry);
    },

    searchCompanies: async (query) => {
      const companies = await mockCompanyRepository.findAll();

      if (!query) {
        return companies;
      }

      const lowerQuery = query.toLowerCase();

      return companies.filter(company =>
        company.name.toLowerCase().includes(lowerQuery) ||
        (company.industry && company.industry.toLowerCase().includes(lowerQuery)) ||
        (company.website && company.website.toLowerCase().includes(lowerQuery)) ||
        (company.description && company.description.toLowerCase().includes(lowerQuery))
      );
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockCompanyRepository.findAll.mockReset();
    mockCompanyRepository.findById.mockReset();
    mockCompanyRepository.findByName.mockReset();
    mockCompanyRepository.create.mockReset();
    mockCompanyRepository.update.mockReset();
    mockCompanyRepository.delete.mockReset();
    mockCompanyRepository.findByIndustry.mockReset();

    // Default mock implementations
    mockCompanyRepository.findAll.mockResolvedValue([]);
    mockCompanyRepository.findById.mockResolvedValue(null);
    mockCompanyRepository.findByName.mockResolvedValue(null);
    mockCompanyRepository.create.mockImplementation(companyData => ({ id: 1, ...companyData }));
    mockCompanyRepository.update.mockImplementation((id, companyData) => ({ id, ...companyData }));
    mockCompanyRepository.delete.mockResolvedValue(true);
    mockCompanyRepository.findByIndustry.mockResolvedValue([]);
  });

  describe('getAllCompanies', () => {
    test('should return all companies', async () => {
      // Arrange
      const mockCompanies = [
        { id: 1, name: 'Company 1', industry: 'Technology' },
        { id: 2, name: 'Company 2', industry: 'Healthcare' }
      ];
      mockCompanyRepository.findAll.mockResolvedValue(mockCompanies);

      // Act
      const result = await companyService.getAllCompanies();

      // Assert
      expect(mockCompanyRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCompanies);
      expect(result.length).toBe(2);
    });

    test('should return empty array when no companies exist', async () => {
      // Arrange
      mockCompanyRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await companyService.getAllCompanies();

      // Assert
      expect(mockCompanyRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('getCompanyById', () => {
    test('should return company by ID', async () => {
      // Arrange
      const companyId = 1;
      const mockCompany = { id: companyId, name: 'Test Company', industry: 'Technology' };
      mockCompanyRepository.findById.mockResolvedValue(mockCompany);

      // Act
      const result = await companyService.getCompanyById(companyId);

      // Assert
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(result).toEqual(mockCompany);
    });

    test('should throw error when company is not found', async () => {
      // Arrange
      const companyId = 999;
      mockCompanyRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(companyService.getCompanyById(companyId)).rejects.toThrow('Company not found');
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
    });
  });

  describe('getCompanyByName', () => {
    test('should return company by name', async () => {
      // Arrange
      const companyName = 'Test Company';
      const mockCompany = { id: 1, name: companyName, industry: 'Technology' };
      mockCompanyRepository.findByName.mockResolvedValue(mockCompany);

      // Act
      const result = await companyService.getCompanyByName(companyName);

      // Assert
      expect(mockCompanyRepository.findByName).toHaveBeenCalledWith(companyName);
      expect(result).toEqual(mockCompany);
    });

    test('should throw error when company is not found', async () => {
      // Arrange
      const companyName = 'Nonexistent Company';
      mockCompanyRepository.findByName.mockResolvedValue(null);

      // Act & Assert
      await expect(companyService.getCompanyByName(companyName)).rejects.toThrow('Company not found');
      expect(mockCompanyRepository.findByName).toHaveBeenCalledWith(companyName);
    });
  });

  describe('createCompany', () => {
    test('should create a new company', async () => {
      // Arrange
      const companyData = {
        name: 'New Company',
        industry: 'Technology',
        website: 'https://newcompany.example.com',
        description: 'A new technology company'
      };
      mockCompanyRepository.findByName.mockResolvedValue(null);
      mockCompanyRepository.create.mockResolvedValue({
        id: 1,
        ...companyData,
        created_at: expect.any(Date)
      });

      // Act
      const result = await companyService.createCompany(companyData);

      // Assert
      expect(mockCompanyRepository.findByName).toHaveBeenCalledWith(companyData.name);
      expect(mockCompanyRepository.create).toHaveBeenCalledWith({
        ...companyData,
        created_at: expect.any(Date)
      });
      expect(result).toEqual({
        id: 1,
        ...companyData,
        created_at: expect.any(Date)
      });
    });

    test('should throw error when company name already exists', async () => {
      // Arrange
      const companyData = {
        name: 'Existing Company',
        industry: 'Technology'
      };
      const existingCompany = { id: 1, name: companyData.name, industry: 'Technology' };
      mockCompanyRepository.findByName.mockResolvedValue(existingCompany);

      // Act & Assert
      await expect(companyService.createCompany(companyData)).rejects.toThrow('Company name already exists');
      expect(mockCompanyRepository.findByName).toHaveBeenCalledWith(companyData.name);
      expect(mockCompanyRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateCompany', () => {
    test('should update an existing company', async () => {
      // Arrange
      const companyId = 1;
      const companyData = {
        industry: 'Updated Industry',
        website: 'https://updated.example.com',
        description: 'Updated description'
      };
      const existingCompany = {
        id: companyId,
        name: 'Test Company',
        industry: 'Technology',
        created_at: new Date('2023-01-01')
      };
      const updatedCompany = {
        ...existingCompany,
        ...companyData,
        updated_at: expect.any(Date)
      };
      mockCompanyRepository.findById.mockResolvedValue(existingCompany);
      mockCompanyRepository.update.mockResolvedValue(updatedCompany);

      // Act
      const result = await companyService.updateCompany(companyId, companyData);

      // Assert
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(mockCompanyRepository.update).toHaveBeenCalledWith(companyId, {
        ...companyData,
        updated_at: expect.any(Date)
      });
      expect(result).toEqual(updatedCompany);
    });

    test('should update company name when it is not already in use', async () => {
      // Arrange
      const companyId = 1;
      const companyData = {
        name: 'New Company Name',
        industry: 'Technology'
      };
      const existingCompany = {
        id: companyId,
        name: 'Old Company Name',
        industry: 'Technology',
        created_at: new Date('2023-01-01')
      };
      const updatedCompany = {
        ...existingCompany,
        ...companyData,
        updated_at: expect.any(Date)
      };
      mockCompanyRepository.findById.mockResolvedValue(existingCompany);
      mockCompanyRepository.findByName.mockResolvedValue(null);
      mockCompanyRepository.update.mockResolvedValue(updatedCompany);

      // Act
      const result = await companyService.updateCompany(companyId, companyData);

      // Assert
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(mockCompanyRepository.findByName).toHaveBeenCalledWith(companyData.name);
      expect(mockCompanyRepository.update).toHaveBeenCalledWith(companyId, {
        ...companyData,
        updated_at: expect.any(Date)
      });
      expect(result).toEqual(updatedCompany);
    });

    test('should throw error when company is not found', async () => {
      // Arrange
      const companyId = 999;
      const companyData = {
        industry: 'Updated Industry'
      };
      mockCompanyRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(companyService.updateCompany(companyId, companyData)).rejects.toThrow('Company not found');
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(mockCompanyRepository.update).not.toHaveBeenCalled();
    });

    test('should throw error when new company name is already in use', async () => {
      // Arrange
      const companyId = 1;
      const companyData = {
        name: 'Existing Company Name'
      };
      const existingCompany = {
        id: companyId,
        name: 'Original Company Name',
        industry: 'Technology'
      };
      const anotherCompany = {
        id: 2,
        name: 'Existing Company Name',
        industry: 'Healthcare'
      };
      mockCompanyRepository.findById.mockResolvedValue(existingCompany);
      mockCompanyRepository.findByName.mockResolvedValue(anotherCompany);

      // Act & Assert
      await expect(companyService.updateCompany(companyId, companyData)).rejects.toThrow('Company name already exists');
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(mockCompanyRepository.findByName).toHaveBeenCalledWith(companyData.name);
      expect(mockCompanyRepository.update).not.toHaveBeenCalled();
    });

    test('should allow updating to the same company name', async () => {
      // Arrange
      const companyId = 1;
      const companyData = {
        name: 'Same Company Name',
        description: 'Updated description'
      };
      const existingCompany = {
        id: companyId,
        name: 'Same Company Name',
        industry: 'Technology',
        created_at: new Date('2023-01-01')
      };
      const updatedCompany = {
        ...existingCompany,
        ...companyData,
        updated_at: expect.any(Date)
      };
      mockCompanyRepository.findById.mockResolvedValue(existingCompany);
      // Skip the findByName call since we're testing the case where the name doesn't change
      mockCompanyRepository.update.mockResolvedValue(updatedCompany);

      // Act
      const result = await companyService.updateCompany(companyId, companyData);

      // Assert
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      // Don't expect findByName to be called when name is the same
      expect(mockCompanyRepository.update).toHaveBeenCalledWith(companyId, {
        ...companyData,
        updated_at: expect.any(Date)
      });
      expect(result).toEqual(updatedCompany);
    });
  });

  describe('deleteCompany', () => {
    test('should delete an existing company', async () => {
      // Arrange
      const companyId = 1;
      const existingCompany = { id: companyId, name: 'Test Company', industry: 'Technology' };
      mockCompanyRepository.findById.mockResolvedValue(existingCompany);
      mockCompanyRepository.delete.mockResolvedValue(true);

      // Act
      const result = await companyService.deleteCompany(companyId);

      // Assert
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(mockCompanyRepository.delete).toHaveBeenCalledWith(companyId);
      expect(result).toBe(true);
    });

    test('should throw error when company is not found', async () => {
      // Arrange
      const companyId = 999;
      mockCompanyRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(companyService.deleteCompany(companyId)).rejects.toThrow('Company not found');
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(mockCompanyRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getCompaniesByIndustry', () => {
    test('should return companies by industry', async () => {
      // Arrange
      const industry = 'Technology';
      const mockCompanies = [
        { id: 1, name: 'Tech Company 1', industry },
        { id: 2, name: 'Tech Company 2', industry }
      ];
      mockCompanyRepository.findByIndustry.mockResolvedValue(mockCompanies);

      // Act
      const result = await companyService.getCompaniesByIndustry(industry);

      // Assert
      expect(mockCompanyRepository.findByIndustry).toHaveBeenCalledWith(industry);
      expect(result).toEqual(mockCompanies);
      expect(result.length).toBe(2);
    });

    test('should return empty array when no companies in industry exist', async () => {
      // Arrange
      const industry = 'Nonexistent Industry';
      mockCompanyRepository.findByIndustry.mockResolvedValue([]);

      // Act
      const result = await companyService.getCompaniesByIndustry(industry);

      // Assert
      expect(mockCompanyRepository.findByIndustry).toHaveBeenCalledWith(industry);
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('searchCompanies', () => {
    test('should search companies by name', async () => {
      // Arrange
      const query = 'tech';
      const mockCompanies = [
        { id: 1, name: 'Tech Company', industry: 'Technology', website: 'https://tech.example.com' },
        { id: 2, name: 'Healthcare Tech', industry: 'Healthcare', website: 'https://healthcare.example.com' },
        { id: 3, name: 'Finance Corp', industry: 'Finance', website: 'https://finance.example.com' }
      ];
      mockCompanyRepository.findAll.mockResolvedValue(mockCompanies);

      // Act
      const result = await companyService.searchCompanies(query);

      // Assert
      expect(mockCompanyRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([
        { id: 1, name: 'Tech Company', industry: 'Technology', website: 'https://tech.example.com' },
        { id: 2, name: 'Healthcare Tech', industry: 'Healthcare', website: 'https://healthcare.example.com' }
      ]);
      expect(result.length).toBe(2);
    });

    test('should search companies by industry', async () => {
      // Arrange
      const query = 'health';
      const mockCompanies = [
        { id: 1, name: 'Tech Company', industry: 'Technology', website: 'https://tech.example.com' },
        { id: 2, name: 'Healthcare Tech', industry: 'Healthcare', website: 'https://healthcare.example.com' },
        { id: 3, name: 'Finance Corp', industry: 'Finance', website: 'https://finance.example.com' }
      ];
      mockCompanyRepository.findAll.mockResolvedValue(mockCompanies);

      // Act
      const result = await companyService.searchCompanies(query);

      // Assert
      expect(mockCompanyRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([
        { id: 2, name: 'Healthcare Tech', industry: 'Healthcare', website: 'https://healthcare.example.com' }
      ]);
      expect(result.length).toBe(1);
    });

    test('should search companies by website', async () => {
      // Arrange
      const query = 'finance';
      const mockCompanies = [
        { id: 1, name: 'Tech Company', industry: 'Technology', website: 'https://tech.example.com' },
        { id: 2, name: 'Healthcare Tech', industry: 'Healthcare', website: 'https://healthcare.example.com' },
        { id: 3, name: 'Finance Corp', industry: 'Finance', website: 'https://finance.example.com' }
      ];
      mockCompanyRepository.findAll.mockResolvedValue(mockCompanies);

      // Act
      const result = await companyService.searchCompanies(query);

      // Assert
      expect(mockCompanyRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([
        { id: 3, name: 'Finance Corp', industry: 'Finance', website: 'https://finance.example.com' }
      ]);
      expect(result.length).toBe(1);
    });

    test('should search companies by description', async () => {
      // Arrange
      const query = 'innovative';
      const mockCompanies = [
        {
          id: 1,
          name: 'Tech Company',
          industry: 'Technology',
          description: 'An innovative tech company'
        },
        {
          id: 2,
          name: 'Healthcare Tech',
          industry: 'Healthcare',
          description: 'Healthcare solutions provider'
        }
      ];
      mockCompanyRepository.findAll.mockResolvedValue(mockCompanies);

      // Act
      const result = await companyService.searchCompanies(query);

      // Assert
      expect(mockCompanyRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: 1,
          name: 'Tech Company',
          industry: 'Technology',
          description: 'An innovative tech company'
        }
      ]);
      expect(result.length).toBe(1);
    });

    test('should return all companies when query is empty', async () => {
      // Arrange
      const query = '';
      const mockCompanies = [
        { id: 1, name: 'Tech Company', industry: 'Technology' },
        { id: 2, name: 'Healthcare Tech', industry: 'Healthcare' },
        { id: 3, name: 'Finance Corp', industry: 'Finance' }
      ];
      mockCompanyRepository.findAll.mockResolvedValue(mockCompanies);

      // Act
      const result = await companyService.searchCompanies(query);

      // Assert
      expect(mockCompanyRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCompanies);
      expect(result.length).toBe(3);
    });

    test('should return empty array when no matches found', async () => {
      // Arrange
      const query = 'nonexistent';
      const mockCompanies = [
        { id: 1, name: 'Tech Company', industry: 'Technology' },
        { id: 2, name: 'Healthcare Tech', industry: 'Healthcare' },
        { id: 3, name: 'Finance Corp', industry: 'Finance' }
      ];
      mockCompanyRepository.findAll.mockResolvedValue(mockCompanies);

      // Act
      const result = await companyService.searchCompanies(query);

      // Assert
      expect(mockCompanyRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });
});
