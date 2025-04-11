/**
 * Unit tests for file upload service
 */

describe('File Upload Service', () => {
  // Mock dependencies
  const mockStorageProvider = {
    uploadFile: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFile: jest.fn(),
    listFiles: jest.fn()
  };
  
  // Mock file upload service
  const fileUploadService = {
    initialize: (config) => {
      return true;
    },
    
    uploadFile: async (file, folder) => {
      if (!file) {
        throw new Error('File is required');
      }
      
      if (!folder) {
        throw new Error('Folder is required');
      }
      
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = `${folder}/${fileName}`;
      
      await mockStorageProvider.uploadFile(file.buffer, filePath, file.mimetype);
      
      return {
        path: filePath,
        url: await mockStorageProvider.getFileUrl(filePath)
      };
    },
    
    getFileUrl: async (filePath) => {
      if (!filePath) {
        throw new Error('File path is required');
      }
      
      return await mockStorageProvider.getFileUrl(filePath);
    },
    
    deleteFile: async (filePath) => {
      if (!filePath) {
        throw new Error('File path is required');
      }
      
      return await mockStorageProvider.deleteFile(filePath);
    },
    
    listFiles: async (folder) => {
      if (!folder) {
        throw new Error('Folder is required');
      }
      
      return await mockStorageProvider.listFiles(folder);
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockStorageProvider.uploadFile.mockReset();
    mockStorageProvider.getFileUrl.mockReset();
    mockStorageProvider.deleteFile.mockReset();
    mockStorageProvider.listFiles.mockReset();
    
    // Default mock implementations
    mockStorageProvider.uploadFile.mockResolvedValue(true);
    mockStorageProvider.getFileUrl.mockImplementation((path) => 
      `https://storage.example.com/${path}`
    );
    mockStorageProvider.deleteFile.mockResolvedValue(true);
    mockStorageProvider.listFiles.mockImplementation((folder) => {
      if (folder === 'documents') {
        return [
          {
            path: 'documents/contract.pdf',
            name: 'contract.pdf',
            size: 1024,
            contentType: 'application/pdf',
            lastModified: new Date('2023-01-01T00:00:00Z')
          },
          {
            path: 'documents/proposal.pdf',
            name: 'proposal.pdf',
            size: 2048,
            contentType: 'application/pdf',
            lastModified: new Date('2023-01-02T00:00:00Z')
          }
        ];
      }
      
      return [];
    });
    
    // Mock Date.now() to return a fixed timestamp
    jest.spyOn(Date, 'now').mockImplementation(() => 1672531200000); // 2023-01-01T00:00:00Z
  });

  afterEach(() => {
    // Restore Date.now()
    jest.restoreAllMocks();
  });

  describe('uploadFile', () => {
    test('should upload a file successfully', async () => {
      // Arrange
      const file = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test file content'),
        mimetype: 'application/pdf'
      };
      const folder = 'documents';
      
      // Act
      const result = await fileUploadService.uploadFile(file, folder);
      
      // Assert
      expect(mockStorageProvider.uploadFile).toHaveBeenCalledWith(
        file.buffer,
        'documents/1672531200000-test.pdf',
        'application/pdf'
      );
      
      expect(mockStorageProvider.getFileUrl).toHaveBeenCalledWith('documents/1672531200000-test.pdf');
      
      expect(result).toEqual({
        path: 'documents/1672531200000-test.pdf',
        url: 'https://storage.example.com/documents/1672531200000-test.pdf'
      });
    });
    
    test('should throw error when file is not provided', async () => {
      // Arrange
      const folder = 'documents';
      
      // Act & Assert
      await expect(fileUploadService.uploadFile(null, folder)).rejects.toThrow('File is required');
      expect(mockStorageProvider.uploadFile).not.toHaveBeenCalled();
      expect(mockStorageProvider.getFileUrl).not.toHaveBeenCalled();
    });
    
    test('should throw error when folder is not provided', async () => {
      // Arrange
      const file = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test file content'),
        mimetype: 'application/pdf'
      };
      
      // Act & Assert
      await expect(fileUploadService.uploadFile(file, null)).rejects.toThrow('Folder is required');
      expect(mockStorageProvider.uploadFile).not.toHaveBeenCalled();
      expect(mockStorageProvider.getFileUrl).not.toHaveBeenCalled();
    });
  });
  
  describe('getFileUrl', () => {
    test('should return URL for a file', async () => {
      // Arrange
      const filePath = 'documents/test.pdf';
      
      // Act
      const result = await fileUploadService.getFileUrl(filePath);
      
      // Assert
      expect(mockStorageProvider.getFileUrl).toHaveBeenCalledWith(filePath);
      expect(result).toBe('https://storage.example.com/documents/test.pdf');
    });
    
    test('should throw error when file path is not provided', async () => {
      // Act & Assert
      await expect(fileUploadService.getFileUrl(null)).rejects.toThrow('File path is required');
      expect(mockStorageProvider.getFileUrl).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteFile', () => {
    test('should delete a file successfully', async () => {
      // Arrange
      const filePath = 'documents/test.pdf';
      
      // Act
      const result = await fileUploadService.deleteFile(filePath);
      
      // Assert
      expect(mockStorageProvider.deleteFile).toHaveBeenCalledWith(filePath);
      expect(result).toBe(true);
    });
    
    test('should throw error when file path is not provided', async () => {
      // Act & Assert
      await expect(fileUploadService.deleteFile(null)).rejects.toThrow('File path is required');
      expect(mockStorageProvider.deleteFile).not.toHaveBeenCalled();
    });
  });
  
  describe('listFiles', () => {
    test('should list files in a folder', async () => {
      // Arrange
      const folder = 'documents';
      
      // Act
      const result = await fileUploadService.listFiles(folder);
      
      // Assert
      expect(mockStorageProvider.listFiles).toHaveBeenCalledWith(folder);
      expect(result).toHaveLength(2);
      expect(result[0].path).toBe('documents/contract.pdf');
      expect(result[1].path).toBe('documents/proposal.pdf');
    });
    
    test('should return empty array when folder has no files', async () => {
      // Arrange
      const folder = 'empty';
      
      // Act
      const result = await fileUploadService.listFiles(folder);
      
      // Assert
      expect(mockStorageProvider.listFiles).toHaveBeenCalledWith(folder);
      expect(result).toEqual([]);
    });
    
    test('should throw error when folder is not provided', async () => {
      // Act & Assert
      await expect(fileUploadService.listFiles(null)).rejects.toThrow('Folder is required');
      expect(mockStorageProvider.listFiles).not.toHaveBeenCalled();
    });
  });
});
