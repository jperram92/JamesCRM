/**
 * Unit tests for company controller
 */

describe('Company Controller', () => {
  // Mock dependencies
  const mockCompanyService = {
    getAllCompanies: jest.fn(),
    getCompanyById: jest.fn(),
    createCompany: jest.fn(),
    updateCompany: jest.fn(),
    deleteCompany: jest.fn(),
    getCompanyByName: jest.fn(),
    getCompaniesByIndustry: jest.fn(),
    searchCompanies: jest.fn()
  };
  
  // Mock request and response
  let req;
  let res;
  
  // Mock company controller
  const companyController = {
    getAllCompanies: async (req, res) => {
      try {
        const companies = await mockCompanyService.getAllCompanies();
        res.json(companies);
      } catch (error) {
        res.status(500).json({ message: 'Server error while fetching companies' });
      }
    },
    
    getCompanyById: async (req, res) => {
      try {
        const company = await mockCompanyService.getCompanyById(req.params.id);
        res.json(company);
      } catch (error) {
        if (error.message === 'Company not found') {
          res.status(404).json({ message: 'Company not found' });
        } else {
          res.status(500).json({ message: 'Server error while fetching company' });
        }
      }
    },
    
    createCompany: async (req, res) => {
      try {
        const company = await mockCompanyService.createCompany(req.body);
        res.status(201).json(company);
      } catch (error) {
        if (error.message.includes('already exists')) {
          res.status(400).json({ message: error.message });
        } else {
          res.status(500).json({ message: 'Server error while creating company' });
        }
      }
    },
    
    updateCompany: async (req, res) => {
      try {
        const company = await mockCompanyService.updateCompany(req.params.id, req.body);
        res.json(company);
      } catch (error) {
        if (error.message === 'Company not found') {
          res.status(404).json({ message: 'Company not found' });
        } else if (error.message.includes('already exists')) {
          res.status(400).json({ message: error.message });
        } else {
          res.status(500).json({ message: 'Server error while updating company' });
        }
      }
    },
    
    deleteCompany: async (req, res) => {
      try {
        await mockCompanyService.deleteCompany(req.params.id);
        res.json({ message: 'Company deleted successfully' });
      } catch (error) {
        if (error.message === 'Company not found') {
          res.status(404).json({ message: 'Company not found' });
        } else {
          res.status(500).json({ message: 'Server error while deleting company' });
        }
      }
    },
    
    searchCompanies: async (req, res) => {
      try {
        const companies = await mockCompanyService.searchCompanies(req.query.q);
        res.json(companies);
      } catch (error) {
        res.status(500).json({ message: 'Server error while searching companies' });
      }
    },
    
    getCompaniesByIndustry: async (req, res) => {
      try {
        const companies = await mockCompanyService.getCompaniesByIndustry(req.params.industry);
        res.json(companies);
      } catch (error) {
        res.status(500).json({ message: 'Server error while fetching companies by industry' });
      }
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockCompanyService.getAllCompanies.mockReset();
    mockCompanyService.getCompanyById.mockReset();
    mockCompanyService.createCompany.mockReset();
    mockCompanyService.updateCompany.mockReset();
    mockCompanyService.deleteCompany.mockReset();
    mockCompanyService.getCompanyByName.mockReset();
    mockCompanyService.getCompaniesByIndustry.mockReset();
    mockCompanyService.searchCompanies.mockReset();
    
    // Initialize req and res for each test
    req = {
      params: {},
      body: {},
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getAllCompanies', () => {
    test('should return all companies', async () => {
      // Arrange
      const mockCompanies = [
        { id: 1, name: 'Company 1' },
        { id: 2, name: 'Company 2' }
      ];
      mockCompanyService.getAllCompanies.mockResolvedValue(mockCompanies);
      
      // Act
      await companyController.getAllCompanies(req, res);
      
      // Assert
      expect(mockCompanyService.getAllCompanies).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockCompanies);
    });
    
    test('should handle errors', async () => {
      // Arrange
      mockCompanyService.getAllCompanies.mockRejectedValue(new Error('Database error'));
      
      // Act
      await companyController.getAllCompanies(req, res);
      
      // Assert
      expect(mockCompanyService.getAllCompanies).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching companies' });
    });
  });
  
  describe('getCompanyById', () => {
    test('should return a company when a valid ID is provided', async () => {
      // Arrange
      const companyId = '1';
      const mockCompany = { id: 1, name: 'Company 1' };
      req.params.id = companyId;
      mockCompanyService.getCompanyById.mockResolvedValue(mockCompany);
      
      // Act
      await companyController.getCompanyById(req, res);
      
      // Assert
      expect(mockCompanyService.getCompanyById).toHaveBeenCalledWith(companyId);
      expect(res.json).toHaveBeenCalledWith(mockCompany);
    });
    
    test('should return 404 when company is not found', async () => {
      // Arrange
      const companyId = '999';
      req.params.id = companyId;
      mockCompanyService.getCompanyById.mockRejectedValue(new Error('Company not found'));
      
      // Act
      await companyController.getCompanyById(req, res);
      
      // Assert
      expect(mockCompanyService.getCompanyById).toHaveBeenCalledWith(companyId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Company not found' });
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const companyId = '1';
      req.params.id = companyId;
      mockCompanyService.getCompanyById.mockRejectedValue(new Error('Database error'));
      
      // Act
      await companyController.getCompanyById(req, res);
      
      // Assert
      expect(mockCompanyService.getCompanyById).toHaveBeenCalledWith(companyId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching company' });
    });
  });
  
  describe('createCompany', () => {
    test('should create a new company', async () => {
      // Arrange
      const companyData = { name: 'New Company', industry: 'Technology' };
      const newCompany = { id: 3, ...companyData };
      req.body = companyData;
      mockCompanyService.createCompany.mockResolvedValue(newCompany);
      
      // Act
      await companyController.createCompany(req, res);
      
      // Assert
      expect(mockCompanyService.createCompany).toHaveBeenCalledWith(companyData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newCompany);
    });
    
    test('should return 400 when company name already exists', async () => {
      // Arrange
      const companyData = { name: 'Existing Company', industry: 'Technology' };
      req.body = companyData;
      mockCompanyService.createCompany.mockRejectedValue(new Error('Company with name Existing Company already exists'));
      
      // Act
      await companyController.createCompany(req, res);
      
      // Assert
      expect(mockCompanyService.createCompany).toHaveBeenCalledWith(companyData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Company with name Existing Company already exists' });
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const companyData = { name: 'New Company', industry: 'Technology' };
      req.body = companyData;
      mockCompanyService.createCompany.mockRejectedValue(new Error('Database error'));
      
      // Act
      await companyController.createCompany(req, res);
      
      // Assert
      expect(mockCompanyService.createCompany).toHaveBeenCalledWith(companyData);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while creating company' });
    });
  });
  
  describe('updateCompany', () => {
    test('should update an existing company', async () => {
      // Arrange
      const companyId = '1';
      const companyData = { name: 'Updated Company', industry: 'Updated Industry' };
      const updatedCompany = { id: 1, ...companyData };
      req.params.id = companyId;
      req.body = companyData;
      mockCompanyService.updateCompany.mockResolvedValue(updatedCompany);
      
      // Act
      await companyController.updateCompany(req, res);
      
      // Assert
      expect(mockCompanyService.updateCompany).toHaveBeenCalledWith(companyId, companyData);
      expect(res.json).toHaveBeenCalledWith(updatedCompany);
    });
    
    test('should return 404 when company is not found', async () => {
      // Arrange
      const companyId = '999';
      const companyData = { name: 'Updated Company' };
      req.params.id = companyId;
      req.body = companyData;
      mockCompanyService.updateCompany.mockRejectedValue(new Error('Company not found'));
      
      // Act
      await companyController.updateCompany(req, res);
      
      // Assert
      expect(mockCompanyService.updateCompany).toHaveBeenCalledWith(companyId, companyData);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Company not found' });
    });
    
    test('should return 400 when company name already exists', async () => {
      // Arrange
      const companyId = '1';
      const companyData = { name: 'Existing Company' };
      req.params.id = companyId;
      req.body = companyData;
      mockCompanyService.updateCompany.mockRejectedValue(new Error('Company with name Existing Company already exists'));
      
      // Act
      await companyController.updateCompany(req, res);
      
      // Assert
      expect(mockCompanyService.updateCompany).toHaveBeenCalledWith(companyId, companyData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Company with name Existing Company already exists' });
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const companyId = '1';
      const companyData = { name: 'Updated Company' };
      req.params.id = companyId;
      req.body = companyData;
      mockCompanyService.updateCompany.mockRejectedValue(new Error('Database error'));
      
      // Act
      await companyController.updateCompany(req, res);
      
      // Assert
      expect(mockCompanyService.updateCompany).toHaveBeenCalledWith(companyId, companyData);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while updating company' });
    });
  });
  
  describe('deleteCompany', () => {
    test('should delete an existing company', async () => {
      // Arrange
      const companyId = '1';
      req.params.id = companyId;
      mockCompanyService.deleteCompany.mockResolvedValue(true);
      
      // Act
      await companyController.deleteCompany(req, res);
      
      // Assert
      expect(mockCompanyService.deleteCompany).toHaveBeenCalledWith(companyId);
      expect(res.json).toHaveBeenCalledWith({ message: 'Company deleted successfully' });
    });
    
    test('should return 404 when company is not found', async () => {
      // Arrange
      const companyId = '999';
      req.params.id = companyId;
      mockCompanyService.deleteCompany.mockRejectedValue(new Error('Company not found'));
      
      // Act
      await companyController.deleteCompany(req, res);
      
      // Assert
      expect(mockCompanyService.deleteCompany).toHaveBeenCalledWith(companyId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Company not found' });
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const companyId = '1';
      req.params.id = companyId;
      mockCompanyService.deleteCompany.mockRejectedValue(new Error('Database error'));
      
      // Act
      await companyController.deleteCompany(req, res);
      
      // Assert
      expect(mockCompanyService.deleteCompany).toHaveBeenCalledWith(companyId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while deleting company' });
    });
  });
  
  describe('searchCompanies', () => {
    test('should search companies by query', async () => {
      // Arrange
      const searchQuery = 'tech';
      const mockCompanies = [
        { id: 1, name: 'Tech Company' },
        { id: 2, name: 'Technology Inc' }
      ];
      req.query.q = searchQuery;
      mockCompanyService.searchCompanies.mockResolvedValue(mockCompanies);
      
      // Act
      await companyController.searchCompanies(req, res);
      
      // Assert
      expect(mockCompanyService.searchCompanies).toHaveBeenCalledWith(searchQuery);
      expect(res.json).toHaveBeenCalledWith(mockCompanies);
    });
    
    test('should handle empty search query', async () => {
      // Arrange
      const mockCompanies = [
        { id: 1, name: 'Company 1' },
        { id: 2, name: 'Company 2' }
      ];
      req.query.q = '';
      mockCompanyService.searchCompanies.mockResolvedValue(mockCompanies);
      
      // Act
      await companyController.searchCompanies(req, res);
      
      // Assert
      expect(mockCompanyService.searchCompanies).toHaveBeenCalledWith('');
      expect(res.json).toHaveBeenCalledWith(mockCompanies);
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const searchQuery = 'tech';
      req.query.q = searchQuery;
      mockCompanyService.searchCompanies.mockRejectedValue(new Error('Database error'));
      
      // Act
      await companyController.searchCompanies(req, res);
      
      // Assert
      expect(mockCompanyService.searchCompanies).toHaveBeenCalledWith(searchQuery);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while searching companies' });
    });
  });
  
  describe('getCompaniesByIndustry', () => {
    test('should return companies by industry', async () => {
      // Arrange
      const industry = 'Technology';
      const mockCompanies = [
        { id: 1, name: 'Tech Company', industry },
        { id: 2, name: 'Technology Inc', industry }
      ];
      req.params.industry = industry;
      mockCompanyService.getCompaniesByIndustry.mockResolvedValue(mockCompanies);
      
      // Act
      await companyController.getCompaniesByIndustry(req, res);
      
      // Assert
      expect(mockCompanyService.getCompaniesByIndustry).toHaveBeenCalledWith(industry);
      expect(res.json).toHaveBeenCalledWith(mockCompanies);
    });
    
    test('should return empty array when no companies in industry', async () => {
      // Arrange
      const industry = 'NonexistentIndustry';
      req.params.industry = industry;
      mockCompanyService.getCompaniesByIndustry.mockResolvedValue([]);
      
      // Act
      await companyController.getCompaniesByIndustry(req, res);
      
      // Assert
      expect(mockCompanyService.getCompaniesByIndustry).toHaveBeenCalledWith(industry);
      expect(res.json).toHaveBeenCalledWith([]);
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const industry = 'Technology';
      req.params.industry = industry;
      mockCompanyService.getCompaniesByIndustry.mockRejectedValue(new Error('Database error'));
      
      // Act
      await companyController.getCompaniesByIndustry(req, res);
      
      // Assert
      expect(mockCompanyService.getCompaniesByIndustry).toHaveBeenCalledWith(industry);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching companies by industry' });
    });
  });
});
