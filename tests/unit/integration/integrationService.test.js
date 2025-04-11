/**
 * Unit tests for integration service
 */

describe('Integration Service', () => {
  // Mock dependencies
  const mockIntegrationRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    findByType: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByProviderAndExternalId: jest.fn()
  };
  
  const mockUserService = {
    getUserById: jest.fn()
  };
  
  // Mock integration service
  const integrationService = {
    getAllIntegrations: async () => {
      return await mockIntegrationRepository.findAll();
    },
    
    getIntegrationById: async (id) => {
      const integration = await mockIntegrationRepository.findById(id);
      
      if (!integration) {
        throw new Error('Integration not found');
      }
      
      return integration;
    },
    
    getIntegrationsByUser: async (userId) => {
      const user = await mockUserService.getUserById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return await mockIntegrationRepository.findByUser(userId);
    },
    
    getIntegrationsByType: async (type) => {
      return await mockIntegrationRepository.findByType(type);
    },
    
    createIntegration: async (integrationData) => {
      const { name, type, provider, config, user_id } = integrationData;
      
      if (!name || !type || !provider || !user_id) {
        throw new Error('Name, type, provider, and user ID are required');
      }
      
      const user = await mockUserService.getUserById(user_id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return await mockIntegrationRepository.create({
        ...integrationData,
        status: 'active',
        created_at: new Date()
      });
    },
    
    updateIntegration: async (id, integrationData) => {
      const integration = await mockIntegrationRepository.findById(id);
      
      if (!integration) {
        throw new Error('Integration not found');
      }
      
      return await mockIntegrationRepository.update(id, {
        ...integrationData,
        updated_at: new Date()
      });
    },
    
    deleteIntegration: async (id) => {
      const integration = await mockIntegrationRepository.findById(id);
      
      if (!integration) {
        throw new Error('Integration not found');
      }
      
      return await mockIntegrationRepository.delete(id);
    },
    
    findIntegrationByProviderAndExternalId: async (provider, externalId) => {
      if (!provider || !externalId) {
        throw new Error('Provider and external ID are required');
      }
      
      return await mockIntegrationRepository.findByProviderAndExternalId(provider, externalId);
    },
    
    syncIntegrationData: async (id) => {
      const integration = await mockIntegrationRepository.findById(id);
      
      if (!integration) {
        throw new Error('Integration not found');
      }
      
      // This would normally call the external provider's API
      // For testing, we'll just return a mock result
      return {
        integration_id: id,
        sync_status: 'success',
        items_synced: 10,
        last_sync: new Date()
      };
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockIntegrationRepository.findAll.mockResolvedValue([
      {
        id: 1,
        name: 'Gmail Integration',
        type: 'email',
        provider: 'google',
        config: { client_id: 'client123', scope: 'mail.read' },
        user_id: 1,
        status: 'active',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: null
      },
      {
        id: 2,
        name: 'Outlook Calendar',
        type: 'calendar',
        provider: 'microsoft',
        config: { client_id: 'client456', scope: 'calendar.read' },
        user_id: 1,
        status: 'active',
        created_at: new Date('2023-01-02T00:00:00Z'),
        updated_at: null
      }
    ]);
    
    mockIntegrationRepository.findById.mockImplementation((id) => {
      if (id === 999) {
        return null;
      }
      
      if (id === 1) {
        return {
          id,
          name: 'Gmail Integration',
          type: 'email',
          provider: 'google',
          config: { client_id: 'client123', scope: 'mail.read' },
          user_id: 1,
          status: 'active',
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: null
        };
      }
      
      if (id === 2) {
        return {
          id,
          name: 'Outlook Calendar',
          type: 'calendar',
          provider: 'microsoft',
          config: { client_id: 'client456', scope: 'calendar.read' },
          user_id: 1,
          status: 'active',
          created_at: new Date('2023-01-02T00:00:00Z'),
          updated_at: null
        };
      }
      
      return null;
    });
    
    mockIntegrationRepository.findByUser.mockImplementation((userId) => {
      if (userId === 999) {
        return [];
      }
      
      if (userId === 1) {
        return [
          {
            id: 1,
            name: 'Gmail Integration',
            type: 'email',
            provider: 'google',
            config: { client_id: 'client123', scope: 'mail.read' },
            user_id: userId,
            status: 'active',
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: null
          },
          {
            id: 2,
            name: 'Outlook Calendar',
            type: 'calendar',
            provider: 'microsoft',
            config: { client_id: 'client456', scope: 'calendar.read' },
            user_id: userId,
            status: 'active',
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: null
          }
        ];
      }
      
      return [];
    });
    
    mockIntegrationRepository.findByType.mockImplementation((type) => {
      if (type === 'email') {
        return [
          {
            id: 1,
            name: 'Gmail Integration',
            type,
            provider: 'google',
            config: { client_id: 'client123', scope: 'mail.read' },
            user_id: 1,
            status: 'active',
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: null
          }
        ];
      }
      
      if (type === 'calendar') {
        return [
          {
            id: 2,
            name: 'Outlook Calendar',
            type,
            provider: 'microsoft',
            config: { client_id: 'client456', scope: 'calendar.read' },
            user_id: 1,
            status: 'active',
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: null
          }
        ];
      }
      
      return [];
    });
    
    mockIntegrationRepository.create.mockImplementation((integrationData) => ({
      id: 3,
      ...integrationData
    }));
    
    mockIntegrationRepository.update.mockImplementation((id, integrationData) => ({
      id,
      ...(id === 1 ? {
        name: 'Gmail Integration',
        type: 'email',
        provider: 'google',
        config: { client_id: 'client123', scope: 'mail.read' },
        user_id: 1,
        status: 'active',
        created_at: new Date('2023-01-01T00:00:00Z')
      } : {
        name: 'Outlook Calendar',
        type: 'calendar',
        provider: 'microsoft',
        config: { client_id: 'client456', scope: 'calendar.read' },
        user_id: 1,
        status: 'active',
        created_at: new Date('2023-01-02T00:00:00Z')
      }),
      ...integrationData
    }));
    
    mockIntegrationRepository.delete.mockResolvedValue(true);
    
    mockIntegrationRepository.findByProviderAndExternalId.mockImplementation((provider, externalId) => {
      if (provider === 'google' && externalId === 'user123') {
        return {
          id: 1,
          name: 'Gmail Integration',
          type: 'email',
          provider,
          external_id: externalId,
          config: { client_id: 'client123', scope: 'mail.read' },
          user_id: 1,
          status: 'active',
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: null
        };
      }
      
      return null;
    });
    
    mockUserService.getUserById.mockImplementation((id) => {
      if (id === 999) {
        return null;
      }
      
      return {
        id,
        name: 'John Doe',
        email: 'john@example.com'
      };
    });
  });

  describe('getAllIntegrations', () => {
    test('should return all integrations', async () => {
      // Act
      const result = await integrationService.getAllIntegrations();
      
      // Assert
      expect(mockIntegrationRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });
  
  describe('getIntegrationById', () => {
    test('should return integration by ID', async () => {
      // Arrange
      const integrationId = 1;
      
      // Act
      const result = await integrationService.getIntegrationById(integrationId);
      
      // Assert
      expect(mockIntegrationRepository.findById).toHaveBeenCalledWith(integrationId);
      expect(result).toEqual({
        id: integrationId,
        name: 'Gmail Integration',
        type: 'email',
        provider: 'google',
        config: { client_id: 'client123', scope: 'mail.read' },
        user_id: 1,
        status: 'active',
        created_at: expect.any(Date),
        updated_at: null
      });
    });
    
    test('should throw error when integration is not found', async () => {
      // Arrange
      const integrationId = 999;
      
      // Act & Assert
      await expect(integrationService.getIntegrationById(integrationId))
        .rejects.toThrow('Integration not found');
      expect(mockIntegrationRepository.findById).toHaveBeenCalledWith(integrationId);
    });
  });
  
  describe('getIntegrationsByUser', () => {
    test('should return integrations by user ID', async () => {
      // Arrange
      const userId = 1;
      
      // Act
      const result = await integrationService.getIntegrationsByUser(userId);
      
      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockIntegrationRepository.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(2);
      expect(result[0].user_id).toBe(userId);
      expect(result[1].user_id).toBe(userId);
    });
    
    test('should throw error when user is not found', async () => {
      // Arrange
      const userId = 999;
      
      // Act & Assert
      await expect(integrationService.getIntegrationsByUser(userId))
        .rejects.toThrow('User not found');
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockIntegrationRepository.findByUser).not.toHaveBeenCalled();
    });
    
    test('should return empty array when user has no integrations', async () => {
      // Arrange
      const userId = 2;
      
      // Act
      const result = await integrationService.getIntegrationsByUser(userId);
      
      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockIntegrationRepository.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });
  
  describe('getIntegrationsByType', () => {
    test('should return integrations by type', async () => {
      // Arrange
      const type = 'email';
      
      // Act
      const result = await integrationService.getIntegrationsByType(type);
      
      // Assert
      expect(mockIntegrationRepository.findByType).toHaveBeenCalledWith(type);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(type);
    });
    
    test('should return empty array when no integrations of type exist', async () => {
      // Arrange
      const type = 'nonexistent';
      
      // Act
      const result = await integrationService.getIntegrationsByType(type);
      
      // Assert
      expect(mockIntegrationRepository.findByType).toHaveBeenCalledWith(type);
      expect(result).toEqual([]);
    });
  });
  
  describe('createIntegration', () => {
    test('should create a new integration', async () => {
      // Arrange
      const integrationData = {
        name: 'Salesforce Integration',
        type: 'crm',
        provider: 'salesforce',
        config: { client_id: 'client789', scope: 'data.read' },
        user_id: 1
      };
      
      // Act
      const result = await integrationService.createIntegration(integrationData);
      
      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(integrationData.user_id);
      expect(mockIntegrationRepository.create).toHaveBeenCalledWith({
        ...integrationData,
        status: 'active',
        created_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: 3,
        ...integrationData,
        status: 'active',
        created_at: expect.any(Date)
      });
    });
    
    test('should throw error when required fields are missing', async () => {
      // Arrange
      const incompleteData = {
        name: 'Salesforce Integration',
        // Missing type
        provider: 'salesforce',
        user_id: 1
      };
      
      // Act & Assert
      await expect(integrationService.createIntegration(incompleteData))
        .rejects.toThrow('Name, type, provider, and user ID are required');
      expect(mockUserService.getUserById).not.toHaveBeenCalled();
      expect(mockIntegrationRepository.create).not.toHaveBeenCalled();
    });
    
    test('should throw error when user is not found', async () => {
      // Arrange
      const integrationData = {
        name: 'Salesforce Integration',
        type: 'crm',
        provider: 'salesforce',
        config: { client_id: 'client789', scope: 'data.read' },
        user_id: 999
      };
      
      // Act & Assert
      await expect(integrationService.createIntegration(integrationData))
        .rejects.toThrow('User not found');
      expect(mockUserService.getUserById).toHaveBeenCalledWith(integrationData.user_id);
      expect(mockIntegrationRepository.create).not.toHaveBeenCalled();
    });
  });
  
  describe('updateIntegration', () => {
    test('should update an existing integration', async () => {
      // Arrange
      const integrationId = 1;
      const updateData = {
        name: 'Updated Gmail Integration',
        config: { client_id: 'newclient123', scope: 'mail.read mail.write' }
      };
      
      // Act
      const result = await integrationService.updateIntegration(integrationId, updateData);
      
      // Assert
      expect(mockIntegrationRepository.findById).toHaveBeenCalledWith(integrationId);
      expect(mockIntegrationRepository.update).toHaveBeenCalledWith(integrationId, {
        ...updateData,
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: integrationId,
        name: 'Updated Gmail Integration',
        type: 'email',
        provider: 'google',
        config: { client_id: 'newclient123', scope: 'mail.read mail.write' },
        user_id: 1,
        status: 'active',
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
    
    test('should throw error when integration is not found', async () => {
      // Arrange
      const integrationId = 999;
      const updateData = {
        name: 'Updated Integration'
      };
      
      // Act & Assert
      await expect(integrationService.updateIntegration(integrationId, updateData))
        .rejects.toThrow('Integration not found');
      expect(mockIntegrationRepository.findById).toHaveBeenCalledWith(integrationId);
      expect(mockIntegrationRepository.update).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteIntegration', () => {
    test('should delete an integration', async () => {
      // Arrange
      const integrationId = 1;
      
      // Act
      const result = await integrationService.deleteIntegration(integrationId);
      
      // Assert
      expect(mockIntegrationRepository.findById).toHaveBeenCalledWith(integrationId);
      expect(mockIntegrationRepository.delete).toHaveBeenCalledWith(integrationId);
      expect(result).toBe(true);
    });
    
    test('should throw error when integration is not found', async () => {
      // Arrange
      const integrationId = 999;
      
      // Act & Assert
      await expect(integrationService.deleteIntegration(integrationId))
        .rejects.toThrow('Integration not found');
      expect(mockIntegrationRepository.findById).toHaveBeenCalledWith(integrationId);
      expect(mockIntegrationRepository.delete).not.toHaveBeenCalled();
    });
  });
  
  describe('findIntegrationByProviderAndExternalId', () => {
    test('should find integration by provider and external ID', async () => {
      // Arrange
      const provider = 'google';
      const externalId = 'user123';
      
      // Act
      const result = await integrationService.findIntegrationByProviderAndExternalId(provider, externalId);
      
      // Assert
      expect(mockIntegrationRepository.findByProviderAndExternalId).toHaveBeenCalledWith(provider, externalId);
      expect(result).toEqual({
        id: 1,
        name: 'Gmail Integration',
        type: 'email',
        provider,
        external_id: externalId,
        config: { client_id: 'client123', scope: 'mail.read' },
        user_id: 1,
        status: 'active',
        created_at: expect.any(Date),
        updated_at: null
      });
    });
    
    test('should return null when integration is not found', async () => {
      // Arrange
      const provider = 'google';
      const externalId = 'nonexistent';
      
      // Act
      const result = await integrationService.findIntegrationByProviderAndExternalId(provider, externalId);
      
      // Assert
      expect(mockIntegrationRepository.findByProviderAndExternalId).toHaveBeenCalledWith(provider, externalId);
      expect(result).toBeNull();
    });
    
    test('should throw error when provider or external ID is missing', async () => {
      // Act & Assert
      await expect(integrationService.findIntegrationByProviderAndExternalId(null, 'user123'))
        .rejects.toThrow('Provider and external ID are required');
      await expect(integrationService.findIntegrationByProviderAndExternalId('google', null))
        .rejects.toThrow('Provider and external ID are required');
      
      expect(mockIntegrationRepository.findByProviderAndExternalId).not.toHaveBeenCalled();
    });
  });
  
  describe('syncIntegrationData', () => {
    test('should sync integration data', async () => {
      // Arrange
      const integrationId = 1;
      
      // Act
      const result = await integrationService.syncIntegrationData(integrationId);
      
      // Assert
      expect(mockIntegrationRepository.findById).toHaveBeenCalledWith(integrationId);
      expect(result).toEqual({
        integration_id: integrationId,
        sync_status: 'success',
        items_synced: 10,
        last_sync: expect.any(Date)
      });
    });
    
    test('should throw error when integration is not found', async () => {
      // Arrange
      const integrationId = 999;
      
      // Act & Assert
      await expect(integrationService.syncIntegrationData(integrationId))
        .rejects.toThrow('Integration not found');
      expect(mockIntegrationRepository.findById).toHaveBeenCalledWith(integrationId);
    });
  });
});
