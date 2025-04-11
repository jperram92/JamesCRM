/**
 * Unit tests for document controller
 */

describe('Document Controller', () => {
  // Mock dependencies
  const mockDocumentService = {
    getAllDocuments: jest.fn(),
    getDocumentById: jest.fn(),
    getDocumentsByEntity: jest.fn(),
    createDocument: jest.fn(),
    updateDocument: jest.fn(),
    deleteDocument: jest.fn(),
    downloadDocument: jest.fn()
  };
  
  // Mock request and response
  const mockRequest = () => {
    const req = {};
    req.body = jest.fn().mockReturnValue(req);
    req.params = jest.fn().mockReturnValue(req);
    req.query = jest.fn().mockReturnValue(req);
    req.user = { id: 1 };
    req.file = null;
    return req;
  };
  
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.download = jest.fn().mockReturnValue(res);
    res.set = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };
  
  // Mock document controller
  const documentController = {
    getAllDocuments: async (req, res) => {
      try {
        const documents = await mockDocumentService.getAllDocuments();
        res.json(documents);
      } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Server error while fetching documents' });
      }
    },
    
    getDocumentById: async (req, res) => {
      try {
        const { id } = req.params;
        const document = await mockDocumentService.getDocumentById(id);
        
        if (!document) {
          return res.status(404).json({ message: 'Document not found' });
        }
        
        res.json(document);
      } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({ message: 'Server error while fetching document' });
      }
    },
    
    getDocumentsByEntity: async (req, res) => {
      try {
        const { entity_type, entity_id } = req.params;
        
        if (!entity_type || !entity_id) {
          return res.status(400).json({ message: 'Entity type and ID are required' });
        }
        
        const documents = await mockDocumentService.getDocumentsByEntity(entity_type, entity_id);
        res.json(documents);
      } catch (error) {
        console.error('Error fetching entity documents:', error);
        res.status(500).json({ message: 'Server error while fetching entity documents' });
      }
    },
    
    createDocument: async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const { entity_type, entity_id } = req.body;
        
        if (!entity_type || !entity_id) {
          return res.status(400).json({ message: 'Entity type and ID are required' });
        }
        
        const documentData = {
          name: req.file.originalname,
          mime_type: req.file.mimetype,
          size: req.file.size,
          entity_type,
          entity_id,
          uploaded_by: req.user.id,
          file_buffer: req.file.buffer
        };
        
        const document = await mockDocumentService.createDocument(documentData);
        res.status(201).json(document);
      } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ message: 'Server error while creating document' });
      }
    },
    
    updateDocument: async (req, res) => {
      try {
        const { id } = req.params;
        const documentData = req.body;
        
        const document = await mockDocumentService.getDocumentById(id);
        
        if (!document) {
          return res.status(404).json({ message: 'Document not found' });
        }
        
        const updatedDocument = await mockDocumentService.updateDocument(id, documentData);
        res.json(updatedDocument);
      } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ message: 'Server error while updating document' });
      }
    },
    
    deleteDocument: async (req, res) => {
      try {
        const { id } = req.params;
        
        const document = await mockDocumentService.getDocumentById(id);
        
        if (!document) {
          return res.status(404).json({ message: 'Document not found' });
        }
        
        await mockDocumentService.deleteDocument(id);
        res.json({ message: 'Document deleted successfully' });
      } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Server error while deleting document' });
      }
    },
    
    downloadDocument: async (req, res) => {
      try {
        const { id } = req.params;
        
        const document = await mockDocumentService.getDocumentById(id);
        
        if (!document) {
          return res.status(404).json({ message: 'Document not found' });
        }
        
        const { file, buffer } = await mockDocumentService.downloadDocument(id);
        
        res.set({
          'Content-Type': file.mime_type,
          'Content-Disposition': `attachment; filename="${file.name}"`,
          'Content-Length': buffer.length
        });
        
        res.send(buffer);
      } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({ message: 'Server error while downloading document' });
      }
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllDocuments', () => {
    test('should return all documents', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const mockDocuments = [
        { id: 1, name: 'document1.pdf', entity_type: 'contact', entity_id: 1 },
        { id: 2, name: 'document2.jpg', entity_type: 'company', entity_id: 1 }
      ];
      
      mockDocumentService.getAllDocuments.mockResolvedValue(mockDocuments);
      
      // Act
      await documentController.getAllDocuments(req, res);
      
      // Assert
      expect(mockDocumentService.getAllDocuments).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockDocuments);
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const errorMessage = 'Database error';
      
      mockDocumentService.getAllDocuments.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await documentController.getAllDocuments(req, res);
      
      // Assert
      expect(mockDocumentService.getAllDocuments).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching documents' });
    });
  });
  
  describe('getDocumentById', () => {
    test('should return a document when a valid ID is provided', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const documentId = '1';
      const mockDocument = { id: 1, name: 'document1.pdf', entity_type: 'contact', entity_id: 1 };
      
      req.params = { id: documentId };
      mockDocumentService.getDocumentById.mockResolvedValue(mockDocument);
      
      // Act
      await documentController.getDocumentById(req, res);
      
      // Assert
      expect(mockDocumentService.getDocumentById).toHaveBeenCalledWith(documentId);
      expect(res.json).toHaveBeenCalledWith(mockDocument);
    });
    
    test('should return 404 when document is not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const documentId = '999';
      
      req.params = { id: documentId };
      mockDocumentService.getDocumentById.mockResolvedValue(null);
      
      // Act
      await documentController.getDocumentById(req, res);
      
      // Assert
      expect(mockDocumentService.getDocumentById).toHaveBeenCalledWith(documentId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Document not found' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const documentId = '1';
      const errorMessage = 'Database error';
      
      req.params = { id: documentId };
      mockDocumentService.getDocumentById.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await documentController.getDocumentById(req, res);
      
      // Assert
      expect(mockDocumentService.getDocumentById).toHaveBeenCalledWith(documentId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching document' });
    });
  });
  
  describe('getDocumentsByEntity', () => {
    test('should return documents for an entity', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const entityType = 'contact';
      const entityId = '1';
      const mockDocuments = [
        { id: 1, name: 'document1.pdf', entity_type: 'contact', entity_id: 1 },
        { id: 3, name: 'document3.docx', entity_type: 'contact', entity_id: 1 }
      ];
      
      req.params = { entity_type: entityType, entity_id: entityId };
      mockDocumentService.getDocumentsByEntity.mockResolvedValue(mockDocuments);
      
      // Act
      await documentController.getDocumentsByEntity(req, res);
      
      // Assert
      expect(mockDocumentService.getDocumentsByEntity).toHaveBeenCalledWith(entityType, entityId);
      expect(res.json).toHaveBeenCalledWith(mockDocuments);
    });
    
    test('should return 400 when entity type is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const entityId = '1';
      
      req.params = { entity_id: entityId };
      
      // Act
      await documentController.getDocumentsByEntity(req, res);
      
      // Assert
      expect(mockDocumentService.getDocumentsByEntity).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Entity type and ID are required' });
    });
    
    test('should return 400 when entity ID is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const entityType = 'contact';
      
      req.params = { entity_type: entityType };
      
      // Act
      await documentController.getDocumentsByEntity(req, res);
      
      // Assert
      expect(mockDocumentService.getDocumentsByEntity).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Entity type and ID are required' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const entityType = 'contact';
      const entityId = '1';
      const errorMessage = 'Database error';
      
      req.params = { entity_type: entityType, entity_id: entityId };
      mockDocumentService.getDocumentsByEntity.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await documentController.getDocumentsByEntity(req, res);
      
      // Assert
      expect(mockDocumentService.getDocumentsByEntity).toHaveBeenCalledWith(entityType, entityId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching entity documents' });
    });
  });
  
  describe('createDocument', () => {
    test('should create a new document', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.file = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test')
      };
      
      req.body = {
        entity_type: 'contact',
        entity_id: '1'
      };
      
      const documentData = {
        name: 'test.pdf',
        mime_type: 'application/pdf',
        size: 1024,
        entity_type: 'contact',
        entity_id: '1',
        uploaded_by: 1,
        file_buffer: Buffer.from('test')
      };
      
      const createdDocument = {
        id: 3,
        name: 'test.pdf',
        mime_type: 'application/pdf',
        size: 1024,
        entity_type: 'contact',
        entity_id: '1',
        uploaded_by: 1,
        storage_path: 'contacts/1/test.pdf',
        created_at: new Date()
      };
      
      mockDocumentService.createDocument.mockResolvedValue(createdDocument);
      
      // Act
      await documentController.createDocument(req, res);
      
      // Assert
      expect(mockDocumentService.createDocument).toHaveBeenCalledWith(documentData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdDocument);
    });
    
    test('should return 400 when no file is uploaded', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.file = null;
      
      // Act
      await documentController.createDocument(req, res);
      
      // Assert
      expect(mockDocumentService.createDocument).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No file uploaded' });
    });
    
    test('should return 400 when entity type is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.file = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test')
      };
      
      req.body = {
        entity_id: '1'
      };
      
      // Act
      await documentController.createDocument(req, res);
      
      // Assert
      expect(mockDocumentService.createDocument).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Entity type and ID are required' });
    });
    
    test('should return 400 when entity ID is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.file = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test')
      };
      
      req.body = {
        entity_type: 'contact'
      };
      
      // Act
      await documentController.createDocument(req, res);
      
      // Assert
      expect(mockDocumentService.createDocument).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Entity type and ID are required' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.file = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test')
      };
      
      req.body = {
        entity_type: 'contact',
        entity_id: '1'
      };
      
      const errorMessage = 'Storage error';
      
      mockDocumentService.createDocument.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await documentController.createDocument(req, res);
      
      // Assert
      expect(mockDocumentService.createDocument).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while creating document' });
    });
  });
  
  describe('updateDocument', () => {
    test('should update an existing document', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const documentId = '1';
      const documentData = {
        name: 'updated.pdf'
      };
      
      const existingDocument = {
        id: 1,
        name: 'document1.pdf',
        entity_type: 'contact',
        entity_id: 1
      };
      
      const updatedDocument = {
        id: 1,
        name: 'updated.pdf',
        entity_type: 'contact',
        entity_id: 1
      };
      
      req.params = { id: documentId };
      req.body = documentData;
      
      mockDocumentService.getDocumentById.mockResolvedValue(existingDocument);
      mockDocumentService.updateDocument.mockResolvedValue(updatedDocument);
      
      // Act
      await documentController.updateDocument(req, res);
      
      // Assert
      expect(mockDocumentService.getDocumentById).toHaveBeenCalledWith(documentId);
      expect(mockDocumentService.updateDocument).toHaveBeenCalledWith(documentId, documentData);
      expect(res.json).toHaveBeenCalledWith(updatedDocument);
    });
    
    test('should return 404 when document is not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const documentId = '999';
      const documentData = {
        name: 'updated.pdf'
      };
      
      req.params = { id: documentId };
      req.body = documentData;
      
      mockDocumentService.getDocumentById.mockResolvedValue(null);
      
      // Act
      await documentController.updateDocument(req, res);
      
      // Assert
      expect(mockDocumentService.getDocumentById).toHaveBeenCalledWith(documentId);
      expect(mockDocumentService.updateDocument).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Document not found' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const documentId = '1';
      const documentData = {
        name: 'updated.pdf'
      };
      
      const errorMessage = 'Database error';
      
      req.params = { id: documentId };
      req.body = documentData;
      
      mockDocumentService.getDocumentById.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await documentController.updateDocument(req, res);
      
      // Assert
      expect(mockDocumentService.getDocumentById).toHaveBeenCalledWith(documentId);
      expect(mockDocumentService.updateDocument).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while updating document' });
    });
  });
  
  describe('deleteDocument', () => {
    test('should delete an existing document', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const documentId = '1';
      
      const existingDocument = {
        id: 1,
        name: 'document1.pdf',
        entity_type: 'contact',
        entity_id: 1
      };
      
      req.params = { id: documentId };
      
      mockDocumentService.getDocumentById.mockResolvedValue(existingDocument);
      mockDocumentService.deleteDocument.mockResolvedValue(true);
      
      // Act
      await documentController.deleteDocument(req, res);
      
      // Assert
      expect(mockDocumentService.getDocumentById).toHaveBeenCalledWith(documentId);
      expect(mockDocumentService.deleteDocument).toHaveBeenCalledWith(documentId);
      expect(res.json).toHaveBeenCalledWith({ message: 'Document deleted successfully' });
    });
    
    test('should return 404 when document is not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const documentId = '999';
      
      req.params = { id: documentId };
      
      mockDocumentService.getDocumentById.mockResolvedValue(null);
      
      // Act
      await documentController.deleteDocument(req, res);
      
      // Assert
      expect(mockDocumentService.getDocumentById).toHaveBeenCalledWith(documentId);
      expect(mockDocumentService.deleteDocument).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Document not found' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const documentId = '1';
      
      const errorMessage = 'Database error';
      
      req.params = { id: documentId };
      
      mockDocumentService.getDocumentById.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await documentController.deleteDocument(req, res);
      
      // Assert
      expect(mockDocumentService.getDocumentById).toHaveBeenCalledWith(documentId);
      expect(mockDocumentService.deleteDocument).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while deleting document' });
    });
  });
  
  describe('downloadDocument', () => {
    test('should download a document', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const documentId = '1';
      
      const existingDocument = {
        id: 1,
        name: 'document1.pdf',
        mime_type: 'application/pdf',
        entity_type: 'contact',
        entity_id: 1
      };
      
      const downloadResult = {
        file: existingDocument,
        buffer: Buffer.from('test')
      };
      
      req.params = { id: documentId };
      
      mockDocumentService.getDocumentById.mockResolvedValue(existingDocument);
      mockDocumentService.downloadDocument.mockResolvedValue(downloadResult);
      
      // Act
      await documentController.downloadDocument(req, res);
      
      // Assert
      expect(mockDocumentService.getDocumentById).toHaveBeenCalledWith(documentId);
      expect(mockDocumentService.downloadDocument).toHaveBeenCalledWith(documentId);
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="document1.pdf"',
        'Content-Length': 4
      });
      expect(res.send).toHaveBeenCalledWith(Buffer.from('test'));
    });
    
    test('should return 404 when document is not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const documentId = '999';
      
      req.params = { id: documentId };
      
      mockDocumentService.getDocumentById.mockResolvedValue(null);
      
      // Act
      await documentController.downloadDocument(req, res);
      
      // Assert
      expect(mockDocumentService.getDocumentById).toHaveBeenCalledWith(documentId);
      expect(mockDocumentService.downloadDocument).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Document not found' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const documentId = '1';
      
      const existingDocument = {
        id: 1,
        name: 'document1.pdf',
        mime_type: 'application/pdf',
        entity_type: 'contact',
        entity_id: 1
      };
      
      const errorMessage = 'Storage error';
      
      req.params = { id: documentId };
      
      mockDocumentService.getDocumentById.mockResolvedValue(existingDocument);
      mockDocumentService.downloadDocument.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await documentController.downloadDocument(req, res);
      
      // Assert
      expect(mockDocumentService.getDocumentById).toHaveBeenCalledWith(documentId);
      expect(mockDocumentService.downloadDocument).toHaveBeenCalledWith(documentId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while downloading document' });
    });
  });
});
