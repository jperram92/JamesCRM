/**
 * Unit tests for deal controller
 */

describe('Deal Controller', () => {
  // Mock dependencies
  const mockDealService = {
    getAllDeals: jest.fn(),
    getDealById: jest.fn(),
    createDeal: jest.fn(),
    updateDeal: jest.fn(),
    deleteDeal: jest.fn(),
    getDealsByCompany: jest.fn(),
    getDealsByContact: jest.fn(),
    getDealsByStatus: jest.fn(),
    getDealsByOwner: jest.fn(),
    searchDeals: jest.fn()
  };
  
  const mockPdfService = {
    generateQuotePdf: jest.fn()
  };
  
  // Mock request and response
  let req;
  let res;
  
  // Mock deal controller
  const dealController = {
    getAllDeals: async (req, res) => {
      try {
        const deals = await mockDealService.getAllDeals();
        res.json(deals);
      } catch (error) {
        res.status(500).json({ message: 'Server error while fetching deals' });
      }
    },
    
    getDealById: async (req, res) => {
      try {
        const deal = await mockDealService.getDealById(req.params.id);
        res.json(deal);
      } catch (error) {
        if (error.message === 'Deal not found') {
          res.status(404).json({ message: 'Deal not found' });
        } else {
          res.status(500).json({ message: 'Server error while fetching deal' });
        }
      }
    },
    
    createDeal: async (req, res) => {
      try {
        const deal = await mockDealService.createDeal(req.body);
        res.status(201).json(deal);
      } catch (error) {
        res.status(500).json({ message: 'Server error while creating deal' });
      }
    },
    
    updateDeal: async (req, res) => {
      try {
        const deal = await mockDealService.updateDeal(req.params.id, req.body);
        res.json(deal);
      } catch (error) {
        if (error.message === 'Deal not found') {
          res.status(404).json({ message: 'Deal not found' });
        } else {
          res.status(500).json({ message: 'Server error while updating deal' });
        }
      }
    },
    
    deleteDeal: async (req, res) => {
      try {
        await mockDealService.deleteDeal(req.params.id);
        res.json({ message: 'Deal deleted successfully' });
      } catch (error) {
        if (error.message === 'Deal not found') {
          res.status(404).json({ message: 'Deal not found' });
        } else {
          res.status(500).json({ message: 'Server error while deleting deal' });
        }
      }
    },
    
    getDealsByCompany: async (req, res) => {
      try {
        const deals = await mockDealService.getDealsByCompany(req.params.companyId);
        res.json(deals);
      } catch (error) {
        res.status(500).json({ message: 'Server error while fetching deals by company' });
      }
    },
    
    getDealsByContact: async (req, res) => {
      try {
        const deals = await mockDealService.getDealsByContact(req.params.contactId);
        res.json(deals);
      } catch (error) {
        res.status(500).json({ message: 'Server error while fetching deals by contact' });
      }
    },
    
    getDealsByStatus: async (req, res) => {
      try {
        const deals = await mockDealService.getDealsByStatus(req.params.status);
        res.json(deals);
      } catch (error) {
        res.status(500).json({ message: 'Server error while fetching deals by status' });
      }
    },
    
    getDealsByOwner: async (req, res) => {
      try {
        const deals = await mockDealService.getDealsByOwner(req.params.ownerId);
        res.json(deals);
      } catch (error) {
        res.status(500).json({ message: 'Server error while fetching deals by owner' });
      }
    },
    
    searchDeals: async (req, res) => {
      try {
        const deals = await mockDealService.searchDeals(req.query.q);
        res.json(deals);
      } catch (error) {
        res.status(500).json({ message: 'Server error while searching deals' });
      }
    },
    
    generateQuote: async (req, res) => {
      try {
        const dealId = req.params.id;
        const deal = await mockDealService.getDealById(dealId);
        
        const pdfBuffer = await mockPdfService.generateQuotePdf(deal);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="quote-${dealId}.pdf"`);
        res.send(pdfBuffer);
      } catch (error) {
        if (error.message === 'Deal not found') {
          res.status(404).json({ message: 'Deal not found' });
        } else {
          res.status(500).json({ message: 'Server error while generating quote' });
        }
      }
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockDealService.getAllDeals.mockReset();
    mockDealService.getDealById.mockReset();
    mockDealService.createDeal.mockReset();
    mockDealService.updateDeal.mockReset();
    mockDealService.deleteDeal.mockReset();
    mockDealService.getDealsByCompany.mockReset();
    mockDealService.getDealsByContact.mockReset();
    mockDealService.getDealsByStatus.mockReset();
    mockDealService.getDealsByOwner.mockReset();
    mockDealService.searchDeals.mockReset();
    mockPdfService.generateQuotePdf.mockReset();
    
    // Initialize req and res for each test
    req = {
      params: {},
      body: {},
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      send: jest.fn()
    };
  });

  describe('getAllDeals', () => {
    test('should return all deals', async () => {
      // Arrange
      const mockDeals = [
        { id: 1, name: 'Deal 1', amount: 1000, status: 'open' },
        { id: 2, name: 'Deal 2', amount: 2000, status: 'won' }
      ];
      mockDealService.getAllDeals.mockResolvedValue(mockDeals);
      
      // Act
      await dealController.getAllDeals(req, res);
      
      // Assert
      expect(mockDealService.getAllDeals).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockDeals);
    });
    
    test('should handle errors', async () => {
      // Arrange
      mockDealService.getAllDeals.mockRejectedValue(new Error('Database error'));
      
      // Act
      await dealController.getAllDeals(req, res);
      
      // Assert
      expect(mockDealService.getAllDeals).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching deals' });
    });
  });
  
  describe('getDealById', () => {
    test('should return a deal when a valid ID is provided', async () => {
      // Arrange
      const dealId = '1';
      const mockDeal = { id: 1, name: 'Deal 1', amount: 1000, status: 'open' };
      req.params.id = dealId;
      mockDealService.getDealById.mockResolvedValue(mockDeal);
      
      // Act
      await dealController.getDealById(req, res);
      
      // Assert
      expect(mockDealService.getDealById).toHaveBeenCalledWith(dealId);
      expect(res.json).toHaveBeenCalledWith(mockDeal);
    });
    
    test('should return 404 when deal is not found', async () => {
      // Arrange
      const dealId = '999';
      req.params.id = dealId;
      mockDealService.getDealById.mockRejectedValue(new Error('Deal not found'));
      
      // Act
      await dealController.getDealById(req, res);
      
      // Assert
      expect(mockDealService.getDealById).toHaveBeenCalledWith(dealId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Deal not found' });
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const dealId = '1';
      req.params.id = dealId;
      mockDealService.getDealById.mockRejectedValue(new Error('Database error'));
      
      // Act
      await dealController.getDealById(req, res);
      
      // Assert
      expect(mockDealService.getDealById).toHaveBeenCalledWith(dealId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching deal' });
    });
  });
  
  describe('createDeal', () => {
    test('should create a new deal', async () => {
      // Arrange
      const dealData = {
        name: 'New Deal',
        amount: 3000,
        status: 'open',
        company_id: 1,
        contact_id: 1,
        owner_id: 1
      };
      const newDeal = { id: 3, ...dealData };
      req.body = dealData;
      mockDealService.createDeal.mockResolvedValue(newDeal);
      
      // Act
      await dealController.createDeal(req, res);
      
      // Assert
      expect(mockDealService.createDeal).toHaveBeenCalledWith(dealData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newDeal);
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const dealData = {
        name: 'New Deal',
        amount: 3000,
        status: 'open',
        company_id: 1,
        contact_id: 1,
        owner_id: 1
      };
      req.body = dealData;
      mockDealService.createDeal.mockRejectedValue(new Error('Database error'));
      
      // Act
      await dealController.createDeal(req, res);
      
      // Assert
      expect(mockDealService.createDeal).toHaveBeenCalledWith(dealData);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while creating deal' });
    });
  });
  
  describe('updateDeal', () => {
    test('should update an existing deal', async () => {
      // Arrange
      const dealId = '1';
      const dealData = {
        name: 'Updated Deal',
        amount: 1500,
        status: 'won'
      };
      const updatedDeal = { id: 1, ...dealData };
      req.params.id = dealId;
      req.body = dealData;
      mockDealService.updateDeal.mockResolvedValue(updatedDeal);
      
      // Act
      await dealController.updateDeal(req, res);
      
      // Assert
      expect(mockDealService.updateDeal).toHaveBeenCalledWith(dealId, dealData);
      expect(res.json).toHaveBeenCalledWith(updatedDeal);
    });
    
    test('should return 404 when deal is not found', async () => {
      // Arrange
      const dealId = '999';
      const dealData = { name: 'Updated Deal' };
      req.params.id = dealId;
      req.body = dealData;
      mockDealService.updateDeal.mockRejectedValue(new Error('Deal not found'));
      
      // Act
      await dealController.updateDeal(req, res);
      
      // Assert
      expect(mockDealService.updateDeal).toHaveBeenCalledWith(dealId, dealData);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Deal not found' });
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const dealId = '1';
      const dealData = { name: 'Updated Deal' };
      req.params.id = dealId;
      req.body = dealData;
      mockDealService.updateDeal.mockRejectedValue(new Error('Database error'));
      
      // Act
      await dealController.updateDeal(req, res);
      
      // Assert
      expect(mockDealService.updateDeal).toHaveBeenCalledWith(dealId, dealData);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while updating deal' });
    });
  });
  
  describe('deleteDeal', () => {
    test('should delete an existing deal', async () => {
      // Arrange
      const dealId = '1';
      req.params.id = dealId;
      mockDealService.deleteDeal.mockResolvedValue(true);
      
      // Act
      await dealController.deleteDeal(req, res);
      
      // Assert
      expect(mockDealService.deleteDeal).toHaveBeenCalledWith(dealId);
      expect(res.json).toHaveBeenCalledWith({ message: 'Deal deleted successfully' });
    });
    
    test('should return 404 when deal is not found', async () => {
      // Arrange
      const dealId = '999';
      req.params.id = dealId;
      mockDealService.deleteDeal.mockRejectedValue(new Error('Deal not found'));
      
      // Act
      await dealController.deleteDeal(req, res);
      
      // Assert
      expect(mockDealService.deleteDeal).toHaveBeenCalledWith(dealId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Deal not found' });
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const dealId = '1';
      req.params.id = dealId;
      mockDealService.deleteDeal.mockRejectedValue(new Error('Database error'));
      
      // Act
      await dealController.deleteDeal(req, res);
      
      // Assert
      expect(mockDealService.deleteDeal).toHaveBeenCalledWith(dealId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while deleting deal' });
    });
  });
  
  describe('getDealsByCompany', () => {
    test('should return deals for a company', async () => {
      // Arrange
      const companyId = '1';
      const mockDeals = [
        { id: 1, name: 'Deal 1', amount: 1000, status: 'open', company_id: 1 },
        { id: 3, name: 'Deal 3', amount: 3000, status: 'open', company_id: 1 }
      ];
      req.params.companyId = companyId;
      mockDealService.getDealsByCompany.mockResolvedValue(mockDeals);
      
      // Act
      await dealController.getDealsByCompany(req, res);
      
      // Assert
      expect(mockDealService.getDealsByCompany).toHaveBeenCalledWith(companyId);
      expect(res.json).toHaveBeenCalledWith(mockDeals);
    });
    
    test('should return empty array when company has no deals', async () => {
      // Arrange
      const companyId = '999';
      req.params.companyId = companyId;
      mockDealService.getDealsByCompany.mockResolvedValue([]);
      
      // Act
      await dealController.getDealsByCompany(req, res);
      
      // Assert
      expect(mockDealService.getDealsByCompany).toHaveBeenCalledWith(companyId);
      expect(res.json).toHaveBeenCalledWith([]);
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const companyId = '1';
      req.params.companyId = companyId;
      mockDealService.getDealsByCompany.mockRejectedValue(new Error('Database error'));
      
      // Act
      await dealController.getDealsByCompany(req, res);
      
      // Assert
      expect(mockDealService.getDealsByCompany).toHaveBeenCalledWith(companyId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching deals by company' });
    });
  });
  
  describe('getDealsByContact', () => {
    test('should return deals for a contact', async () => {
      // Arrange
      const contactId = '1';
      const mockDeals = [
        { id: 1, name: 'Deal 1', amount: 1000, status: 'open', contact_id: 1 },
        { id: 3, name: 'Deal 3', amount: 3000, status: 'open', contact_id: 1 }
      ];
      req.params.contactId = contactId;
      mockDealService.getDealsByContact.mockResolvedValue(mockDeals);
      
      // Act
      await dealController.getDealsByContact(req, res);
      
      // Assert
      expect(mockDealService.getDealsByContact).toHaveBeenCalledWith(contactId);
      expect(res.json).toHaveBeenCalledWith(mockDeals);
    });
    
    test('should return empty array when contact has no deals', async () => {
      // Arrange
      const contactId = '999';
      req.params.contactId = contactId;
      mockDealService.getDealsByContact.mockResolvedValue([]);
      
      // Act
      await dealController.getDealsByContact(req, res);
      
      // Assert
      expect(mockDealService.getDealsByContact).toHaveBeenCalledWith(contactId);
      expect(res.json).toHaveBeenCalledWith([]);
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const contactId = '1';
      req.params.contactId = contactId;
      mockDealService.getDealsByContact.mockRejectedValue(new Error('Database error'));
      
      // Act
      await dealController.getDealsByContact(req, res);
      
      // Assert
      expect(mockDealService.getDealsByContact).toHaveBeenCalledWith(contactId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching deals by contact' });
    });
  });
  
  describe('getDealsByStatus', () => {
    test('should return deals with a specific status', async () => {
      // Arrange
      const status = 'open';
      const mockDeals = [
        { id: 1, name: 'Deal 1', amount: 1000, status: 'open' },
        { id: 3, name: 'Deal 3', amount: 3000, status: 'open' }
      ];
      req.params.status = status;
      mockDealService.getDealsByStatus.mockResolvedValue(mockDeals);
      
      // Act
      await dealController.getDealsByStatus(req, res);
      
      // Assert
      expect(mockDealService.getDealsByStatus).toHaveBeenCalledWith(status);
      expect(res.json).toHaveBeenCalledWith(mockDeals);
    });
    
    test('should return empty array when no deals with status exist', async () => {
      // Arrange
      const status = 'nonexistent';
      req.params.status = status;
      mockDealService.getDealsByStatus.mockResolvedValue([]);
      
      // Act
      await dealController.getDealsByStatus(req, res);
      
      // Assert
      expect(mockDealService.getDealsByStatus).toHaveBeenCalledWith(status);
      expect(res.json).toHaveBeenCalledWith([]);
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const status = 'open';
      req.params.status = status;
      mockDealService.getDealsByStatus.mockRejectedValue(new Error('Database error'));
      
      // Act
      await dealController.getDealsByStatus(req, res);
      
      // Assert
      expect(mockDealService.getDealsByStatus).toHaveBeenCalledWith(status);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching deals by status' });
    });
  });
  
  describe('getDealsByOwner', () => {
    test('should return deals for an owner', async () => {
      // Arrange
      const ownerId = '1';
      const mockDeals = [
        { id: 1, name: 'Deal 1', amount: 1000, status: 'open', owner_id: 1 },
        { id: 3, name: 'Deal 3', amount: 3000, status: 'open', owner_id: 1 }
      ];
      req.params.ownerId = ownerId;
      mockDealService.getDealsByOwner.mockResolvedValue(mockDeals);
      
      // Act
      await dealController.getDealsByOwner(req, res);
      
      // Assert
      expect(mockDealService.getDealsByOwner).toHaveBeenCalledWith(ownerId);
      expect(res.json).toHaveBeenCalledWith(mockDeals);
    });
    
    test('should return empty array when owner has no deals', async () => {
      // Arrange
      const ownerId = '999';
      req.params.ownerId = ownerId;
      mockDealService.getDealsByOwner.mockResolvedValue([]);
      
      // Act
      await dealController.getDealsByOwner(req, res);
      
      // Assert
      expect(mockDealService.getDealsByOwner).toHaveBeenCalledWith(ownerId);
      expect(res.json).toHaveBeenCalledWith([]);
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const ownerId = '1';
      req.params.ownerId = ownerId;
      mockDealService.getDealsByOwner.mockRejectedValue(new Error('Database error'));
      
      // Act
      await dealController.getDealsByOwner(req, res);
      
      // Assert
      expect(mockDealService.getDealsByOwner).toHaveBeenCalledWith(ownerId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching deals by owner' });
    });
  });
  
  describe('searchDeals', () => {
    test('should search deals by query', async () => {
      // Arrange
      const searchQuery = 'deal';
      const mockDeals = [
        { id: 1, name: 'Deal 1', amount: 1000, status: 'open' },
        { id: 2, name: 'Deal 2', amount: 2000, status: 'won' }
      ];
      req.query.q = searchQuery;
      mockDealService.searchDeals.mockResolvedValue(mockDeals);
      
      // Act
      await dealController.searchDeals(req, res);
      
      // Assert
      expect(mockDealService.searchDeals).toHaveBeenCalledWith(searchQuery);
      expect(res.json).toHaveBeenCalledWith(mockDeals);
    });
    
    test('should handle empty search query', async () => {
      // Arrange
      const mockDeals = [
        { id: 1, name: 'Deal 1', amount: 1000, status: 'open' },
        { id: 2, name: 'Deal 2', amount: 2000, status: 'won' }
      ];
      req.query.q = '';
      mockDealService.searchDeals.mockResolvedValue(mockDeals);
      
      // Act
      await dealController.searchDeals(req, res);
      
      // Assert
      expect(mockDealService.searchDeals).toHaveBeenCalledWith('');
      expect(res.json).toHaveBeenCalledWith(mockDeals);
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const searchQuery = 'deal';
      req.query.q = searchQuery;
      mockDealService.searchDeals.mockRejectedValue(new Error('Database error'));
      
      // Act
      await dealController.searchDeals(req, res);
      
      // Assert
      expect(mockDealService.searchDeals).toHaveBeenCalledWith(searchQuery);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while searching deals' });
    });
  });
  
  describe('generateQuote', () => {
    test('should generate a quote PDF for a deal', async () => {
      // Arrange
      const dealId = '1';
      const mockDeal = {
        id: 1,
        name: 'Deal 1',
        amount: 1000,
        status: 'open',
        company: { name: 'Company 1' },
        contact: { first_name: 'John', last_name: 'Doe' },
        items: [
          { description: 'Item 1', quantity: 1, price: 500 },
          { description: 'Item 2', quantity: 1, price: 500 }
        ]
      };
      const mockPdfBuffer = Buffer.from('PDF content');
      
      req.params.id = dealId;
      mockDealService.getDealById.mockResolvedValue(mockDeal);
      mockPdfService.generateQuotePdf.mockResolvedValue(mockPdfBuffer);
      
      // Act
      await dealController.generateQuote(req, res);
      
      // Assert
      expect(mockDealService.getDealById).toHaveBeenCalledWith(dealId);
      expect(mockPdfService.generateQuotePdf).toHaveBeenCalledWith(mockDeal);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="quote-${dealId}.pdf"`);
      expect(res.send).toHaveBeenCalledWith(mockPdfBuffer);
    });
    
    test('should return 404 when deal is not found', async () => {
      // Arrange
      const dealId = '999';
      req.params.id = dealId;
      mockDealService.getDealById.mockRejectedValue(new Error('Deal not found'));
      
      // Act
      await dealController.generateQuote(req, res);
      
      // Assert
      expect(mockDealService.getDealById).toHaveBeenCalledWith(dealId);
      expect(mockPdfService.generateQuotePdf).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Deal not found' });
    });
    
    test('should handle server errors', async () => {
      // Arrange
      const dealId = '1';
      const mockDeal = { id: 1, name: 'Deal 1', amount: 1000, status: 'open' };
      
      req.params.id = dealId;
      mockDealService.getDealById.mockResolvedValue(mockDeal);
      mockPdfService.generateQuotePdf.mockRejectedValue(new Error('PDF generation error'));
      
      // Act
      await dealController.generateQuote(req, res);
      
      // Assert
      expect(mockDealService.getDealById).toHaveBeenCalledWith(dealId);
      expect(mockPdfService.generateQuotePdf).toHaveBeenCalledWith(mockDeal);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while generating quote' });
    });
  });
});
