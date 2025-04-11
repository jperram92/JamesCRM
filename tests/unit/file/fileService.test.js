/**
 * Unit tests for file service
 */

describe('File Service', () => {
  // Mock dependencies
  const mockFileRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    delete: jest.fn()
  };

  const mockStorageProvider = {
    uploadFile: jest.fn(),
    downloadFile: jest.fn(),
    deleteFile: jest.fn()
  };

  // Mock file service
  const fileService = {
    getAllFiles: async () => {
      return await mockFileRepository.findAll();
    },

    getFileById: async (id) => {
      const file = await mockFileRepository.findById(id);

      if (!file) {
        throw new Error('File not found');
      }

      return file;
    },

    uploadFile: async (fileData, buffer) => {
      const { name, mime_type, entity_type, entity_id, uploaded_by } = fileData;

      if (!name) {
        throw new Error('File name is required');
      }

      if (!entity_type || !entity_id) {
        throw new Error('Entity information is required');
      }

      if (!uploaded_by) {
        throw new Error('Uploader information is required');
      }

      if (!buffer || buffer.length === 0) {
        throw new Error('File content is required');
      }

      // Generate storage path
      const storage_path = `${entity_type}s/${entity_id}/${name}`;

      // Upload to storage provider
      await mockStorageProvider.uploadFile(storage_path, buffer, mime_type);

      // Create file record in database
      const file = await mockFileRepository.create({
        name,
        mime_type,
        size: buffer.length,
        entity_type,
        entity_id,
        uploaded_by,
        storage_path
      });

      return file;
    },

    downloadFile: async (id) => {
      const file = await mockFileRepository.findById(id);

      if (!file) {
        throw new Error('File not found');
      }

      const buffer = await mockStorageProvider.downloadFile(file.storage_path);

      return {
        file,
        buffer
      };
    },

    deleteFile: async (id) => {
      const file = await mockFileRepository.findById(id);

      if (!file) {
        throw new Error('File not found');
      }

      // Delete from storage provider
      await mockStorageProvider.deleteFile(file.storage_path);

      // Delete file record from database
      await mockFileRepository.delete(id);

      return true;
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockFileRepository.findAll.mockReset();
    mockFileRepository.findById.mockReset();
    mockFileRepository.create.mockReset();
    mockFileRepository.delete.mockReset();
    mockStorageProvider.uploadFile.mockReset();
    mockStorageProvider.downloadFile.mockReset();
    mockStorageProvider.deleteFile.mockReset();

    // Default mock implementations
    mockFileRepository.findAll.mockResolvedValue([
      {
        id: 'file-1',
        name: 'document.pdf',
        mime_type: 'application/pdf',
        size: 1024,
        entity_type: 'contact',
        entity_id: 1,
        uploaded_by: 1,
        storage_path: 'contacts/1/document.pdf',
        created_at: new Date('2023-01-01T00:00:00Z')
      },
      {
        id: 'file-2',
        name: 'image.jpg',
        mime_type: 'image/jpeg',
        size: 2048,
        entity_type: 'company',
        entity_id: 1,
        uploaded_by: 1,
        storage_path: 'companies/1/image.jpg',
        created_at: new Date('2023-01-02T00:00:00Z')
      }
    ]);

    mockFileRepository.findById.mockImplementation((id) => {
      if (id === 'file-1') {
        return {
          id: 'file-1',
          name: 'document.pdf',
          mime_type: 'application/pdf',
          size: 1024,
          entity_type: 'contact',
          entity_id: 1,
          uploaded_by: 1,
          storage_path: 'contacts/1/document.pdf',
          created_at: new Date('2023-01-01T00:00:00Z')
        };
      }

      if (id === 'file-2') {
        return {
          id: 'file-2',
          name: 'image.jpg',
          mime_type: 'image/jpeg',
          size: 2048,
          entity_type: 'company',
          entity_id: 1,
          uploaded_by: 1,
          storage_path: 'companies/1/image.jpg',
          created_at: new Date('2023-01-02T00:00:00Z')
        };
      }

      return null;
    });

    mockFileRepository.create.mockImplementation((fileData) => ({
      id: 'file-3',
      ...fileData,
      created_at: new Date()
    }));

    mockFileRepository.delete.mockResolvedValue(true);

    mockStorageProvider.uploadFile.mockResolvedValue(true);

    mockStorageProvider.downloadFile.mockImplementation((path) => {
      if (path === 'contacts/1/document.pdf') {
        return Buffer.from('PDF content');
      }

      if (path === 'companies/1/image.jpg') {
        return Buffer.from('Image content');
      }

      return Buffer.from('');
    });

    mockStorageProvider.deleteFile.mockResolvedValue(true);
  });

  describe('getAllFiles', () => {
    test('should return all files', async () => {
      // Act
      const result = await fileService.getAllFiles();

      // Assert
      expect(mockFileRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('file-1');
      expect(result[1].id).toBe('file-2');
    });
  });

  describe('getFileById', () => {
    test('should return file by ID', async () => {
      // Arrange
      const fileId = 'file-1';

      // Act
      const result = await fileService.getFileById(fileId);

      // Assert
      expect(mockFileRepository.findById).toHaveBeenCalledWith(fileId);
      expect(result).toEqual({
        id: fileId,
        name: 'document.pdf',
        mime_type: 'application/pdf',
        size: 1024,
        entity_type: 'contact',
        entity_id: 1,
        uploaded_by: 1,
        storage_path: 'contacts/1/document.pdf',
        created_at: expect.any(Date)
      });
    });

    test('should throw error when file is not found', async () => {
      // Arrange
      const fileId = 'nonexistent';

      // Act & Assert
      await expect(fileService.getFileById(fileId)).rejects.toThrow('File not found');
      expect(mockFileRepository.findById).toHaveBeenCalledWith(fileId);
    });
  });

  describe('uploadFile', () => {
    test('should upload a file successfully', async () => {
      // Arrange
      const fileData = {
        name: 'newfile.txt',
        mime_type: 'text/plain',
        entity_type: 'contact',
        entity_id: 2,
        uploaded_by: 1
      };
      const buffer = Buffer.from('File content');

      // Act
      const result = await fileService.uploadFile(fileData, buffer);

      // Assert
      expect(mockStorageProvider.uploadFile).toHaveBeenCalledWith(
        'contacts/2/newfile.txt',
        buffer,
        'text/plain'
      );

      expect(mockFileRepository.create).toHaveBeenCalledWith({
        name: 'newfile.txt',
        mime_type: 'text/plain',
        size: buffer.length,
        entity_type: 'contact',
        entity_id: 2,
        uploaded_by: 1,
        storage_path: 'contacts/2/newfile.txt'
      });

      expect(result).toEqual({
        id: 'file-3',
        name: 'newfile.txt',
        mime_type: 'text/plain',
        size: buffer.length,
        entity_type: 'contact',
        entity_id: 2,
        uploaded_by: 1,
        storage_path: 'contacts/2/newfile.txt',
        created_at: expect.any(Date)
      });
    });

    test('should throw error when file name is missing', async () => {
      // Arrange
      const fileData = {
        mime_type: 'text/plain',
        entity_type: 'contact',
        entity_id: 2,
        uploaded_by: 1
      };
      const buffer = Buffer.from('File content');

      // Act & Assert
      await expect(fileService.uploadFile(fileData, buffer)).rejects.toThrow('File name is required');
      expect(mockStorageProvider.uploadFile).not.toHaveBeenCalled();
      expect(mockFileRepository.create).not.toHaveBeenCalled();
    });

    test('should throw error when entity information is missing', async () => {
      // Arrange
      const fileData = {
        name: 'newfile.txt',
        mime_type: 'text/plain',
        uploaded_by: 1
      };
      const buffer = Buffer.from('File content');

      // Act & Assert
      await expect(fileService.uploadFile(fileData, buffer)).rejects.toThrow('Entity information is required');
      expect(mockStorageProvider.uploadFile).not.toHaveBeenCalled();
      expect(mockFileRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('downloadFile', () => {
    test('should download a file successfully', async () => {
      // Arrange
      const fileId = 'file-1';

      // Act
      const result = await fileService.downloadFile(fileId);

      // Assert
      expect(mockFileRepository.findById).toHaveBeenCalledWith(fileId);
      expect(mockStorageProvider.downloadFile).toHaveBeenCalledWith('contacts/1/document.pdf');

      expect(result).toEqual({
        file: {
          id: fileId,
          name: 'document.pdf',
          mime_type: 'application/pdf',
          size: 1024,
          entity_type: 'contact',
          entity_id: 1,
          uploaded_by: 1,
          storage_path: 'contacts/1/document.pdf',
          created_at: expect.any(Date)
        },
        buffer: Buffer.from('PDF content')
      });
    });

    test('should throw error when file is not found', async () => {
      // Arrange
      const fileId = 'nonexistent';

      // Act & Assert
      await expect(fileService.downloadFile(fileId)).rejects.toThrow('File not found');
      expect(mockFileRepository.findById).toHaveBeenCalledWith(fileId);
      expect(mockStorageProvider.downloadFile).not.toHaveBeenCalled();
    });
  });

  describe('deleteFile', () => {
    test('should delete a file successfully', async () => {
      // Arrange
      const fileId = 'file-1';

      // Act
      const result = await fileService.deleteFile(fileId);

      // Assert
      expect(mockFileRepository.findById).toHaveBeenCalledWith(fileId);
      expect(mockStorageProvider.deleteFile).toHaveBeenCalledWith('contacts/1/document.pdf');
      expect(mockFileRepository.delete).toHaveBeenCalledWith(fileId);
      expect(result).toBe(true);
    });

    test('should throw error when file is not found', async () => {
      // Arrange
      const fileId = 'nonexistent';

      // Act & Assert
      await expect(fileService.deleteFile(fileId)).rejects.toThrow('File not found');
      expect(mockFileRepository.findById).toHaveBeenCalledWith(fileId);
      expect(mockStorageProvider.deleteFile).not.toHaveBeenCalled();
      expect(mockFileRepository.delete).not.toHaveBeenCalled();
    });
  });
});
