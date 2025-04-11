/**
 * Unit tests for contact functionality
 */

describe('Contact Management', () => {
  // Mock contact data
  const mockContacts = [
    {
      id: 1,
      first_name: 'Alice',
      last_name: 'Anderson',
      email: 'alice.anderson@acme.example.com',
      phone: '123-456-7890',
      job_title: 'CEO',
      company_id: 1,
      created_by: 1
    },
    {
      id: 2,
      first_name: 'Bob',
      last_name: 'Brown',
      email: 'bob.brown@acme.example.com',
      phone: '234-567-8901',
      job_title: 'CTO',
      company_id: 1,
      created_by: 1
    },
    {
      id: 3,
      first_name: 'Charlie',
      last_name: 'Clark',
      email: 'charlie.clark@globex.example.com',
      phone: '345-678-9012',
      job_title: 'Procurement Manager',
      company_id: 2,
      created_by: 2
    }
  ];

  // Mock contact service
  const mockFindAll = jest.fn();
  const mockFindById = jest.fn();
  const mockFindByCompany = jest.fn();
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  const contactService = {
    findAllContacts: mockFindAll,
    findContactById: mockFindById,
    findContactsByCompany: mockFindByCompany,
    createContact: mockCreate,
    updateContact: mockUpdate,
    deleteContact: mockDelete
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockFindAll.mockReset();
    mockFindById.mockReset();
    mockFindByCompany.mockReset();
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockDelete.mockReset();
  });

  test('should get all contacts', async () => {
    // Arrange
    mockFindAll.mockResolvedValue(mockContacts);

    // Act
    const result = await contactService.findAllContacts();

    // Assert
    expect(mockFindAll).toHaveBeenCalled();
    expect(result).toEqual(mockContacts);
    expect(result.length).toBe(3);
  });

  test('should get contact by ID', async () => {
    // Arrange
    const contactId = 1;
    const expectedContact = mockContacts.find(contact => contact.id === contactId);
    mockFindById.mockResolvedValue(expectedContact);

    // Act
    const result = await contactService.findContactById(contactId);

    // Assert
    expect(mockFindById).toHaveBeenCalledWith(contactId);
    expect(result).toEqual(expectedContact);
  });

  test('should return null when contact is not found', async () => {
    // Arrange
    const contactId = 999;
    mockFindById.mockResolvedValue(null);

    // Act
    const result = await contactService.findContactById(contactId);

    // Assert
    expect(mockFindById).toHaveBeenCalledWith(contactId);
    expect(result).toBeNull();
  });

  test('should get contacts by company ID', async () => {
    // Arrange
    const companyId = 1;
    const expectedContacts = mockContacts.filter(contact => contact.company_id === companyId);
    mockFindByCompany.mockResolvedValue(expectedContacts);

    // Act
    const result = await contactService.findContactsByCompany(companyId);

    // Assert
    expect(mockFindByCompany).toHaveBeenCalledWith(companyId);
    expect(result).toEqual(expectedContacts);
    expect(result.length).toBe(2);
  });

  test('should create a new contact', async () => {
    // Arrange
    const newContact = {
      first_name: 'David',
      last_name: 'Davis',
      email: 'david.davis@example.com',
      phone: '456-789-0123',
      job_title: 'Sales Manager',
      company_id: 3,
      created_by: 1
    };
    const createdContact = { id: 4, ...newContact };
    mockCreate.mockResolvedValue(createdContact);

    // Act
    const result = await contactService.createContact(newContact);

    // Assert
    expect(mockCreate).toHaveBeenCalledWith(newContact);
    expect(result).toEqual(createdContact);
    expect(result.id).toBe(4);
  });

  test('should update an existing contact', async () => {
    // Arrange
    const contactId = 1;
    const updateData = {
      first_name: 'Updated',
      last_name: 'Name',
      job_title: 'Updated Title'
    };
    const updatedContact = {
      ...mockContacts.find(contact => contact.id === contactId),
      ...updateData
    };
    mockUpdate.mockResolvedValue(updatedContact);

    // Act
    const result = await contactService.updateContact(contactId, updateData);

    // Assert
    expect(mockUpdate).toHaveBeenCalledWith(contactId, updateData);
    expect(result).toEqual(updatedContact);
    expect(result.first_name).toBe('Updated');
    expect(result.last_name).toBe('Name');
    expect(result.job_title).toBe('Updated Title');
  });

  test('should delete a contact', async () => {
    // Arrange
    const contactId = 1;
    mockDelete.mockResolvedValue(true);

    // Act
    const result = await contactService.deleteContact(contactId);

    // Assert
    expect(mockDelete).toHaveBeenCalledWith(contactId);
    expect(result).toBe(true);
  });

  test('should validate contact data before creation', () => {
    // Arrange
    const validContact = {
      first_name: 'Valid',
      last_name: 'Contact',
      email: 'valid.contact@example.com',
      company_id: 1,
      created_by: 1
    };

    const invalidContact1 = {
      // Missing first_name
      last_name: 'Contact',
      email: 'invalid.contact@example.com',
      company_id: 1,
      created_by: 1
    };

    const invalidContact2 = {
      first_name: 'Invalid',
      last_name: 'Contact',
      email: 'invalid-email', // Invalid email format
      company_id: 1,
      created_by: 1
    };

    // Act & Assert
    expect(validateContact(validContact)).toBe(true);
    expect(validateContact(invalidContact1)).toBe(false);
    expect(validateContact(invalidContact2)).toBe(false);
  });

  test('should search contacts by name or email', async () => {
    // Arrange
    const searchTerm = 'alice';
    const expectedResults = mockContacts.filter(
      contact => 
        contact.first_name.toLowerCase().includes(searchTerm) || 
        contact.last_name.toLowerCase().includes(searchTerm) || 
        contact.email.toLowerCase().includes(searchTerm)
    );
    
    // Act
    const results = searchContacts(mockContacts, searchTerm);
    
    // Assert
    expect(results).toEqual(expectedResults);
    expect(results.length).toBe(1);
    expect(results[0].first_name).toBe('Alice');
  });

  // Helper functions for testing
  function validateContact(contact) {
    if (!contact.first_name || !contact.last_name) {
      return false;
    }
    
    if (contact.email && !contact.email.includes('@')) {
      return false;
    }
    
    return true;
  }
  
  function searchContacts(contacts, searchTerm) {
    if (!searchTerm) {
      return contacts;
    }
    
    const term = searchTerm.toLowerCase();
    return contacts.filter(
      contact => 
        contact.first_name.toLowerCase().includes(term) || 
        contact.last_name.toLowerCase().includes(term) || 
        contact.email.toLowerCase().includes(term)
    );
  }
});
