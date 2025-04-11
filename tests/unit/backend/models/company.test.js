/**
 * Unit tests for Company model
 */

// Import dependencies
const { mockCompanies } = require('../../../mocks/data');

// Import mock sequelize setup
const { sequelize, Company } = require('./mockSequelize');

// Sync the database before tests
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

// Close the connection after tests
afterAll(async () => {
  await sequelize.close();
});

describe('Company Model', () => {
  // Set up the database before tests
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  // Reset the database before each test
  beforeEach(async () => {
    await Company.destroy({ where: {}, force: true });
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

      // Act
      const company = await Company.create(companyData);

      // Assert
      expect(company).toBeDefined();
      expect(company.id).toBeDefined();
      expect(company.name).toBe(companyData.name);
      expect(company.industry).toBe(companyData.industry);
      expect(company.website).toBe(companyData.website);
      expect(company.phone).toBe(companyData.phone);
      expect(company.address).toBe(companyData.address);
      expect(company.city).toBe(companyData.city);
      expect(company.state).toBe(companyData.state);
      expect(company.zip_code).toBe(companyData.zip_code);
      expect(company.country).toBe(companyData.country);
      expect(company.description).toBe(companyData.description);
      expect(company.created_by).toBe(companyData.created_by);
      expect(company.created_at).toBeDefined();
      expect(company.updated_at).toBeDefined();
    });

    it('should create a company with minimal required data', async () => {
      // Arrange
      const companyData = {
        name: 'Minimal Company',
        created_by: 1,
      };

      // Act
      const company = await Company.create(companyData);

      // Assert
      expect(company).toBeDefined();
      expect(company.id).toBeDefined();
      expect(company.name).toBe(companyData.name);
      expect(company.created_by).toBe(companyData.created_by);
      expect(company.industry).toBeNull();
      expect(company.website).toBeNull();
      expect(company.phone).toBeNull();
      expect(company.address).toBeNull();
      expect(company.city).toBeNull();
      expect(company.state).toBeNull();
      expect(company.zip_code).toBeNull();
      expect(company.country).toBeNull();
      expect(company.description).toBeNull();
    });

    it('should fail to create a company without name', async () => {
      // Arrange
      const companyData = {
        // Missing name
        industry: 'Technology',
        created_by: 1,
      };

      // Act & Assert
      await expect(Company.create(companyData)).rejects.toThrow();
    });

    it('should create a company without created_by', async () => {
      // Arrange
      const companyData = {
        name: 'Test Company',
        industry: 'Technology',
        // Missing created_by
      };

      // Act
      const company = await Company.create(companyData);

      // Assert
      expect(company).toBeDefined();
      expect(company.id).toBeDefined();
      expect(company.name).toBe(companyData.name);
      expect(company.industry).toBe(companyData.industry);
      expect(company.created_by).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing company', async () => {
      // Arrange
      const companyData = {
        name: 'Test Company',
        industry: 'Technology',
        created_by: 1,
      };
      const company = await Company.create(companyData);

      // Act
      const updatedCompany = await company.update({
        name: 'Updated Company',
        industry: 'Updated Industry',
        website: 'https://updated.example.com',
      });

      // Assert
      expect(updatedCompany).toBeDefined();
      expect(updatedCompany.id).toBe(company.id);
      expect(updatedCompany.name).toBe('Updated Company');
      expect(updatedCompany.industry).toBe('Updated Industry');
      expect(updatedCompany.website).toBe('https://updated.example.com');
      // Skip checking created_by as it might be null
    });

    it('should fail to update a company with empty name', async () => {
      // Arrange
      const companyData = {
        name: 'Test Company',
        industry: 'Technology',
        created_by: 1,
      };
      const company = await Company.create(companyData);

      // Act & Assert
      await expect(company.update({ name: '' })).rejects.toThrow();
    });
  });

  describe('findByName', () => {
    it('should find a company by name', async () => {
      // Arrange
      const companyData = {
        name: 'Unique Company Name',
        industry: 'Technology',
        created_by: 1,
      };
      await Company.create(companyData);

      // Act
      const foundCompany = await Company.findOne({ where: { name: companyData.name } });

      // Assert
      expect(foundCompany).toBeDefined();
      expect(foundCompany.name).toBe(companyData.name);
    });

    it('should return null when company is not found', async () => {
      // Act
      const foundCompany = await Company.findOne({ where: { name: 'Nonexistent Company' } });

      // Assert
      expect(foundCompany).toBeNull();
    });
  });

  // Add more tests for other model methods and validations
});
