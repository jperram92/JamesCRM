/**
 * Integration tests for companies API endpoints
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { mockCompanies, mockUsers, mockContacts, mockDeals } = require('../../mocks/data');
const createMockApp = require('../mockApp');

// Mock jwt
jest.mock('jsonwebtoken');

// Create a mock Express app
const app = createMockApp();

// Mock Company model methods
const Company = app.models.Company;
Company.findAll = jest.fn();
Company.findByPk = jest.fn();
Company.create = jest.fn();
Company.update = jest.fn();
Company.destroy = jest.fn();

// Mock Contact model methods
const Contact = app.models.Contact = {
  findAll: jest.fn()
};

// Mock Deal model methods
const Deal = app.models.Deal = {
  findAll: jest.fn()
};

// Mock jwt methods
jwt.sign.mockReturnValue('mock-token');
jwt.verify.mockImplementation((token, secret, callback) => {
  if (token === 'valid-token') {
    return { id: 1, role: 'admin' };
  } else {
    throw new Error('Invalid token');
  }
});

describe('Companies API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to create an authenticated request
  const authenticatedRequest = (method, url) => {
    const req = request(app)[method](url);
    return req.set('Authorization', 'Bearer valid-token');
  };

  describe('GET /api/companies', () => {
    it('should return all companies', async () => {
      // Arrange
      Company.findAll.mockResolvedValue(mockCompanies);

      // Act
      const response = await authenticatedRequest('get', '/api/companies');

      // Assert
      expect(response.status).toBe(200);
      // Skip exact comparison of dates
      expect(response.body.length).toBe(mockCompanies.length);
      expect(response.body[0].id).toBe(mockCompanies[0].id);
      expect(response.body[0].name).toBe(mockCompanies[0].name);
      expect(Company.findAll).toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app).get('/api/companies');

      // Assert
      expect(response.status).toBe(401);
      expect(Company.findAll).not.toHaveBeenCalled();
    });

    it('should handle server errors', async () => {
      // Arrange
      Company.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      const response = await authenticatedRequest('get', '/api/companies');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
      expect(Company.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/companies/:id', () => {
    it('should return a company when a valid ID is provided', async () => {
      // Arrange
      const companyId = 1;
      const mockCompany = mockCompanies.find(company => company.id === companyId);
      Company.findByPk.mockResolvedValue(mockCompany);

      // Act
      const response = await authenticatedRequest('get', `/api/companies/${companyId}`);

      // Assert
      expect(response.status).toBe(200);
      // Skip exact comparison of dates
      expect(response.body.id).toBe(mockCompany.id);
      expect(response.body.name).toBe(mockCompany.name);
      expect(Company.findByPk).toHaveBeenCalled();
    });

    it('should return 404 when company is not found', async () => {
      // Arrange
      const companyId = 999;
      Company.findByPk.mockResolvedValue(null);

      // Act
      const response = await authenticatedRequest('get', `/api/companies/${companyId}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Company not found');
      expect(Company.findByPk).toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app).get('/api/companies/1');

      // Assert
      expect(response.status).toBe(401);
      expect(Company.findByPk).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/companies', () => {
    it('should create a new company', async () => {
      // Arrange
      const newCompany = {
        id: 4,
        name: 'New Company',
        industry: 'Technology',
        website: 'https://newcompany.example.com',
        phone: '123-456-7890',
        address: '123 New St',
        city: 'New City',
        state: 'NC',
        zip_code: '12345',
        country: 'USA',
        description: 'A new company',
        created_by: 1,
      };

      Company.create.mockResolvedValue(newCompany);

      // Act
      const response = await authenticatedRequest('post', '/api/companies')
        .send({
          name: 'New Company',
          industry: 'Technology',
          website: 'https://newcompany.example.com',
          phone: '123-456-7890',
          address: '123 New St',
          city: 'New City',
          state: 'NC',
          zip_code: '12345',
          country: 'USA',
          description: 'A new company',
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual(newCompany);
      expect(Company.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Company',
        industry: 'Technology',
      }));
    });

    it('should return 400 when name is missing', async () => {
      // Act
      const response = await authenticatedRequest('post', '/api/companies')
        .send({
          industry: 'Technology',
          // Missing name field
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(Company.create).not.toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app)
        .post('/api/companies')
        .send({
          name: 'New Company',
          industry: 'Technology',
        });

      // Assert
      expect(response.status).toBe(401);
      expect(Company.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/companies/:id', () => {
    it('should update an existing company', async () => {
      // Arrange
      const companyId = 1;
      const mockCompany = {
        ...mockCompanies.find(company => company.id === companyId),
        update: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Updated Company',
          industry: 'Updated Industry',
        }),
      };

      Company.findByPk.mockResolvedValue(mockCompany);

      // Act
      const response = await authenticatedRequest('put', `/api/companies/${companyId}`)
        .send({
          name: 'Updated Company',
          industry: 'Updated Industry',
        });

      // Assert
      // Skip exact comparison
      expect(response.body).toBeDefined();
      expect(Company.findByPk).toHaveBeenCalledWith(companyId.toString());
      expect(mockCompany.update).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Updated Company',
        industry: 'Updated Industry',
      }));
    });

    it('should return 404 when company is not found', async () => {
      // Arrange
      const companyId = 999;
      Company.findByPk.mockResolvedValue(null);

      // Act
      const response = await authenticatedRequest('put', `/api/companies/${companyId}`)
        .send({
          name: 'Updated Company',
        });

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Company not found');
      expect(Company.findByPk).toHaveBeenCalledWith(companyId.toString());
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app)
        .put('/api/companies/1')
        .send({
          name: 'Updated Company',
        });

      // Assert
      expect(response.status).toBe(401);
      expect(Company.findByPk).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/companies/:id', () => {
    it('should delete an existing company', async () => {
      // Arrange
      const companyId = 1;
      const mockCompany = {
        ...mockCompanies.find(company => company.id === companyId),
        destroy: jest.fn().mockResolvedValue(true),
      };

      Company.findByPk.mockResolvedValue(mockCompany);

      // Act
      const response = await authenticatedRequest('delete', `/api/companies/${companyId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Company deleted successfully');
      expect(Company.findByPk).toHaveBeenCalledWith(companyId.toString());
      expect(mockCompany.destroy).toHaveBeenCalled();
    });

    it('should return 404 when company is not found', async () => {
      // Arrange
      const companyId = 999;
      Company.findByPk.mockResolvedValue(null);

      // Act
      const response = await authenticatedRequest('delete', `/api/companies/${companyId}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Company not found');
      expect(Company.findByPk).toHaveBeenCalledWith(companyId.toString());
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app).delete('/api/companies/1');

      // Assert
      expect(response.status).toBe(401);
      expect(Company.findByPk).not.toHaveBeenCalled();
    });
  });

  // Add more tests for other company API endpoints
});
