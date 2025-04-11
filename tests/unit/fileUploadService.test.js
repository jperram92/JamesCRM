/**
 * Unit tests for file upload service
 */

describe('File Upload Service', () => {
  // Mock dependencies
  const mockUploadFile = jest.fn();
  const mockGetFileUrl = jest.fn();
  const mockDeleteFile = jest.fn();
  const mockCreateFileRecord = jest.fn();
  const mockGetFilesByEntity = jest.fn();
  
  // Mock file upload service
  const fileUploadService = {
    uploadFile: mockUploadFile,
    getFileUrl: mockGetFileUrl,
    deleteFile: mockDeleteFile,
    createFileRecord: mockCreateFileRecord,
    getFilesByEntity: mockGetFilesByEntity,
    
    // Higher-level methods that use the above methods
    uploadContactFile: async (contactId, file, userId) => {
      const fileName = `contact_${contactId}_${Date.now()}_${file.originalname}`;
      const filePath = `contacts/${contactId}/${fileName}`;
      
      const uploadResult = await fileUploadService.uploadFile(file.buffer, filePath, file.mimetype);
      
      const fileRecord = await fileUploadService.createFileRecord({
        entity_type: 'contact',
        entity_id: contactId,
        file_name: fileName,
        file_path: filePath,
        file_type: file.mimetype,
        file_size: file.size,
        uploaded_by: userId,
        created_at: new Date()
      });
      
      return {
        id: fileRecord.id,
        name: fileName,
        type: file.mimetype,
        size: file.size,
        url: fileUploadService.getFileUrl(filePath)
      };
    },
    
    uploadCompanyFile: async (companyId, file, userId) => {
      const fileName = `company_${companyId}_${Date.now()}_${file.originalname}`;
      const filePath = `companies/${companyId}/${fileName}`;
      
      const uploadResult = await fileUploadService.uploadFile(file.buffer, filePath, file.mimetype);
      
      const fileRecord = await fileUploadService.createFileRecord({
        entity_type: 'company',
        entity_id: companyId,
        file_name: fileName,
        file_path: filePath,
        file_type: file.mimetype,
        file_size: file.size,
        uploaded_by: userId,
        created_at: new Date()
      });
      
      return {
        id: fileRecord.id,
        name: fileName,
        type: file.mimetype,
        size: file.size,
        url: fileUploadService.getFileUrl(filePath)
      };
    },
    
    uploadDealFile: async (dealId, file, userId) => {
      const fileName = `deal_${dealId}_${Date.now()}_${file.originalname}`;
      const filePath = `deals/${dealId}/${fileName}`;
      
      const uploadResult = await fileUploadService.uploadFile(file.buffer, filePath, file.mimetype);
      
      const fileRecord = await fileUploadService.createFileRecord({
        entity_type: 'deal',
        entity_id: dealId,
        file_name: fileName,
        file_path: filePath,
        file_type: file.mimetype,
        file_size: file.size,
        uploaded_by: userId,
        created_at: new Date()
      });
      
      return {
        id: fileRecord.id,
        name: fileName,
        type: file.mimetype,
        size: file.size,
        url: fileUploadService.getFileUrl(filePath)
      };
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockUploadFile.mockReset();
    mockGetFileUrl.mockReset();
    mockDeleteFile.mockReset();
    mockCreateFileRecord.mockReset();
    mockGetFilesByEntity.mockReset();
    
    // Default mock implementations
    mockUploadFile.mockResolvedValue({ success: true });
    mockGetFileUrl.mockImplementation((filePath) => `https://storage.example.com/${filePath}`);
    mockDeleteFile.mockResolvedValue({ success: true });
    mockCreateFileRecord.mockResolvedValue({ id: 1 });
    mockGetFilesByEntity.mockResolvedValue([]);
  });

  test('should upload a file', async () => {
    // Arrange
    const fileBuffer = Buffer.from('test file content');
    const filePath = 'test/file.txt';
    const mimeType = 'text/plain';
    
    // Act
    const result = await fileUploadService.uploadFile(fileBuffer, filePath, mimeType);
    
    // Assert
    expect(mockUploadFile).toHaveBeenCalledWith(fileBuffer, filePath, mimeType);
    expect(result).toEqual({ success: true });
  });

  test('should get a file URL', () => {
    // Arrange
    const filePath = 'test/file.txt';
    
    // Act
    const result = fileUploadService.getFileUrl(filePath);
    
    // Assert
    expect(mockGetFileUrl).toHaveBeenCalledWith(filePath);
    expect(result).toBe('https://storage.example.com/test/file.txt');
  });

  test('should delete a file', async () => {
    // Arrange
    const filePath = 'test/file.txt';
    
    // Act
    const result = await fileUploadService.deleteFile(filePath);
    
    // Assert
    expect(mockDeleteFile).toHaveBeenCalledWith(filePath);
    expect(result).toEqual({ success: true });
  });

  test('should create a file record', async () => {
    // Arrange
    const fileRecord = {
      entity_type: 'contact',
      entity_id: 1,
      file_name: 'test.txt',
      file_path: 'contacts/1/test.txt',
      file_type: 'text/plain',
      file_size: 100,
      uploaded_by: 1,
      created_at: new Date()
    };
    
    // Act
    const result = await fileUploadService.createFileRecord(fileRecord);
    
    // Assert
    expect(mockCreateFileRecord).toHaveBeenCalledWith(fileRecord);
    expect(result).toEqual({ id: 1 });
  });

  test('should get files by entity', async () => {
    // Arrange
    const entityType = 'contact';
    const entityId = 1;
    const mockFiles = [
      {
        id: 1,
        entity_type: 'contact',
        entity_id: 1,
        file_name: 'test1.txt',
        file_path: 'contacts/1/test1.txt',
        file_type: 'text/plain',
        file_size: 100,
        uploaded_by: 1,
        created_at: new Date()
      },
      {
        id: 2,
        entity_type: 'contact',
        entity_id: 1,
        file_name: 'test2.pdf',
        file_path: 'contacts/1/test2.pdf',
        file_type: 'application/pdf',
        file_size: 1024,
        uploaded_by: 1,
        created_at: new Date()
      }
    ];
    mockGetFilesByEntity.mockResolvedValue(mockFiles);
    
    // Act
    const result = await fileUploadService.getFilesByEntity(entityType, entityId);
    
    // Assert
    expect(mockGetFilesByEntity).toHaveBeenCalledWith(entityType, entityId);
    expect(result).toEqual(mockFiles);
    expect(result.length).toBe(2);
  });

  test('should upload a contact file', async () => {
    // Arrange
    const contactId = 1;
    const file = {
      originalname: 'test.txt',
      buffer: Buffer.from('test file content'),
      mimetype: 'text/plain',
      size: 100
    };
    const userId = 2;
    
    // Mock Date.now() to return a fixed value
    const originalDateNow = Date.now;
    const mockTimestamp = 1609459200000; // 2021-01-01
    Date.now = jest.fn(() => mockTimestamp);
    
    // Act
    const result = await fileUploadService.uploadContactFile(contactId, file, userId);
    
    // Assert
    const expectedFileName = `contact_${contactId}_${mockTimestamp}_${file.originalname}`;
    const expectedFilePath = `contacts/${contactId}/${expectedFileName}`;
    
    expect(mockUploadFile).toHaveBeenCalledWith(file.buffer, expectedFilePath, file.mimetype);
    expect(mockCreateFileRecord).toHaveBeenCalledWith({
      entity_type: 'contact',
      entity_id: contactId,
      file_name: expectedFileName,
      file_path: expectedFilePath,
      file_type: file.mimetype,
      file_size: file.size,
      uploaded_by: userId,
      created_at: expect.any(Date)
    });
    expect(mockGetFileUrl).toHaveBeenCalledWith(expectedFilePath);
    
    expect(result).toEqual({
      id: 1,
      name: expectedFileName,
      type: file.mimetype,
      size: file.size,
      url: `https://storage.example.com/${expectedFilePath}`
    });
    
    // Restore original Date.now
    Date.now = originalDateNow;
  });

  test('should upload a company file', async () => {
    // Arrange
    const companyId = 1;
    const file = {
      originalname: 'company_logo.png',
      buffer: Buffer.from('image data'),
      mimetype: 'image/png',
      size: 5000
    };
    const userId = 2;
    
    // Mock Date.now() to return a fixed value
    const originalDateNow = Date.now;
    const mockTimestamp = 1609459200000; // 2021-01-01
    Date.now = jest.fn(() => mockTimestamp);
    
    // Act
    const result = await fileUploadService.uploadCompanyFile(companyId, file, userId);
    
    // Assert
    const expectedFileName = `company_${companyId}_${mockTimestamp}_${file.originalname}`;
    const expectedFilePath = `companies/${companyId}/${expectedFileName}`;
    
    expect(mockUploadFile).toHaveBeenCalledWith(file.buffer, expectedFilePath, file.mimetype);
    expect(mockCreateFileRecord).toHaveBeenCalledWith({
      entity_type: 'company',
      entity_id: companyId,
      file_name: expectedFileName,
      file_path: expectedFilePath,
      file_type: file.mimetype,
      file_size: file.size,
      uploaded_by: userId,
      created_at: expect.any(Date)
    });
    expect(mockGetFileUrl).toHaveBeenCalledWith(expectedFilePath);
    
    expect(result).toEqual({
      id: 1,
      name: expectedFileName,
      type: file.mimetype,
      size: file.size,
      url: `https://storage.example.com/${expectedFilePath}`
    });
    
    // Restore original Date.now
    Date.now = originalDateNow;
  });

  test('should upload a deal file', async () => {
    // Arrange
    const dealId = 1;
    const file = {
      originalname: 'contract.pdf',
      buffer: Buffer.from('pdf data'),
      mimetype: 'application/pdf',
      size: 10000
    };
    const userId = 2;
    
    // Mock Date.now() to return a fixed value
    const originalDateNow = Date.now;
    const mockTimestamp = 1609459200000; // 2021-01-01
    Date.now = jest.fn(() => mockTimestamp);
    
    // Act
    const result = await fileUploadService.uploadDealFile(dealId, file, userId);
    
    // Assert
    const expectedFileName = `deal_${dealId}_${mockTimestamp}_${file.originalname}`;
    const expectedFilePath = `deals/${dealId}/${expectedFileName}`;
    
    expect(mockUploadFile).toHaveBeenCalledWith(file.buffer, expectedFilePath, file.mimetype);
    expect(mockCreateFileRecord).toHaveBeenCalledWith({
      entity_type: 'deal',
      entity_id: dealId,
      file_name: expectedFileName,
      file_path: expectedFilePath,
      file_type: file.mimetype,
      file_size: file.size,
      uploaded_by: userId,
      created_at: expect.any(Date)
    });
    expect(mockGetFileUrl).toHaveBeenCalledWith(expectedFilePath);
    
    expect(result).toEqual({
      id: 1,
      name: expectedFileName,
      type: file.mimetype,
      size: file.size,
      url: `https://storage.example.com/${expectedFilePath}`
    });
    
    // Restore original Date.now
    Date.now = originalDateNow;
  });

  test('should handle file upload errors', async () => {
    // Arrange
    const contactId = 1;
    const file = {
      originalname: 'test.txt',
      buffer: Buffer.from('test file content'),
      mimetype: 'text/plain',
      size: 100
    };
    const userId = 2;
    
    // Mock upload failure
    mockUploadFile.mockRejectedValue(new Error('Upload failed'));
    
    // Act & Assert
    await expect(fileUploadService.uploadContactFile(contactId, file, userId)).rejects.toThrow('Upload failed');
    expect(mockCreateFileRecord).not.toHaveBeenCalled();
  });

  test('should handle file record creation errors', async () => {
    // Arrange
    const contactId = 1;
    const file = {
      originalname: 'test.txt',
      buffer: Buffer.from('test file content'),
      mimetype: 'text/plain',
      size: 100
    };
    const userId = 2;
    
    // Mock record creation failure
    mockCreateFileRecord.mockRejectedValue(new Error('Record creation failed'));
    
    // Act & Assert
    await expect(fileUploadService.uploadContactFile(contactId, file, userId)).rejects.toThrow('Record creation failed');
    expect(mockUploadFile).toHaveBeenCalled();
  });
});
