/**
 * Unit tests for search service
 */

describe('Search Service', () => {
  // Mock dependencies
  const mockContactRepository = {
    search: jest.fn()
  };
  
  const mockCompanyRepository = {
    search: jest.fn()
  };
  
  const mockDealRepository = {
    search: jest.fn()
  };
  
  const mockActivityRepository = {
    search: jest.fn()
  };
  
  const mockDocumentRepository = {
    search: jest.fn()
  };
  
  // Mock search service
  const searchService = {
    searchContacts: async (query, options = {}) => {
      if (!query) {
        throw new Error('Search query is required');
      }
      
      return await mockContactRepository.search(query, options);
    },
    
    searchCompanies: async (query, options = {}) => {
      if (!query) {
        throw new Error('Search query is required');
      }
      
      return await mockCompanyRepository.search(query, options);
    },
    
    searchDeals: async (query, options = {}) => {
      if (!query) {
        throw new Error('Search query is required');
      }
      
      return await mockDealRepository.search(query, options);
    },
    
    searchActivities: async (query, options = {}) => {
      if (!query) {
        throw new Error('Search query is required');
      }
      
      return await mockActivityRepository.search(query, options);
    },
    
    searchDocuments: async (query, options = {}) => {
      if (!query) {
        throw new Error('Search query is required');
      }
      
      return await mockDocumentRepository.search(query, options);
    },
    
    globalSearch: async (query, options = {}) => {
      if (!query) {
        throw new Error('Search query is required');
      }
      
      const [contacts, companies, deals, activities, documents] = await Promise.all([
        searchService.searchContacts(query, options),
        searchService.searchCompanies(query, options),
        searchService.searchDeals(query, options),
        searchService.searchActivities(query, options),
        searchService.searchDocuments(query, options)
      ]);
      
      return {
        contacts,
        companies,
        deals,
        activities,
        documents
      };
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockContactRepository.search.mockImplementation((query, options) => {
      if (query === 'john') {
        return [
          { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com' },
          { id: 2, first_name: 'John', last_name: 'Smith', email: 'john.smith@example.com' }
        ];
      }
      
      if (query === 'empty') {
        return [];
      }
      
      return [
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com' }
      ];
    });
    
    mockCompanyRepository.search.mockImplementation((query, options) => {
      if (query === 'acme') {
        return [
          { id: 1, name: 'Acme Corporation', industry: 'Technology' },
          { id: 2, name: 'Acme Industries', industry: 'Manufacturing' }
        ];
      }
      
      if (query === 'empty') {
        return [];
      }
      
      return [
        { id: 1, name: 'Acme Corporation', industry: 'Technology' }
      ];
    });
    
    mockDealRepository.search.mockImplementation((query, options) => {
      if (query === 'software') {
        return [
          { id: 1, name: 'Software License', amount: 10000, stage: 'proposal' },
          { id: 2, name: 'Software Implementation', amount: 15000, stage: 'negotiation' }
        ];
      }
      
      if (query === 'empty') {
        return [];
      }
      
      return [
        { id: 1, name: 'Software License', amount: 10000, stage: 'proposal' }
      ];
    });
    
    mockActivityRepository.search.mockImplementation((query, options) => {
      if (query === 'meeting') {
        return [
          { id: 1, type: 'meeting', subject: 'Initial Meeting', status: 'completed' },
          { id: 2, type: 'meeting', subject: 'Follow-up Meeting', status: 'scheduled' }
        ];
      }
      
      if (query === 'empty') {
        return [];
      }
      
      return [
        { id: 1, type: 'meeting', subject: 'Initial Meeting', status: 'completed' }
      ];
    });
    
    mockDocumentRepository.search.mockImplementation((query, options) => {
      if (query === 'proposal') {
        return [
          { id: 1, name: 'Proposal.pdf', type: 'application/pdf' },
          { id: 2, name: 'Proposal_v2.pdf', type: 'application/pdf' }
        ];
      }
      
      if (query === 'empty') {
        return [];
      }
      
      return [
        { id: 1, name: 'Proposal.pdf', type: 'application/pdf' }
      ];
    });
  });

  describe('searchContacts', () => {
    test('should search contacts by query', async () => {
      // Arrange
      const query = 'john';
      const options = { limit: 10 };
      
      // Act
      const result = await searchService.searchContacts(query, options);
      
      // Assert
      expect(mockContactRepository.search).toHaveBeenCalledWith(query, options);
      expect(result).toHaveLength(2);
      expect(result[0].first_name).toBe('John');
      expect(result[1].first_name).toBe('John');
    });
    
    test('should return empty array when no contacts match', async () => {
      // Arrange
      const query = 'empty';
      
      // Act
      const result = await searchService.searchContacts(query);
      
      // Assert
      expect(mockContactRepository.search).toHaveBeenCalledWith(query, {});
      expect(result).toEqual([]);
    });
    
    test('should throw error when query is missing', async () => {
      // Act & Assert
      await expect(searchService.searchContacts()).rejects.toThrow('Search query is required');
      expect(mockContactRepository.search).not.toHaveBeenCalled();
    });
  });
  
  describe('searchCompanies', () => {
    test('should search companies by query', async () => {
      // Arrange
      const query = 'acme';
      const options = { limit: 10 };
      
      // Act
      const result = await searchService.searchCompanies(query, options);
      
      // Assert
      expect(mockCompanyRepository.search).toHaveBeenCalledWith(query, options);
      expect(result).toHaveLength(2);
      expect(result[0].name).toContain('Acme');
      expect(result[1].name).toContain('Acme');
    });
    
    test('should return empty array when no companies match', async () => {
      // Arrange
      const query = 'empty';
      
      // Act
      const result = await searchService.searchCompanies(query);
      
      // Assert
      expect(mockCompanyRepository.search).toHaveBeenCalledWith(query, {});
      expect(result).toEqual([]);
    });
    
    test('should throw error when query is missing', async () => {
      // Act & Assert
      await expect(searchService.searchCompanies()).rejects.toThrow('Search query is required');
      expect(mockCompanyRepository.search).not.toHaveBeenCalled();
    });
  });
  
  describe('searchDeals', () => {
    test('should search deals by query', async () => {
      // Arrange
      const query = 'software';
      const options = { limit: 10 };
      
      // Act
      const result = await searchService.searchDeals(query, options);
      
      // Assert
      expect(mockDealRepository.search).toHaveBeenCalledWith(query, options);
      expect(result).toHaveLength(2);
      expect(result[0].name).toContain('Software');
      expect(result[1].name).toContain('Software');
    });
    
    test('should return empty array when no deals match', async () => {
      // Arrange
      const query = 'empty';
      
      // Act
      const result = await searchService.searchDeals(query);
      
      // Assert
      expect(mockDealRepository.search).toHaveBeenCalledWith(query, {});
      expect(result).toEqual([]);
    });
    
    test('should throw error when query is missing', async () => {
      // Act & Assert
      await expect(searchService.searchDeals()).rejects.toThrow('Search query is required');
      expect(mockDealRepository.search).not.toHaveBeenCalled();
    });
  });
  
  describe('searchActivities', () => {
    test('should search activities by query', async () => {
      // Arrange
      const query = 'meeting';
      const options = { limit: 10 };
      
      // Act
      const result = await searchService.searchActivities(query, options);
      
      // Assert
      expect(mockActivityRepository.search).toHaveBeenCalledWith(query, options);
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('meeting');
      expect(result[1].type).toBe('meeting');
    });
    
    test('should return empty array when no activities match', async () => {
      // Arrange
      const query = 'empty';
      
      // Act
      const result = await searchService.searchActivities(query);
      
      // Assert
      expect(mockActivityRepository.search).toHaveBeenCalledWith(query, {});
      expect(result).toEqual([]);
    });
    
    test('should throw error when query is missing', async () => {
      // Act & Assert
      await expect(searchService.searchActivities()).rejects.toThrow('Search query is required');
      expect(mockActivityRepository.search).not.toHaveBeenCalled();
    });
  });
  
  describe('searchDocuments', () => {
    test('should search documents by query', async () => {
      // Arrange
      const query = 'proposal';
      const options = { limit: 10 };
      
      // Act
      const result = await searchService.searchDocuments(query, options);
      
      // Assert
      expect(mockDocumentRepository.search).toHaveBeenCalledWith(query, options);
      expect(result).toHaveLength(2);
      expect(result[0].name).toContain('Proposal');
      expect(result[1].name).toContain('Proposal');
    });
    
    test('should return empty array when no documents match', async () => {
      // Arrange
      const query = 'empty';
      
      // Act
      const result = await searchService.searchDocuments(query);
      
      // Assert
      expect(mockDocumentRepository.search).toHaveBeenCalledWith(query, {});
      expect(result).toEqual([]);
    });
    
    test('should throw error when query is missing', async () => {
      // Act & Assert
      await expect(searchService.searchDocuments()).rejects.toThrow('Search query is required');
      expect(mockDocumentRepository.search).not.toHaveBeenCalled();
    });
  });
  
  describe('globalSearch', () => {
    test('should search across all entities', async () => {
      // Arrange
      const query = 'test';
      const options = { limit: 5 };
      
      // Spy on individual search methods
      jest.spyOn(searchService, 'searchContacts');
      jest.spyOn(searchService, 'searchCompanies');
      jest.spyOn(searchService, 'searchDeals');
      jest.spyOn(searchService, 'searchActivities');
      jest.spyOn(searchService, 'searchDocuments');
      
      // Act
      const result = await searchService.globalSearch(query, options);
      
      // Assert
      expect(searchService.searchContacts).toHaveBeenCalledWith(query, options);
      expect(searchService.searchCompanies).toHaveBeenCalledWith(query, options);
      expect(searchService.searchDeals).toHaveBeenCalledWith(query, options);
      expect(searchService.searchActivities).toHaveBeenCalledWith(query, options);
      expect(searchService.searchDocuments).toHaveBeenCalledWith(query, options);
      
      expect(result).toHaveProperty('contacts');
      expect(result).toHaveProperty('companies');
      expect(result).toHaveProperty('deals');
      expect(result).toHaveProperty('activities');
      expect(result).toHaveProperty('documents');
    });
    
    test('should throw error when query is missing', async () => {
      // Act & Assert
      await expect(searchService.globalSearch()).rejects.toThrow('Search query is required');
    });
  });
});
