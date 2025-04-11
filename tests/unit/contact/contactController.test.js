/**
 * Unit tests for contact controller
 */

describe('Contact Controller', () => {
  // Mock dependencies
  const mockContactService = {
    getAllContacts: jest.fn(),
    getContactById: jest.fn(),
    createContact: jest.fn(),
    updateContact: jest.fn(),
    deleteContact: jest.fn(),
    getContactsByCompany: jest.fn(),
    searchContacts: jest.fn()
  };
  
  // Mock request and response
  let req;
  let res;
  
  // Mock contact controller
  const contactController = {
    getAllContacts: async (req, res) => {
      try {
        const contacts = await mockContactService.getAllContacts();
        res.json(contacts);
      } catch (error) {
        res.status(500).json({ message: 'Server error while fetching contacts' });
      }
    },
    
    getContactById: async (req, res) => {
      try {
        const contact = await mockContactService.getContactById(req.params.id);
        res.json(contact);
      } catch (error) {
        if (error.message === 'Contact not found') {
          res.status(404).json({ message: 'Contact not found' });
        } else {
          res.status(500).json({ message: 'Server error while fetching contact' });
        }
      }
    },
    
    createContact: async (req, res) => {
      try {
        const contact = await mockContactService.createContact(req.body);
        res.status(201).json(contact);
      } catch (error) {
        if (error.message.includes('already exists')) {
          res.status(400).json({ message: error.message });
        } else {
          res.status(500).json({ message: 'Server error while creating contact' });
        }
      }
    },
    
    updateContact: async (req, res) => {
      try {
        const contact = await mockContactService.updateContact(req.params.id, req.body);
        res.json(contact);
      } catch (error) {
        if (error.message === 'Contact not found') {
          res.status(404).json({ message: 'Contact not found' });
        } else if (error.message.includes('already exists')) {
          res.status(400).json({ message: error.message });
        } else {
          res.status(500).json({ message: 'Server error while updating contact' });
        }
      }
    },
    
    deleteContact: async (req, res) => {
      try {
        await mockContactService.deleteContact(req.params.id);
        res.json({ message: 'Contact deleted successfully' });
      } catch (error) {
        if (error.message === 'Contact not found') {
          res.status(404).json({ message: 'Contact not found' });
        } else {
          res.status(500).json({ message: 'Server error while deleting contact' });
        }
      }
    },
    
    getContactsByCompany: async (req, res) => {
      try {
        const contacts = await mockContactService.getContactsByCompany(req.params.companyId);
        res.json(contacts);
      } catch (error) {
        res.status(500).json({ message: 'Server error while fetching contacts by company' });
      }
    },
    
    searchContacts: async (req, res) => {
      try {
        const contacts = await mockContactService.searchContacts(req.query.q);
        res.json(contacts);
      } catch (error) {
        res.status(500).json({ message: 'Server error while searching contacts' });
      }
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockContactService.getAllContacts.mockReset();
    mockContactService.getContactById.mockReset();
    mockContactService.createContact.mockReset();
    mockContactService.updateContact.mockReset();
    mockContactService.deleteContact.mockReset();
    mockContactService.getContactsByCompany.mockReset();
    mockContactService.searchContacts.mockReset();
    
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

  describe('getAllContacts', () => {
    test('should return all contacts', async () => {
      // Arrange
      const mockContacts = [
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com' },
        { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com' }
      ];
      mockContactService.getAllContacts.mockResolvedValue(mockContacts);
      
      // Act
      await contactController.getAllContacts(req, res);
      
      // Assert
      expect(mockContactService.getAllContacts).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockContacts);
    });
    
    test('should handle errors', async () => {
      // Arrange
      mockContactService.getAllContacts.mockRejectedValue(new Error('Database error'));
      
      // Act
      await contactController.getAllContacts(req, res);
      
      // Assert
      expect(mockContactService.getAllContacts).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching contacts' });
    });
  });
  
  describe('getContactById', () => {
    test('should return a contact when a valid ID is provided', async () => {
      // Arrange
      const contactId = '1';
      const mockContact = { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com' };
      req.params.id = contactId;
      mockContactService.getContactById.mockResolvedValue(mockContact);
      
      // Act
      await contactController.getContactById(req, res);
      
      // Assert
      expect(mockContactService.getContactById).toHaveBeenCalledWith(contactId);
      expect(res.json).toHaveBeenCalledWith(mockContact);
    });
    
    test('should return 404 when contact is not found', async () => {
      // Arrange
      const contactId = '999';
      req.params.id = contactId;
      mockContactService.getContactById.mockRejectedValue(new Error('Contact not found'));
      
      // Act
      await contactController.getContactById(req, res);
      
      // Assert
      expect(mockContactService.getContactById).toHaveBeenCalledWith(contactId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Contact not found' });
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const contactId = '1';
      req.params.id = contactId;
      mockContactService.getContactById.mockRejectedValue(new Error('Database error'));
      
      // Act
      await contactController.getContactById(req, res);
      
      // Assert
      expect(mockContactService.getContactById).toHaveBeenCalledWith(contactId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching contact' });
    });
  });
  
  describe('createContact', () => {
    test('should create a new contact', async () => {
      // Arrange
      const contactData = {
        first_name: 'New',
        last_name: 'Contact',
        email: 'new.contact@example.com',
        phone: '123-456-7890',
        company_id: 1
      };
      const newContact = { id: 3, ...contactData };
      req.body = contactData;
      mockContactService.createContact.mockResolvedValue(newContact);
      
      // Act
      await contactController.createContact(req, res);
      
      // Assert
      expect(mockContactService.createContact).toHaveBeenCalledWith(contactData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newContact);
    });
    
    test('should return 400 when email already exists', async () => {
      // Arrange
      const contactData = {
        first_name: 'New',
        last_name: 'Contact',
        email: 'existing.email@example.com',
        phone: '123-456-7890',
        company_id: 1
      };
      req.body = contactData;
      mockContactService.createContact.mockRejectedValue(new Error('Contact with email existing.email@example.com already exists'));
      
      // Act
      await contactController.createContact(req, res);
      
      // Assert
      expect(mockContactService.createContact).toHaveBeenCalledWith(contactData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Contact with email existing.email@example.com already exists' });
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const contactData = {
        first_name: 'New',
        last_name: 'Contact',
        email: 'new.contact@example.com',
        phone: '123-456-7890',
        company_id: 1
      };
      req.body = contactData;
      mockContactService.createContact.mockRejectedValue(new Error('Database error'));
      
      // Act
      await contactController.createContact(req, res);
      
      // Assert
      expect(mockContactService.createContact).toHaveBeenCalledWith(contactData);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while creating contact' });
    });
  });
  
  describe('updateContact', () => {
    test('should update an existing contact', async () => {
      // Arrange
      const contactId = '1';
      const contactData = {
        first_name: 'Updated',
        last_name: 'Contact',
        email: 'updated.contact@example.com'
      };
      const updatedContact = { id: 1, ...contactData };
      req.params.id = contactId;
      req.body = contactData;
      mockContactService.updateContact.mockResolvedValue(updatedContact);
      
      // Act
      await contactController.updateContact(req, res);
      
      // Assert
      expect(mockContactService.updateContact).toHaveBeenCalledWith(contactId, contactData);
      expect(res.json).toHaveBeenCalledWith(updatedContact);
    });
    
    test('should return 404 when contact is not found', async () => {
      // Arrange
      const contactId = '999';
      const contactData = { first_name: 'Updated' };
      req.params.id = contactId;
      req.body = contactData;
      mockContactService.updateContact.mockRejectedValue(new Error('Contact not found'));
      
      // Act
      await contactController.updateContact(req, res);
      
      // Assert
      expect(mockContactService.updateContact).toHaveBeenCalledWith(contactId, contactData);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Contact not found' });
    });
    
    test('should return 400 when email already exists', async () => {
      // Arrange
      const contactId = '1';
      const contactData = { email: 'existing.email@example.com' };
      req.params.id = contactId;
      req.body = contactData;
      mockContactService.updateContact.mockRejectedValue(new Error('Contact with email existing.email@example.com already exists'));
      
      // Act
      await contactController.updateContact(req, res);
      
      // Assert
      expect(mockContactService.updateContact).toHaveBeenCalledWith(contactId, contactData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Contact with email existing.email@example.com already exists' });
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const contactId = '1';
      const contactData = { first_name: 'Updated' };
      req.params.id = contactId;
      req.body = contactData;
      mockContactService.updateContact.mockRejectedValue(new Error('Database error'));
      
      // Act
      await contactController.updateContact(req, res);
      
      // Assert
      expect(mockContactService.updateContact).toHaveBeenCalledWith(contactId, contactData);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while updating contact' });
    });
  });
  
  describe('deleteContact', () => {
    test('should delete an existing contact', async () => {
      // Arrange
      const contactId = '1';
      req.params.id = contactId;
      mockContactService.deleteContact.mockResolvedValue(true);
      
      // Act
      await contactController.deleteContact(req, res);
      
      // Assert
      expect(mockContactService.deleteContact).toHaveBeenCalledWith(contactId);
      expect(res.json).toHaveBeenCalledWith({ message: 'Contact deleted successfully' });
    });
    
    test('should return 404 when contact is not found', async () => {
      // Arrange
      const contactId = '999';
      req.params.id = contactId;
      mockContactService.deleteContact.mockRejectedValue(new Error('Contact not found'));
      
      // Act
      await contactController.deleteContact(req, res);
      
      // Assert
      expect(mockContactService.deleteContact).toHaveBeenCalledWith(contactId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Contact not found' });
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const contactId = '1';
      req.params.id = contactId;
      mockContactService.deleteContact.mockRejectedValue(new Error('Database error'));
      
      // Act
      await contactController.deleteContact(req, res);
      
      // Assert
      expect(mockContactService.deleteContact).toHaveBeenCalledWith(contactId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while deleting contact' });
    });
  });
  
  describe('getContactsByCompany', () => {
    test('should return contacts for a company', async () => {
      // Arrange
      const companyId = '1';
      const mockContacts = [
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', company_id: 1 },
        { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', company_id: 1 }
      ];
      req.params.companyId = companyId;
      mockContactService.getContactsByCompany.mockResolvedValue(mockContacts);
      
      // Act
      await contactController.getContactsByCompany(req, res);
      
      // Assert
      expect(mockContactService.getContactsByCompany).toHaveBeenCalledWith(companyId);
      expect(res.json).toHaveBeenCalledWith(mockContacts);
    });
    
    test('should return empty array when company has no contacts', async () => {
      // Arrange
      const companyId = '999';
      req.params.companyId = companyId;
      mockContactService.getContactsByCompany.mockResolvedValue([]);
      
      // Act
      await contactController.getContactsByCompany(req, res);
      
      // Assert
      expect(mockContactService.getContactsByCompany).toHaveBeenCalledWith(companyId);
      expect(res.json).toHaveBeenCalledWith([]);
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const companyId = '1';
      req.params.companyId = companyId;
      mockContactService.getContactsByCompany.mockRejectedValue(new Error('Database error'));
      
      // Act
      await contactController.getContactsByCompany(req, res);
      
      // Assert
      expect(mockContactService.getContactsByCompany).toHaveBeenCalledWith(companyId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching contacts by company' });
    });
  });
  
  describe('searchContacts', () => {
    test('should search contacts by query', async () => {
      // Arrange
      const searchQuery = 'john';
      const mockContacts = [
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com' }
      ];
      req.query.q = searchQuery;
      mockContactService.searchContacts.mockResolvedValue(mockContacts);
      
      // Act
      await contactController.searchContacts(req, res);
      
      // Assert
      expect(mockContactService.searchContacts).toHaveBeenCalledWith(searchQuery);
      expect(res.json).toHaveBeenCalledWith(mockContacts);
    });
    
    test('should handle empty search query', async () => {
      // Arrange
      const mockContacts = [
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com' },
        { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com' }
      ];
      req.query.q = '';
      mockContactService.searchContacts.mockResolvedValue(mockContacts);
      
      // Act
      await contactController.searchContacts(req, res);
      
      // Assert
      expect(mockContactService.searchContacts).toHaveBeenCalledWith('');
      expect(res.json).toHaveBeenCalledWith(mockContacts);
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const searchQuery = 'john';
      req.query.q = searchQuery;
      mockContactService.searchContacts.mockRejectedValue(new Error('Database error'));
      
      // Act
      await contactController.searchContacts(req, res);
      
      // Assert
      expect(mockContactService.searchContacts).toHaveBeenCalledWith(searchQuery);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while searching contacts' });
    });
  });
});
