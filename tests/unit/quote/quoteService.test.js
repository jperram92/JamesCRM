/**
 * Unit tests for quote service - Part 1: Basic CRUD operations
 */

describe('Quote Service - Basic CRUD', () => {
  // Mock dependencies
  const mockQuoteRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };
  
  const mockUserRepository = {
    findById: jest.fn()
  };
  
  const mockCompanyRepository = {
    findById: jest.fn()
  };
  
  const mockContactRepository = {
    findById: jest.fn()
  };
  
  // Mock quote service
  const quoteService = {
    getAllQuotes: async () => {
      return await mockQuoteRepository.findAll();
    },
    
    getQuoteById: async (id) => {
      const quote = await mockQuoteRepository.findById(id);
      
      if (!quote) {
        throw new Error('Quote not found');
      }
      
      return quote;
    },
    
    createQuote: async (quoteData) => {
      const { title, company_id, contact_id, user_id, items, expiry_date } = quoteData;
      
      if (!title || !company_id || !user_id || !items || items.length === 0) {
        throw new Error('Title, company ID, user ID, and at least one item are required');
      }
      
      // Validate company exists
      const company = await mockCompanyRepository.findById(company_id);
      if (!company) {
        throw new Error('Company not found');
      }
      
      // Validate contact exists if provided
      if (contact_id) {
        const contact = await mockContactRepository.findById(contact_id);
        if (!contact) {
          throw new Error('Contact not found');
        }
      }
      
      // Validate user exists
      const user = await mockUserRepository.findById(user_id);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const discount = quoteData.discount || 0;
      const tax = quoteData.tax || 0;
      const total = subtotal - discount + tax;
      
      // Generate quote number
      const quoteNumber = `Q-${Date.now().toString().substr(-6)}`;
      
      return await mockQuoteRepository.create({
        ...quoteData,
        quote_number: quoteNumber,
        subtotal,
        total,
        status: 'draft',
        created_at: new Date()
      });
    },
    
    updateQuote: async (id, quoteData) => {
      const quote = await mockQuoteRepository.findById(id);
      
      if (!quote) {
        throw new Error('Quote not found');
      }
      
      // Validate company exists if changing
      if (quoteData.company_id && quoteData.company_id !== quote.company_id) {
        const company = await mockCompanyRepository.findById(quoteData.company_id);
        if (!company) {
          throw new Error('Company not found');
        }
      }
      
      // Validate contact exists if changing
      if (quoteData.contact_id && quoteData.contact_id !== quote.contact_id) {
        const contact = await mockContactRepository.findById(quoteData.contact_id);
        if (!contact) {
          throw new Error('Contact not found');
        }
      }
      
      // Recalculate totals if items are updated
      let subtotal = quote.subtotal;
      let total = quote.total;
      
      if (quoteData.items) {
        if (quoteData.items.length === 0) {
          throw new Error('At least one item is required');
        }
        
        subtotal = quoteData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        const discount = quoteData.discount !== undefined ? quoteData.discount : quote.discount || 0;
        const tax = quoteData.tax !== undefined ? quoteData.tax : quote.tax || 0;
        total = subtotal - discount + tax;
      }
      
      return await mockQuoteRepository.update(id, {
        ...quoteData,
        subtotal,
        total,
        updated_at: new Date()
      });
    },
    
    deleteQuote: async (id) => {
      const quote = await mockQuoteRepository.findById(id);
      
      if (!quote) {
        throw new Error('Quote not found');
      }
      
      // Cannot delete quotes that are not in draft status
      if (quote.status !== 'draft') {
        throw new Error('Only draft quotes can be deleted');
      }
      
      return await mockQuoteRepository.delete(id);
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockQuoteRepository.findAll.mockResolvedValue([
      {
        id: 1,
        quote_number: 'Q-123456',
        title: 'Website Development',
        company_id: 1,
        contact_id: 1,
        user_id: 1,
        items: [
          { id: 1, description: 'Web Design', quantity: 1, unit_price: 1000 },
          { id: 2, description: 'Web Development', quantity: 1, unit_price: 2000 }
        ],
        subtotal: 3000,
        discount: 0,
        tax: 300,
        total: 3300,
        status: 'draft',
        expiry_date: new Date('2023-02-01'),
        created_at: new Date('2023-01-01'),
        updated_at: null
      },
      {
        id: 2,
        quote_number: 'Q-234567',
        title: 'SEO Services',
        company_id: 2,
        contact_id: 2,
        user_id: 1,
        items: [
          { id: 3, description: 'SEO Audit', quantity: 1, unit_price: 500 },
          { id: 4, description: 'SEO Optimization', quantity: 1, unit_price: 1500 }
        ],
        subtotal: 2000,
        discount: 200,
        tax: 180,
        total: 1980,
        status: 'sent',
        expiry_date: new Date('2023-02-15'),
        created_at: new Date('2023-01-15'),
        updated_at: null
      }
    ]);
    
    mockQuoteRepository.findById.mockImplementation((id) => {
      if (id === 1) {
        return {
          id,
          quote_number: 'Q-123456',
          title: 'Website Development',
          company_id: 1,
          contact_id: 1,
          user_id: 1,
          items: [
            { id: 1, description: 'Web Design', quantity: 1, unit_price: 1000 },
            { id: 2, description: 'Web Development', quantity: 1, unit_price: 2000 }
          ],
          subtotal: 3000,
          discount: 0,
          tax: 300,
          total: 3300,
          status: 'draft',
          expiry_date: new Date('2023-02-01'),
          created_at: new Date('2023-01-01'),
          updated_at: null
        };
      }
      
      if (id === 2) {
        return {
          id,
          quote_number: 'Q-234567',
          title: 'SEO Services',
          company_id: 2,
          contact_id: 2,
          user_id: 1,
          items: [
            { id: 3, description: 'SEO Audit', quantity: 1, unit_price: 500 },
            { id: 4, description: 'SEO Optimization', quantity: 1, unit_price: 1500 }
          ],
          subtotal: 2000,
          discount: 200,
          tax: 180,
          total: 1980,
          status: 'sent',
          expiry_date: new Date('2023-02-15'),
          created_at: new Date('2023-01-15'),
          updated_at: null
        };
      }
      
      return null;
    });
    
    mockQuoteRepository.create.mockImplementation((quoteData) => ({
      id: 3,
      ...quoteData
    }));
    
    mockQuoteRepository.update.mockImplementation((id, quoteData) => ({
      id,
      ...(id === 1 ? {
        quote_number: 'Q-123456',
        title: 'Website Development',
        company_id: 1,
        contact_id: 1,
        user_id: 1,
        items: [
          { id: 1, description: 'Web Design', quantity: 1, unit_price: 1000 },
          { id: 2, description: 'Web Development', quantity: 1, unit_price: 2000 }
        ],
        subtotal: 3000,
        discount: 0,
        tax: 300,
        total: 3300,
        status: 'draft',
        expiry_date: new Date('2023-02-01'),
        created_at: new Date('2023-01-01')
      } : {
        quote_number: 'Q-234567',
        title: 'SEO Services',
        company_id: 2,
        contact_id: 2,
        user_id: 1,
        items: [
          { id: 3, description: 'SEO Audit', quantity: 1, unit_price: 500 },
          { id: 4, description: 'SEO Optimization', quantity: 1, unit_price: 1500 }
        ],
        subtotal: 2000,
        discount: 200,
        tax: 180,
        total: 1980,
        status: 'sent',
        expiry_date: new Date('2023-02-15'),
        created_at: new Date('2023-01-15')
      }),
      ...quoteData,
      updated_at: expect.any(Date)
    }));
    
    mockQuoteRepository.delete.mockResolvedValue(true);
    
    mockUserRepository.findById.mockImplementation((id) => {
      if (id === 1) {
        return { id, name: 'John Doe' };
      }
      return null;
    });
    
    mockCompanyRepository.findById.mockImplementation((id) => {
      if (id === 1) {
        return { id, name: 'Acme Inc.' };
      }
      if (id === 2) {
        return { id, name: 'Beta Corp' };
      }
      return null;
    });
    
    mockContactRepository.findById.mockImplementation((id) => {
      if (id === 1) {
        return { id, name: 'Jane Smith', company_id: 1 };
      }
      if (id === 2) {
        return { id, name: 'Bob Johnson', company_id: 2 };
      }
      return null;
    });
  });

  describe('getAllQuotes', () => {
    test('should return all quotes', async () => {
      // Act
      const result = await quoteService.getAllQuotes();
      
      // Assert
      expect(mockQuoteRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });
  
  describe('getQuoteById', () => {
    test('should return quote by ID', async () => {
      // Arrange
      const quoteId = 1;
      
      // Act
      const result = await quoteService.getQuoteById(quoteId);
      
      // Assert
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(result).toEqual({
        id: quoteId,
        quote_number: 'Q-123456',
        title: 'Website Development',
        company_id: 1,
        contact_id: 1,
        user_id: 1,
        items: [
          { id: 1, description: 'Web Design', quantity: 1, unit_price: 1000 },
          { id: 2, description: 'Web Development', quantity: 1, unit_price: 2000 }
        ],
        subtotal: 3000,
        discount: 0,
        tax: 300,
        total: 3300,
        status: 'draft',
        expiry_date: expect.any(Date),
        created_at: expect.any(Date),
        updated_at: null
      });
    });
    
    test('should throw error when quote is not found', async () => {
      // Arrange
      const quoteId = 999;
      
      // Act & Assert
      await expect(quoteService.getQuoteById(quoteId))
        .rejects.toThrow('Quote not found');
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
    });
  });
  
  describe('createQuote', () => {
    test('should create a new quote', async () => {
      // Arrange
      const quoteData = {
        title: 'Mobile App Development',
        company_id: 1,
        contact_id: 1,
        user_id: 1,
        items: [
          { description: 'UI Design', quantity: 1, unit_price: 1500 },
          { description: 'App Development', quantity: 1, unit_price: 3000 }
        ],
        discount: 500,
        tax: 400,
        expiry_date: new Date('2023-03-01')
      };
      
      // Act
      const result = await quoteService.createQuote(quoteData);
      
      // Assert
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(quoteData.company_id);
      expect(mockContactRepository.findById).toHaveBeenCalledWith(quoteData.contact_id);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(quoteData.user_id);
      
      expect(mockQuoteRepository.create).toHaveBeenCalledWith({
        ...quoteData,
        quote_number: expect.stringMatching(/^Q-\d{6}$/),
        subtotal: 4500,
        total: 4400,
        status: 'draft',
        created_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: 3,
        ...quoteData,
        quote_number: expect.stringMatching(/^Q-\d{6}$/),
        subtotal: 4500,
        total: 4400,
        status: 'draft',
        created_at: expect.any(Date)
      });
    });
    
    test('should throw error when required fields are missing', async () => {
      // Arrange
      const incompleteData = {
        title: 'Mobile App Development',
        // Missing company_id
        user_id: 1,
        items: [
          { description: 'UI Design', quantity: 1, unit_price: 1500 }
        ]
      };
      
      // Act & Assert
      await expect(quoteService.createQuote(incompleteData))
        .rejects.toThrow('Title, company ID, user ID, and at least one item are required');
      expect(mockQuoteRepository.create).not.toHaveBeenCalled();
    });
    
    test('should throw error when company is not found', async () => {
      // Arrange
      const quoteData = {
        title: 'Mobile App Development',
        company_id: 999, // Non-existent company
        user_id: 1,
        items: [
          { description: 'UI Design', quantity: 1, unit_price: 1500 }
        ]
      };
      
      // Act & Assert
      await expect(quoteService.createQuote(quoteData))
        .rejects.toThrow('Company not found');
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(quoteData.company_id);
      expect(mockQuoteRepository.create).not.toHaveBeenCalled();
    });
    
    test('should throw error when contact is not found', async () => {
      // Arrange
      const quoteData = {
        title: 'Mobile App Development',
        company_id: 1,
        contact_id: 999, // Non-existent contact
        user_id: 1,
        items: [
          { description: 'UI Design', quantity: 1, unit_price: 1500 }
        ]
      };
      
      // Act & Assert
      await expect(quoteService.createQuote(quoteData))
        .rejects.toThrow('Contact not found');
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(quoteData.company_id);
      expect(mockContactRepository.findById).toHaveBeenCalledWith(quoteData.contact_id);
      expect(mockQuoteRepository.create).not.toHaveBeenCalled();
    });
    
    test('should throw error when user is not found', async () => {
      // Arrange
      const quoteData = {
        title: 'Mobile App Development',
        company_id: 1,
        user_id: 999, // Non-existent user
        items: [
          { description: 'UI Design', quantity: 1, unit_price: 1500 }
        ]
      };
      
      // Act & Assert
      await expect(quoteService.createQuote(quoteData))
        .rejects.toThrow('User not found');
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(quoteData.company_id);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(quoteData.user_id);
      expect(mockQuoteRepository.create).not.toHaveBeenCalled();
    });
  });
  
  describe('updateQuote', () => {
    test('should update an existing quote', async () => {
      // Arrange
      const quoteId = 1;
      const updateData = {
        title: 'Updated Website Development',
        items: [
          { id: 1, description: 'Web Design', quantity: 1, unit_price: 1200 },
          { id: 2, description: 'Web Development', quantity: 1, unit_price: 2200 }
        ],
        discount: 300,
        tax: 310
      };
      
      // Act
      const result = await quoteService.updateQuote(quoteId, updateData);
      
      // Assert
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(mockQuoteRepository.update).toHaveBeenCalledWith(quoteId, {
        ...updateData,
        subtotal: 3400,
        total: 3410,
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: quoteId,
        quote_number: 'Q-123456',
        title: 'Updated Website Development',
        company_id: 1,
        contact_id: 1,
        user_id: 1,
        items: [
          { id: 1, description: 'Web Design', quantity: 1, unit_price: 1200 },
          { id: 2, description: 'Web Development', quantity: 1, unit_price: 2200 }
        ],
        subtotal: 3400,
        discount: 300,
        tax: 310,
        total: 3410,
        status: 'draft',
        expiry_date: expect.any(Date),
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
    
    test('should throw error when quote is not found', async () => {
      // Arrange
      const quoteId = 999;
      const updateData = {
        title: 'Updated Quote'
      };
      
      // Act & Assert
      await expect(quoteService.updateQuote(quoteId, updateData))
        .rejects.toThrow('Quote not found');
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(mockQuoteRepository.update).not.toHaveBeenCalled();
    });
    
    test('should throw error when company is not found', async () => {
      // Arrange
      const quoteId = 1;
      const updateData = {
        company_id: 999 // Non-existent company
      };
      
      // Act & Assert
      await expect(quoteService.updateQuote(quoteId, updateData))
        .rejects.toThrow('Company not found');
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(updateData.company_id);
      expect(mockQuoteRepository.update).not.toHaveBeenCalled();
    });
    
    test('should throw error when contact is not found', async () => {
      // Arrange
      const quoteId = 1;
      const updateData = {
        contact_id: 999 // Non-existent contact
      };
      
      // Act & Assert
      await expect(quoteService.updateQuote(quoteId, updateData))
        .rejects.toThrow('Contact not found');
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(mockContactRepository.findById).toHaveBeenCalledWith(updateData.contact_id);
      expect(mockQuoteRepository.update).not.toHaveBeenCalled();
    });
    
    test('should throw error when items array is empty', async () => {
      // Arrange
      const quoteId = 1;
      const updateData = {
        items: [] // Empty items array
      };
      
      // Act & Assert
      await expect(quoteService.updateQuote(quoteId, updateData))
        .rejects.toThrow('At least one item is required');
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(mockQuoteRepository.update).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteQuote', () => {
    test('should delete a draft quote', async () => {
      // Arrange
      const quoteId = 1; // Draft quote
      
      // Act
      const result = await quoteService.deleteQuote(quoteId);
      
      // Assert
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(mockQuoteRepository.delete).toHaveBeenCalledWith(quoteId);
      expect(result).toBe(true);
    });
    
    test('should throw error when quote is not found', async () => {
      // Arrange
      const quoteId = 999;
      
      // Act & Assert
      await expect(quoteService.deleteQuote(quoteId))
        .rejects.toThrow('Quote not found');
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(mockQuoteRepository.delete).not.toHaveBeenCalled();
    });
    
    test('should throw error when quote is not in draft status', async () => {
      // Arrange
      const quoteId = 2; // Sent quote
      
      // Act & Assert
      await expect(quoteService.deleteQuote(quoteId))
        .rejects.toThrow('Only draft quotes can be deleted');
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(mockQuoteRepository.delete).not.toHaveBeenCalled();
    });
  });
});
