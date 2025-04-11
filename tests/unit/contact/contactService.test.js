/**
 * Unit tests for contact service
 */

describe('Contact Service', () => {
  // Mock dependencies
  const mockContactRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByCompanyId: jest.fn()
  };
  
  // Mock contact service
  const contactService = {
    getAllContacts: async () => {
      return await mockContactRepository.findAll();
    },
    
    getContactById: async (id) => {
      const contact = await mockContactRepository.findById(id);
      
      if (!contact) {
        throw new Error('Contact not found');
      }
      
      return contact;
    },
    
    getContactByEmail: async (email) => {
      const contact = await mockContactRepository.findByEmail(email);
      
      if (!contact) {
        throw new Error('Contact not found');
      }
      
      return contact;
    },
    
    createContact: async (contactData) => {
      const existingContact = await mockContactRepository.findByEmail(contactData.email);
      
      if (existingContact) {
        throw new Error('Contact with this email already exists');
      }
      
      return await mockContactRepository.create({
        ...contactData,
        created_at: new Date()
      });
    },
    
    updateContact: async (id, contactData) => {
      const contact = await mockContactRepository.findById(id);
      
      if (!contact) {
        throw new Error('Contact not found');
      }
      
      if (contactData.email && contactData.email !== contact.email) {
        const existingContact = await mockContactRepository.findByEmail(contactData.email);
        
        if (existingContact && existingContact.id !== id) {
          throw new Error('Contact with this email already exists');
        }
      }
      
      return await mockContactRepository.update(id, {
        ...contactData,
        updated_at: new Date()
      });
    },
    
    deleteContact: async (id) => {
      const contact = await mockContactRepository.findById(id);
      
      if (!contact) {
        throw new Error('Contact not found');
      }
      
      return await mockContactRepository.delete(id);
    },
    
    getContactsByCompany: async (companyId) => {
      return await mockContactRepository.findByCompanyId(companyId);
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockContactRepository.findAll.mockReset();
    mockContactRepository.findById.mockReset();
    mockContactRepository.findByEmail.mockReset();
    mockContactRepository.create.mockReset();
    mockContactRepository.update.mockReset();
    mockContactRepository.delete.mockReset();
    mockContactRepository.findByCompanyId.mockReset();
    
    // Default mock implementations
    mockContactRepository.findAll.mockResolvedValue([
      {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        company_id: 1,
        position: 'CEO',
        created_at: new Date('2023-01-01T00:00:00Z')
      },
      {
        id: 2,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '987-654-3210',
        company_id: 2,
        position: 'CTO',
        created_at: new Date('2023-01-02T00:00:00Z')
      }
    ]);
    
    mockContactRepository.findById.mockImplementation((id) => {
      if (id === 999) {
        return null;
      }
      
      return {
        id,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        company_id: 1,
        position: 'CEO',
        created_at: new Date('2023-01-01T00:00:00Z')
      };
    });
    
    mockContactRepository.findByEmail.mockImplementation((email) => {
      if (email === 'nonexistent@example.com') {
        return null;
      }
      
      if (email === 'john.doe@example.com') {
        return {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email,
          phone: '123-456-7890',
          company_id: 1,
          position: 'CEO',
          created_at: new Date('2023-01-01T00:00:00Z')
        };
      }
      
      return null;
    });
    
    mockContactRepository.create.mockImplementation((contactData) => ({
      id: 3,
      ...contactData
    }));
    
    mockContactRepository.update.mockImplementation((id, contactData) => ({
      id,
      ...contactData
    }));
    
    mockContactRepository.delete.mockResolvedValue(true);
    
    mockContactRepository.findByCompanyId.mockImplementation((companyId) => {
      if (companyId === 999) {
        return [];
      }
      
      return [
        {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '123-456-7890',
          company_id: companyId,
          position: 'CEO',
          created_at: new Date('2023-01-01T00:00:00Z')
        },
        {
          id: 4,
          first_name: 'Alice',
          last_name: 'Johnson',
          email: 'alice.johnson@example.com',
          phone: '555-123-4567',
          company_id: companyId,
          position: 'CFO',
          created_at: new Date('2023-01-03T00:00:00Z')
        }
      ];
    });
  });

  describe('getAllContacts', () => {
    test('should return all contacts', async () => {
      // Act
      const result = await contactService.getAllContacts();
      
      // Assert
      expect(mockContactRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });
  
  describe('getContactById', () => {
    test('should return contact by ID', async () => {
      // Arrange
      const contactId = 1;
      
      // Act
      const result = await contactService.getContactById(contactId);
      
      // Assert
      expect(mockContactRepository.findById).toHaveBeenCalledWith(contactId);
      expect(result).toEqual({
        id: contactId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        company_id: 1,
        position: 'CEO',
        created_at: expect.any(Date)
      });
    });
    
    test('should throw error when contact is not found', async () => {
      // Arrange
      const contactId = 999;
      
      // Act & Assert
      await expect(contactService.getContactById(contactId)).rejects.toThrow('Contact not found');
      expect(mockContactRepository.findById).toHaveBeenCalledWith(contactId);
    });
  });
  
  describe('getContactByEmail', () => {
    test('should return contact by email', async () => {
      // Arrange
      const email = 'john.doe@example.com';
      
      // Act
      const result = await contactService.getContactByEmail(email);
      
      // Assert
      expect(mockContactRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual({
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email,
        phone: '123-456-7890',
        company_id: 1,
        position: 'CEO',
        created_at: expect.any(Date)
      });
    });
    
    test('should throw error when contact is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      
      // Act & Assert
      await expect(contactService.getContactByEmail(email)).rejects.toThrow('Contact not found');
      expect(mockContactRepository.findByEmail).toHaveBeenCalledWith(email);
    });
  });
  
  describe('createContact', () => {
    test('should create a new contact', async () => {
      // Arrange
      const contactData = {
        first_name: 'New',
        last_name: 'Contact',
        email: 'new.contact@example.com',
        phone: '555-555-5555',
        company_id: 3,
        position: 'Manager'
      };
      
      // Act
      const result = await contactService.createContact(contactData);
      
      // Assert
      expect(mockContactRepository.findByEmail).toHaveBeenCalledWith(contactData.email);
      expect(mockContactRepository.create).toHaveBeenCalledWith({
        ...contactData,
        created_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: 3,
        ...contactData,
        created_at: expect.any(Date)
      });
    });
    
    test('should throw error when email already exists', async () => {
      // Arrange
      const contactData = {
        first_name: 'Duplicate',
        last_name: 'Email',
        email: 'john.doe@example.com',
        phone: '555-555-5555',
        company_id: 3,
        position: 'Manager'
      };
      
      // Act & Assert
      await expect(contactService.createContact(contactData)).rejects.toThrow('Contact with this email already exists');
      expect(mockContactRepository.findByEmail).toHaveBeenCalledWith(contactData.email);
      expect(mockContactRepository.create).not.toHaveBeenCalled();
    });
  });
});
