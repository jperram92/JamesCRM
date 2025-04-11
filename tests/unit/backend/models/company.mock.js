/**
 * Mock implementation for Company model
 */

// Create a mock Company model
const mockCompany = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  sequelize: {
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
  }
};

// Mock implementation for create method
mockCompany.create.mockImplementation((data) => {
  // Validate required fields
  if (!data.name) {
    return Promise.reject(new Error('Name is required'));
  }

  // Generate a random ID
  const id = Math.floor(Math.random() * 1000) + 1;

  // Create the company object with default null values for optional fields
  const company = {
    id,
    name: data.name,
    industry: data.industry || null,
    website: data.website || null,
    phone: data.phone || null,
    address: data.address || null,
    city: data.city || null,
    state: data.state || null,
    zip_code: data.zip_code || null,
    country: data.country || null,
    description: data.description || null,
    created_by: data.created_by || null,
    created_at: new Date(),
    updated_at: new Date(),
    update: jest.fn().mockImplementation((updateData) => {
      if (updateData.name === '') {
        return Promise.reject(new Error('Name cannot be empty'));
      }
      return Promise.resolve({
        id,
        ...company,
        ...updateData,
        updated_at: new Date(),
      });
    }),
  };

  return Promise.resolve(company);
});

// Mock implementation for findOne method
mockCompany.findOne.mockImplementation(({ where }) => {
  if (where && where.name) {
    if (where.name === 'Nonexistent Company') {
      return Promise.resolve(null);
    }
    return Promise.resolve({
      id: Math.floor(Math.random() * 1000) + 1,
      name: where.name,
      industry: 'Technology',
      created_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
  return Promise.resolve(null);
});

// Mock implementation for destroy method
mockCompany.destroy.mockImplementation(() => {
  return Promise.resolve(1);
});

module.exports = mockCompany;
