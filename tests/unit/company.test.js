/**
 * Unit tests for company functionality
 */

describe('Company Management', () => {
  // Mock company data
  const mockCompanies = [
    {
      id: 1,
      name: 'Acme Corporation',
      industry: 'Technology',
      website: 'https://acme.example.com',
      phone: '123-456-7890',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      country: 'USA',
      description: 'A leading technology company',
      created_by: 1
    },
    {
      id: 2,
      name: 'Globex Corporation',
      industry: 'Manufacturing',
      website: 'https://globex.example.com',
      phone: '234-567-8901',
      address: '456 Oak St',
      city: 'Chicago',
      state: 'IL',
      zip_code: '60601',
      country: 'USA',
      description: 'A global manufacturing company',
      created_by: 1
    },
    {
      id: 3,
      name: 'Initech',
      industry: 'Finance',
      website: 'https://initech.example.com',
      phone: '345-678-9012',
      address: '789 Pine St',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94101',
      country: 'USA',
      description: 'A financial services company',
      created_by: 2
    }
  ];

  // Mock company service
  const mockFindAll = jest.fn();
  const mockFindById = jest.fn();
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  const companyService = {
    findAllCompanies: mockFindAll,
    findCompanyById: mockFindById,
    createCompany: mockCreate,
    updateCompany: mockUpdate,
    deleteCompany: mockDelete
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockFindAll.mockReset();
    mockFindById.mockReset();
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockDelete.mockReset();
  });

  test('should get all companies', async () => {
    // Arrange
    mockFindAll.mockResolvedValue(mockCompanies);

    // Act
    const result = await companyService.findAllCompanies();

    // Assert
    expect(mockFindAll).toHaveBeenCalled();
    expect(result).toEqual(mockCompanies);
    expect(result.length).toBe(3);
  });

  test('should get company by ID', async () => {
    // Arrange
    const companyId = 1;
    const expectedCompany = mockCompanies.find(company => company.id === companyId);
    mockFindById.mockResolvedValue(expectedCompany);

    // Act
    const result = await companyService.findCompanyById(companyId);

    // Assert
    expect(mockFindById).toHaveBeenCalledWith(companyId);
    expect(result).toEqual(expectedCompany);
  });

  test('should return null when company is not found', async () => {
    // Arrange
    const companyId = 999;
    mockFindById.mockResolvedValue(null);

    // Act
    const result = await companyService.findCompanyById(companyId);

    // Assert
    expect(mockFindById).toHaveBeenCalledWith(companyId);
    expect(result).toBeNull();
  });

  test('should create a new company', async () => {
    // Arrange
    const newCompany = {
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
      created_by: 1
    };
    const createdCompany = { id: 4, ...newCompany };
    mockCreate.mockResolvedValue(createdCompany);

    // Act
    const result = await companyService.createCompany(newCompany);

    // Assert
    expect(mockCreate).toHaveBeenCalledWith(newCompany);
    expect(result).toEqual(createdCompany);
    expect(result.id).toBe(4);
  });

  test('should update an existing company', async () => {
    // Arrange
    const companyId = 1;
    const updateData = {
      name: 'Updated Company',
      industry: 'Updated Industry'
    };
    const updatedCompany = {
      ...mockCompanies.find(company => company.id === companyId),
      ...updateData
    };
    mockUpdate.mockResolvedValue(updatedCompany);

    // Act
    const result = await companyService.updateCompany(companyId, updateData);

    // Assert
    expect(mockUpdate).toHaveBeenCalledWith(companyId, updateData);
    expect(result).toEqual(updatedCompany);
    expect(result.name).toBe('Updated Company');
    expect(result.industry).toBe('Updated Industry');
  });

  test('should delete a company', async () => {
    // Arrange
    const companyId = 1;
    mockDelete.mockResolvedValue(true);

    // Act
    const result = await companyService.deleteCompany(companyId);

    // Assert
    expect(mockDelete).toHaveBeenCalledWith(companyId);
    expect(result).toBe(true);
  });
});
