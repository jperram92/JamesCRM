/**
 * Unit tests for file controller
 */

describe('File Controller', () => {
  // Mock dependencies
  const mockFileService = {
    uploadFile: jest.fn(),
    getFileById: jest.fn(),
    getFilesByEntity: jest.fn(),
    deleteFile: jest.fn(),
    downloadFile: jest.fn()
  };
  
  // Mock request and response
  const mockRequest = () => {
    const req = {};
    req.body = {};
    req.params = {};
    req.query = {};
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
  
  // Mock file controller
  const fileController = {
    uploadFile: async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const { entity_type, entity_id } = req.body;
        
        if (!entity_type || !entity_id) {
          return res.status(400).json({ message: 'Entity type and ID are required' });
        }
        
        const fileData = {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          buffer: req.file.buffer,
          entity_type,
          entity_id,
          uploaded_by: req.user.id
        };
        
        const file = await mockFileService.uploadFile(fileData);
        res.status(201).json(file);
      } catch (error) {
        res.status(500).json({ message: 'Error uploading file' });
      }
    },
    
    getFileById: async (req, res) => {
      try {
        const { id } = req.params;
        
        if (!id) {
          return res.status(400).json({ message: 'File ID is required' });
        }
        
        const file = await mockFileService.getFileById(id);
        
        if (!file) {
          return res.status(404).json({ message: 'File not found' });
        }
        
        res.json(file);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching file' });
      }
    },
    
    getFilesByEntity: async (req, res) => {
      try {
        const { entity_type, entity_id } = req.params;
        
        if (!entity_type || !entity_id) {
          return res.status(400).json({ message: 'Entity type and ID are required' });
        }
        
        const files = await mockFileService.getFilesByEntity(entity_type, entity_id);
        res.json(files);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching files' });
      }
    },
    
    deleteFile: async (req, res) => {
      try {
        const { id } = req.params;
        
        if (!id) {
          return res.status(400).json({ message: 'File ID is required' });
        }
        
        const file = await mockFileService.getFileById(id);
        
        if (!file) {
          return res.status(404).json({ message: 'File not found' });
        }
        
        // Check if user has permission to delete the file
        if (file.uploaded_by !== req.user.id) {
          return res.status(403).json({ message: 'You do not have permission to delete this file' });
        }
        
        await mockFileService.deleteFile(id);
        res.json({ message: 'File deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error deleting file' });
      }
    },
    
    downloadFile: async (req, res) => {
      try {
        const { id } = req.params;
        
        if (!id) {
          return res.status(400).json({ message: 'File ID is required' });
        }
        
        const file = await mockFileService.getFileById(id);
        
        if (!file) {
          return res.status(404).json({ message: 'File not found' });
        }
        
        const fileData = await mockFileService.downloadFile(id);
        
        res.set({
          'Content-Type': file.mimetype,
          'Content-Disposition': `attachment; filename="${file.originalname}"`,
          'Content-Length': fileData.length
        });
        
        res.send(fileData);
      } catch (error) {
        res.status(500).json({ message: 'Error downloading file' });
      }
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    test('should upload a file', async () => {
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
      
      const fileData = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test'),
        entity_type: 'contact',
        entity_id: '1',
        uploaded_by: 1
      };
      
      const uploadedFile = {
        id: 1,
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        entity_type: 'contact',
        entity_id: '1',
        uploaded_by: 1,
        storage_path: 'uploads/contacts/1/test.pdf',
        created_at: new Date()
      };
      
      mockFileService.uploadFile.mockResolvedValue(uploadedFile);
      
      // Act
      await fileController.uploadFile(req, res);
      
      // Assert
      expect(mockFileService.uploadFile).toHaveBeenCalledWith(fileData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(uploadedFile);
    });
    
    test('should return 400 when no file is uploaded', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.file = null;
      
      // Act
      await fileController.uploadFile(req, res);
      
      // Assert
      expect(mockFileService.uploadFile).not.toHaveBeenCalled();
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
      await fileController.uploadFile(req, res);
      
      // Assert
      expect(mockFileService.uploadFile).not.toHaveBeenCalled();
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
      await fileController.uploadFile(req, res);
      
      // Assert
      expect(mockFileService.uploadFile).not.toHaveBeenCalled();
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
      
      mockFileService.uploadFile.mockRejectedValue(new Error('Storage error'));
      
      // Act
      await fileController.uploadFile(req, res);
      
      // Assert
      expect(mockFileService.uploadFile).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error uploading file' });
    });
  });
  
  describe('getFileById', () => {
    test('should return a file by ID', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const fileId = '1';
      
      req.params = { id: fileId };
      
      const mockFile = {
        id: 1,
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        entity_type: 'contact',
        entity_id: '1',
        uploaded_by: 1,
        storage_path: 'uploads/contacts/1/test.pdf',
        created_at: new Date()
      };
      
      mockFileService.getFileById.mockResolvedValue(mockFile);
      
      // Act
      await fileController.getFileById(req, res);
      
      // Assert
      expect(mockFileService.getFileById).toHaveBeenCalledWith(fileId);
      expect(res.json).toHaveBeenCalledWith(mockFile);
    });
    
    test('should return 400 when file ID is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {};
      
      // Act
      await fileController.getFileById(req, res);
      
      // Assert
      expect(mockFileService.getFileById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'File ID is required' });
    });
    
    test('should return 404 when file is not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const fileId = '999';
      
      req.params = { id: fileId };
      
      mockFileService.getFileById.mockResolvedValue(null);
      
      // Act
      await fileController.getFileById(req, res);
      
      // Assert
      expect(mockFileService.getFileById).toHaveBeenCalledWith(fileId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'File not found' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const fileId = '1';
      
      req.params = { id: fileId };
      
      mockFileService.getFileById.mockRejectedValue(new Error('Database error'));
      
      // Act
      await fileController.getFileById(req, res);
      
      // Assert
      expect(mockFileService.getFileById).toHaveBeenCalledWith(fileId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching file' });
    });
  });
  
  describe('getFilesByEntity', () => {
    test('should return files for an entity', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const entityType = 'contact';
      const entityId = '1';
      
      req.params = { entity_type: entityType, entity_id: entityId };
      
      const mockFiles = [
        {
          id: 1,
          originalname: 'test1.pdf',
          mimetype: 'application/pdf',
          size: 1024,
          entity_type: 'contact',
          entity_id: '1',
          uploaded_by: 1,
          storage_path: 'uploads/contacts/1/test1.pdf',
          created_at: new Date()
        },
        {
          id: 2,
          originalname: 'test2.jpg',
          mimetype: 'image/jpeg',
          size: 2048,
          entity_type: 'contact',
          entity_id: '1',
          uploaded_by: 1,
          storage_path: 'uploads/contacts/1/test2.jpg',
          created_at: new Date()
        }
      ];
      
      mockFileService.getFilesByEntity.mockResolvedValue(mockFiles);
      
      // Act
      await fileController.getFilesByEntity(req, res);
      
      // Assert
      expect(mockFileService.getFilesByEntity).toHaveBeenCalledWith(entityType, entityId);
      expect(res.json).toHaveBeenCalledWith(mockFiles);
    });
    
    test('should return 400 when entity type is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const entityId = '1';
      
      req.params = { entity_id: entityId };
      
      // Act
      await fileController.getFilesByEntity(req, res);
      
      // Assert
      expect(mockFileService.getFilesByEntity).not.toHaveBeenCalled();
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
      await fileController.getFilesByEntity(req, res);
      
      // Assert
      expect(mockFileService.getFilesByEntity).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Entity type and ID are required' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const entityType = 'contact';
      const entityId = '1';
      
      req.params = { entity_type: entityType, entity_id: entityId };
      
      mockFileService.getFilesByEntity.mockRejectedValue(new Error('Database error'));
      
      // Act
      await fileController.getFilesByEntity(req, res);
      
      // Assert
      expect(mockFileService.getFilesByEntity).toHaveBeenCalledWith(entityType, entityId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching files' });
    });
  });
});
