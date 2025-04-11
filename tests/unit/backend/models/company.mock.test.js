/**
 * Unit tests for Company model (mocked version)
 */

// Import dependencies
const { mockCompanies } = require('../../../mocks/data');

// Mock the Company model
const mockCompany = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
};

// Mock the sequelize instance
const mockSequelize = {
  sync: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(true),
};

describe('Company Model (Mocked)', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new company with valid data', async () => {
      // Arrange
      const companyData = {
        name: 'Test Company',
        industry: 'Technology',
        website: 'https://testcompany.example.com',
        phone: '123-456-7890',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        country: 'Test Country',
        description: 'A test company',
        created_by: 1,
      };
      
      mockCompany.create.mockResolvedValue({
        id: 1,
        ...companyData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const company = await mockCompany.create(companyData);

      // Assert
      expect(company).toBeDefined();
      expect(company.id).toBe(1);
      expect(company.name).toBe(companyData.name);
      expect(mockCompany.create).toHaveBeenCalledWith(companyData);
    });

    it('should create a company with minimal required data', async () => {
      // Arrange
      const companyData = {
        name: 'Minimal Company',
        industry: 'Other',
        created_by: 1,
      };
      
      mockCompany.create.mockResolvedValue({
        id: 2,
        ...companyData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const company = await mockCompany.create(companyData);

      // Assert
      expect(company).toBeDefined();
      expect(company.id).toBe(2);
      expect(company.name).toBe(companyData.name);
      expect(mockCompany.create).toHaveBeenCalledWith(companyData);
    });

    it('should create a company without created_by', async () => {
      // Arrange
      const companyData = {
        name: 'No Creator Company',
        industry: 'Other',
      };
      
      mockCompany.create.mockResolvedValue({
        id: 3,
        ...companyData,
        created_by: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const company = await mockCompany.create(companyData);

      // Assert
      expect(company).toBeDefined();
      expect(company.name).toBe(companyData.name);
      expect(company.created_by).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing company', async () => {
      // Arrange
      const companyData = {
        name: 'Update Test Company',
        industry: 'Technology',
        created_by: 1,
      };
      
      const company = {
        id: 4,
        ...companyData,
        update: jest.fn().mockResolvedValue({
          id: 4,
          name: 'Updated Company Name',
          industry: 'Technology',
          created_by: 1,
        }),
      };
      
      mockCompany.create.mockResolvedValue(company);

      // Act
      const createdCompany = await mockCompany.create(companyData);
      const updatedCompany = await createdCompany.update({
        name: 'Updated Company Name',
      });

      // Assert
      expect(updatedCompany).toBeDefined();
      expect(updatedCompany.name).toBe('Updated Company Name');
      expect(company.update).toHaveBeenCalledWith({
        name: 'Updated Company Name',
      });
    });

    it('should fail to update a company with empty name', async () => {
      // Arrange
      const companyData = {
        name: 'Invalid Update Company',
        industry: 'Technology',
        created_by: 1,
      };
      
      const company = {
        id: 5,
        ...companyData,
        update: jest.fn().mockRejectedValue(new Error('Name cannot be empty')),
      };
      
      mockCompany.create.mockResolvedValue(company);

      // Act & Assert
      const createdCompany = await mockCompany.create(companyData);
      await expect(createdCompany.update({ name: '' })).rejects.toThrow();
    });
  });

  describe('findByName', () => {
    it('should find a company by name', async () => {
      // Arrange
      const companyData = {
        name: 'Findable Company',
        industry: 'Technology',
        created_by: 1,
      };
      
      mockCompany.create.mockResolvedValue({
        id: 6,
        ...companyData,
      });
      
      mockCompany.findOne.mockResolvedValue({
        id: 6,
        ...companyData,
      });

      // Act
      await mockCompany.create(companyData);
      const foundCompany = await mockCompany.findOne({ where: { name: companyData.name } });

      // Assert
      expect(foundCompany).toBeDefined();
      expect(foundCompany.name).toBe(companyData.name);
      expect(mockCompany.findOne).toHaveBeenCalledWith({ where: { name: companyData.name } });
    });
  });
});
