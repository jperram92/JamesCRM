/**
 * Unit tests for document service
 */

describe('Document Service', () => {
  // Mock dependencies
  const mockDocumentRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByUserId: jest.fn(),
    findByEntityId: jest.fn(),
    findByType: jest.fn()
  };
  
  const mockFileUploadService = {
    uploadFile: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFile: jest.fn()
  };
  
  // Mock document service
  const documentService = {
    getAllDocuments: async () => {
      return await mockDocumentRepository.findAll();
    },
    
    getDocumentById: async (id) => {
      const document = await mockDocumentRepository.findById(id);
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      return document;
    },
    
    createDocument: async (documentData, file) => {
      const uploadResult = await mockFileUploadService.uploadFile(file, 'documents');
      
      return await mockDocumentRepository.create({
        ...documentData,
        file_path: uploadResult.path,
        file_name: file.originalname,
        file_size: file.size,
        file_type: file.mimetype,
        created_at: new Date()
      });
    },
    
    updateDocument: async (id, documentData, file) => {
      const document = await mockDocumentRepository.findById(id);
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      let updateData = {
        ...documentData,
        updated_at: new Date()
      };
      
      if (file) {
        // Delete old file
        await mockFileUploadService.deleteFile(document.file_path);
        
        // Upload new file
        const uploadResult = await mockFileUploadService.uploadFile(file, 'documents');
        
        updateData = {
          ...updateData,
          file_path: uploadResult.path,
          file_name: file.originalname,
          file_size: file.size,
          file_type: file.mimetype
        };
      }
      
      return await mockDocumentRepository.update(id, updateData);
    },
    
    deleteDocument: async (id) => {
      const document = await mockDocumentRepository.findById(id);
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Delete file
      await mockFileUploadService.deleteFile(document.file_path);
      
      return await mockDocumentRepository.delete(id);
    },
    
    getDocumentsByUser: async (userId) => {
      return await mockDocumentRepository.findByUserId(userId);
    },
    
    getDocumentsByEntity: async (entityType, entityId) => {
      return await mockDocumentRepository.findByEntityId(entityType, entityId);
    },
    
    getDocumentsByType: async (type) => {
      return await mockDocumentRepository.findByType(type);
    },
    
    getDocumentUrl: async (id) => {
      const document = await mockDocumentRepository.findById(id);
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      return await mockFileUploadService.getFileUrl(document.file_path);
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockDocumentRepository.findAll.mockReset();
    mockDocumentRepository.findById.mockReset();
    mockDocumentRepository.create.mockReset();
    mockDocumentRepository.update.mockReset();
    mockDocumentRepository.delete.mockReset();
    mockDocumentRepository.findByUserId.mockReset();
    mockDocumentRepository.findByEntityId.mockReset();
    mockDocumentRepository.findByType.mockReset();
    mockFileUploadService.uploadFile.mockReset();
    mockFileUploadService.getFileUrl.mockReset();
    mockFileUploadService.deleteFile.mockReset();
    
    // Default mock implementations
    mockDocumentRepository.findAll.mockResolvedValue([
      {
        id: 1,
        title: 'Contract',
        description: 'Service contract',
        type: 'contract',
        entity_type: 'deal',
        entity_id: 1,
        file_path: 'documents/contract.pdf',
        file_name: 'contract.pdf',
        file_size: 1024,
        file_type: 'application/pdf',
        created_by: 1,
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: null
      },
      {
        id: 2,
        title: 'Proposal',
        description: 'Service proposal',
        type: 'proposal',
        entity_type: 'deal',
        entity_id: 1,
        file_path: 'documents/proposal.pdf',
        file_name: 'proposal.pdf',
        file_size: 2048,
        file_type: 'application/pdf',
        created_by: 1,
        created_at: new Date('2023-01-02T00:00:00Z'),
        updated_at: null
      }
    ]);
    
    mockDocumentRepository.findById.mockImplementation((id) => {
      if (id === 999) {
        return null;
      }
      
      if (id === 1) {
        return {
          id,
          title: 'Contract',
          description: 'Service contract',
          type: 'contract',
          entity_type: 'deal',
          entity_id: 1,
          file_path: 'documents/contract.pdf',
          file_name: 'contract.pdf',
          file_size: 1024,
          file_type: 'application/pdf',
          created_by: 1,
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: null
        };
      }
      
      if (id === 2) {
        return {
          id,
          title: 'Proposal',
          description: 'Service proposal',
          type: 'proposal',
          entity_type: 'deal',
          entity_id: 1,
          file_path: 'documents/proposal.pdf',
          file_name: 'proposal.pdf',
          file_size: 2048,
          file_type: 'application/pdf',
          created_by: 1,
          created_at: new Date('2023-01-02T00:00:00Z'),
          updated_at: null
        };
      }
      
      return null;
    });
    
    mockDocumentRepository.create.mockImplementation((documentData) => ({
      id: 3,
      ...documentData
    }));
    
    mockDocumentRepository.update.mockImplementation((id, documentData) => ({
      id,
      ...(id === 1 ? {
        title: 'Contract',
        description: 'Service contract',
        type: 'contract',
        entity_type: 'deal',
        entity_id: 1,
        file_path: 'documents/contract.pdf',
        file_name: 'contract.pdf',
        file_size: 1024,
        file_type: 'application/pdf',
        created_by: 1,
        created_at: new Date('2023-01-01T00:00:00Z')
      } : {
        title: 'Proposal',
        description: 'Service proposal',
        type: 'proposal',
        entity_type: 'deal',
        entity_id: 1,
        file_path: 'documents/proposal.pdf',
        file_name: 'proposal.pdf',
        file_size: 2048,
        file_type: 'application/pdf',
        created_by: 1,
        created_at: new Date('2023-01-02T00:00:00Z')
      }),
      ...documentData
    }));
    
    mockDocumentRepository.delete.mockResolvedValue(true);
    
    mockDocumentRepository.findByUserId.mockImplementation((userId) => {
      if (userId === 999) {
        return [];
      }
      
      return [
        {
          id: 1,
          title: 'Contract',
          description: 'Service contract',
          type: 'contract',
          entity_type: 'deal',
          entity_id: 1,
          file_path: 'documents/contract.pdf',
          file_name: 'contract.pdf',
          file_size: 1024,
          file_type: 'application/pdf',
          created_by: userId,
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: null
        },
        {
          id: 2,
          title: 'Proposal',
          description: 'Service proposal',
          type: 'proposal',
          entity_type: 'deal',
          entity_id: 1,
          file_path: 'documents/proposal.pdf',
          file_name: 'proposal.pdf',
          file_size: 2048,
          file_type: 'application/pdf',
          created_by: userId,
          created_at: new Date('2023-01-02T00:00:00Z'),
          updated_at: null
        }
      ];
    });
    
    mockDocumentRepository.findByEntityId.mockImplementation((entityType, entityId) => {
      if (entityId === 999) {
        return [];
      }
      
      if (entityType === 'deal' && entityId === 1) {
        return [
          {
            id: 1,
            title: 'Contract',
            description: 'Service contract',
            type: 'contract',
            entity_type: entityType,
            entity_id: entityId,
            file_path: 'documents/contract.pdf',
            file_name: 'contract.pdf',
            file_size: 1024,
            file_type: 'application/pdf',
            created_by: 1,
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: null
          },
          {
            id: 2,
            title: 'Proposal',
            description: 'Service proposal',
            type: 'proposal',
            entity_type: entityType,
            entity_id: entityId,
            file_path: 'documents/proposal.pdf',
            file_name: 'proposal.pdf',
            file_size: 2048,
            file_type: 'application/pdf',
            created_by: 1,
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: null
          }
        ];
      }
      
      if (entityType === 'company' && entityId === 1) {
        return [
          {
            id: 3,
            title: 'Company Profile',
            description: 'Company profile document',
            type: 'profile',
            entity_type: entityType,
            entity_id: entityId,
            file_path: 'documents/company_profile.pdf',
            file_name: 'company_profile.pdf',
            file_size: 3072,
            file_type: 'application/pdf',
            created_by: 1,
            created_at: new Date('2023-01-03T00:00:00Z'),
            updated_at: null
          }
        ];
      }
      
      return [];
    });
    
    mockDocumentRepository.findByType.mockImplementation((type) => {
      if (type === 'contract') {
        return [
          {
            id: 1,
            title: 'Contract',
            description: 'Service contract',
            type,
            entity_type: 'deal',
            entity_id: 1,
            file_path: 'documents/contract.pdf',
            file_name: 'contract.pdf',
            file_size: 1024,
            file_type: 'application/pdf',
            created_by: 1,
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: null
          }
        ];
      }
      
      if (type === 'proposal') {
        return [
          {
            id: 2,
            title: 'Proposal',
            description: 'Service proposal',
            type,
            entity_type: 'deal',
            entity_id: 1,
            file_path: 'documents/proposal.pdf',
            file_name: 'proposal.pdf',
            file_size: 2048,
            file_type: 'application/pdf',
            created_by: 1,
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: null
          }
        ];
      }
      
      return [];
    });
    
    mockFileUploadService.uploadFile.mockImplementation((file, folder) => ({
      path: `${folder}/${file.originalname}`,
      url: `https://storage.example.com/${folder}/${file.originalname}`
    }));
    
    mockFileUploadService.getFileUrl.mockImplementation((path) => 
      `https://storage.example.com/${path}`
    );
    
    mockFileUploadService.deleteFile.mockResolvedValue(true);
  });

  describe('getAllDocuments', () => {
    test('should return all documents', async () => {
      // Act
      const result = await documentService.getAllDocuments();
      
      // Assert
      expect(mockDocumentRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });
  
  describe('getDocumentById', () => {
    test('should return document by ID', async () => {
      // Arrange
      const documentId = 1;
      
      // Act
      const result = await documentService.getDocumentById(documentId);
      
      // Assert
      expect(mockDocumentRepository.findById).toHaveBeenCalledWith(documentId);
      expect(result).toEqual({
        id: documentId,
        title: 'Contract',
        description: 'Service contract',
        type: 'contract',
        entity_type: 'deal',
        entity_id: 1,
        file_path: 'documents/contract.pdf',
        file_name: 'contract.pdf',
        file_size: 1024,
        file_type: 'application/pdf',
        created_by: 1,
        created_at: expect.any(Date),
        updated_at: null
      });
    });
    
    test('should throw error when document is not found', async () => {
      // Arrange
      const documentId = 999;
      
      // Act & Assert
      await expect(documentService.getDocumentById(documentId)).rejects.toThrow('Document not found');
      expect(mockDocumentRepository.findById).toHaveBeenCalledWith(documentId);
    });
  });
  
  describe('createDocument', () => {
    test('should create a new document', async () => {
      // Arrange
      const documentData = {
        title: 'New Document',
        description: 'New document description',
        type: 'invoice',
        entity_type: 'deal',
        entity_id: 2,
        created_by: 1
      };
      
      const file = {
        originalname: 'invoice.pdf',
        size: 4096,
        mimetype: 'application/pdf'
      };
      
      // Act
      const result = await documentService.createDocument(documentData, file);
      
      // Assert
      expect(mockFileUploadService.uploadFile).toHaveBeenCalledWith(file, 'documents');
      expect(mockDocumentRepository.create).toHaveBeenCalledWith({
        ...documentData,
        file_path: 'documents/invoice.pdf',
        file_name: 'invoice.pdf',
        file_size: 4096,
        file_type: 'application/pdf',
        created_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: 3,
        ...documentData,
        file_path: 'documents/invoice.pdf',
        file_name: 'invoice.pdf',
        file_size: 4096,
        file_type: 'application/pdf',
        created_at: expect.any(Date)
      });
    });
  });
  
  describe('updateDocument', () => {
    test('should update an existing document without changing file', async () => {
      // Arrange
      const documentId = 1;
      const documentData = {
        title: 'Updated Contract',
        description: 'Updated contract description'
      };
      
      // Act
      const result = await documentService.updateDocument(documentId, documentData);
      
      // Assert
      expect(mockDocumentRepository.findById).toHaveBeenCalledWith(documentId);
      expect(mockFileUploadService.deleteFile).not.toHaveBeenCalled();
      expect(mockFileUploadService.uploadFile).not.toHaveBeenCalled();
      expect(mockDocumentRepository.update).toHaveBeenCalledWith(documentId, {
        ...documentData,
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: documentId,
        title: 'Updated Contract',
        description: 'Updated contract description',
        type: 'contract',
        entity_type: 'deal',
        entity_id: 1,
        file_path: 'documents/contract.pdf',
        file_name: 'contract.pdf',
        file_size: 1024,
        file_type: 'application/pdf',
        created_by: 1,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
    
    test('should update an existing document with new file', async () => {
      // Arrange
      const documentId = 1;
      const documentData = {
        title: 'Updated Contract',
        description: 'Updated contract description'
      };
      
      const file = {
        originalname: 'updated_contract.pdf',
        size: 5120,
        mimetype: 'application/pdf'
      };
      
      // Act
      const result = await documentService.updateDocument(documentId, documentData, file);
      
      // Assert
      expect(mockDocumentRepository.findById).toHaveBeenCalledWith(documentId);
      expect(mockFileUploadService.deleteFile).toHaveBeenCalledWith('documents/contract.pdf');
      expect(mockFileUploadService.uploadFile).toHaveBeenCalledWith(file, 'documents');
      expect(mockDocumentRepository.update).toHaveBeenCalledWith(documentId, {
        ...documentData,
        file_path: 'documents/updated_contract.pdf',
        file_name: 'updated_contract.pdf',
        file_size: 5120,
        file_type: 'application/pdf',
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: documentId,
        title: 'Updated Contract',
        description: 'Updated contract description',
        type: 'contract',
        entity_type: 'deal',
        entity_id: 1,
        file_path: 'documents/updated_contract.pdf',
        file_name: 'updated_contract.pdf',
        file_size: 5120,
        file_type: 'application/pdf',
        created_by: 1,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
    
    test('should throw error when document is not found', async () => {
      // Arrange
      const documentId = 999;
      const documentData = {
        title: 'Updated Document'
      };
      
      // Act & Assert
      await expect(documentService.updateDocument(documentId, documentData)).rejects.toThrow('Document not found');
      expect(mockDocumentRepository.findById).toHaveBeenCalledWith(documentId);
      expect(mockFileUploadService.deleteFile).not.toHaveBeenCalled();
      expect(mockFileUploadService.uploadFile).not.toHaveBeenCalled();
      expect(mockDocumentRepository.update).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteDocument', () => {
    test('should delete an existing document', async () => {
      // Arrange
      const documentId = 1;
      
      // Act
      const result = await documentService.deleteDocument(documentId);
      
      // Assert
      expect(mockDocumentRepository.findById).toHaveBeenCalledWith(documentId);
      expect(mockFileUploadService.deleteFile).toHaveBeenCalledWith('documents/contract.pdf');
      expect(mockDocumentRepository.delete).toHaveBeenCalledWith(documentId);
      expect(result).toBe(true);
    });
    
    test('should throw error when document is not found', async () => {
      // Arrange
      const documentId = 999;
      
      // Act & Assert
      await expect(documentService.deleteDocument(documentId)).rejects.toThrow('Document not found');
      expect(mockDocumentRepository.findById).toHaveBeenCalledWith(documentId);
      expect(mockFileUploadService.deleteFile).not.toHaveBeenCalled();
      expect(mockDocumentRepository.delete).not.toHaveBeenCalled();
    });
  });
  
  describe('getDocumentsByUser', () => {
    test('should return documents for a user', async () => {
      // Arrange
      const userId = 1;
      
      // Act
      const result = await documentService.getDocumentsByUser(userId);
      
      // Assert
      expect(mockDocumentRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(2);
      expect(result[0].created_by).toBe(userId);
      expect(result[1].created_by).toBe(userId);
    });
    
    test('should return empty array when user has no documents', async () => {
      // Arrange
      const userId = 999;
      
      // Act
      const result = await documentService.getDocumentsByUser(userId);
      
      // Assert
      expect(mockDocumentRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });
  
  describe('getDocumentsByEntity', () => {
    test('should return documents for a deal', async () => {
      // Arrange
      const entityType = 'deal';
      const entityId = 1;
      
      // Act
      const result = await documentService.getDocumentsByEntity(entityType, entityId);
      
      // Assert
      expect(mockDocumentRepository.findByEntityId).toHaveBeenCalledWith(entityType, entityId);
      expect(result).toHaveLength(2);
      expect(result[0].entity_type).toBe(entityType);
      expect(result[0].entity_id).toBe(entityId);
      expect(result[1].entity_type).toBe(entityType);
      expect(result[1].entity_id).toBe(entityId);
    });
    
    test('should return documents for a company', async () => {
      // Arrange
      const entityType = 'company';
      const entityId = 1;
      
      // Act
      const result = await documentService.getDocumentsByEntity(entityType, entityId);
      
      // Assert
      expect(mockDocumentRepository.findByEntityId).toHaveBeenCalledWith(entityType, entityId);
      expect(result).toHaveLength(1);
      expect(result[0].entity_type).toBe(entityType);
      expect(result[0].entity_id).toBe(entityId);
      expect(result[0].title).toBe('Company Profile');
    });
    
    test('should return empty array when entity has no documents', async () => {
      // Arrange
      const entityType = 'contact';
      const entityId = 999;
      
      // Act
      const result = await documentService.getDocumentsByEntity(entityType, entityId);
      
      // Assert
      expect(mockDocumentRepository.findByEntityId).toHaveBeenCalledWith(entityType, entityId);
      expect(result).toEqual([]);
    });
  });
  
  describe('getDocumentsByType', () => {
    test('should return contract documents', async () => {
      // Arrange
      const type = 'contract';
      
      // Act
      const result = await documentService.getDocumentsByType(type);
      
      // Assert
      expect(mockDocumentRepository.findByType).toHaveBeenCalledWith(type);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(type);
      expect(result[0].title).toBe('Contract');
    });
    
    test('should return proposal documents', async () => {
      // Arrange
      const type = 'proposal';
      
      // Act
      const result = await documentService.getDocumentsByType(type);
      
      // Assert
      expect(mockDocumentRepository.findByType).toHaveBeenCalledWith(type);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(type);
      expect(result[0].title).toBe('Proposal');
    });
    
    test('should return empty array when no documents of type exist', async () => {
      // Arrange
      const type = 'invoice';
      
      // Mock implementation for this specific test
      mockDocumentRepository.findByType.mockResolvedValue([]);
      
      // Act
      const result = await documentService.getDocumentsByType(type);
      
      // Assert
      expect(mockDocumentRepository.findByType).toHaveBeenCalledWith(type);
      expect(result).toEqual([]);
    });
  });
  
  describe('getDocumentUrl', () => {
    test('should return URL for a document', async () => {
      // Arrange
      const documentId = 1;
      
      // Act
      const result = await documentService.getDocumentUrl(documentId);
      
      // Assert
      expect(mockDocumentRepository.findById).toHaveBeenCalledWith(documentId);
      expect(mockFileUploadService.getFileUrl).toHaveBeenCalledWith('documents/contract.pdf');
      expect(result).toBe('https://storage.example.com/documents/contract.pdf');
    });
    
    test('should throw error when document is not found', async () => {
      // Arrange
      const documentId = 999;
      
      // Act & Assert
      await expect(documentService.getDocumentUrl(documentId)).rejects.toThrow('Document not found');
      expect(mockDocumentRepository.findById).toHaveBeenCalledWith(documentId);
      expect(mockFileUploadService.getFileUrl).not.toHaveBeenCalled();
    });
  });
});
