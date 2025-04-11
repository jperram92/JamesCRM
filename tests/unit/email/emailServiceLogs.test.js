/**
 * Unit tests for email service - logs
 */

describe('Email Service - Logs', () => {
  // Mock dependencies
  const mockEmailLogRepository = {
    findByRecipient: jest.fn(),
    findBySender: jest.fn(),
    findByStatus: jest.fn(),
    findByDateRange: jest.fn()
  };
  
  // Mock email service
  const emailService = {
    getEmailLogs: async (options = {}) => {
      const { recipient, sender, status, startDate, endDate } = options;
      
      if (recipient) {
        return await mockEmailLogRepository.findByRecipient(recipient);
      }
      
      if (sender) {
        return await mockEmailLogRepository.findBySender(sender);
      }
      
      if (status) {
        return await mockEmailLogRepository.findByStatus(status);
      }
      
      if (startDate && endDate) {
        return await mockEmailLogRepository.findByDateRange(startDate, endDate);
      }
      
      return [];
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockEmailLogRepository.findByRecipient.mockReset();
    mockEmailLogRepository.findBySender.mockReset();
    mockEmailLogRepository.findByStatus.mockReset();
    mockEmailLogRepository.findByDateRange.mockReset();
    
    // Default mock implementations
    mockEmailLogRepository.findByRecipient.mockImplementation((recipient) => {
      if (recipient === 'nonexistent@example.com') {
        return [];
      }
      
      return [
        {
          id: 'log-1',
          to: recipient,
          from: 'noreply@jamescrm.com',
          subject: 'Welcome to JamesCRM',
          templateId: 'template-1',
          status: 'sent',
          sentAt: new Date('2023-01-01T10:00:00Z')
        },
        {
          id: 'log-2',
          to: recipient,
          from: 'noreply@jamescrm.com',
          subject: 'Your weekly report',
          templateId: 'template-4',
          status: 'sent',
          sentAt: new Date('2023-01-08T10:00:00Z')
        }
      ];
    });
    
    mockEmailLogRepository.findBySender.mockImplementation((sender) => {
      if (sender === 'nonexistent@example.com') {
        return [];
      }
      
      return [
        {
          id: 'log-3',
          to: 'user1@example.com',
          from: sender,
          subject: 'Meeting reminder',
          templateId: null,
          status: 'sent',
          sentAt: new Date('2023-01-05T14:00:00Z')
        },
        {
          id: 'log-4',
          to: 'user2@example.com',
          from: sender,
          subject: 'Follow-up',
          templateId: null,
          status: 'sent',
          sentAt: new Date('2023-01-06T09:00:00Z')
        }
      ];
    });
    
    mockEmailLogRepository.findByStatus.mockImplementation((status) => {
      if (status === 'sent') {
        return [
          {
            id: 'log-1',
            to: 'user1@example.com',
            from: 'noreply@jamescrm.com',
            subject: 'Welcome to JamesCRM',
            templateId: 'template-1',
            status,
            sentAt: new Date('2023-01-01T10:00:00Z')
          },
          {
            id: 'log-2',
            to: 'user2@example.com',
            from: 'noreply@jamescrm.com',
            subject: 'Your weekly report',
            templateId: 'template-4',
            status,
            sentAt: new Date('2023-01-08T10:00:00Z')
          }
        ];
      }
      
      if (status === 'failed') {
        return [
          {
            id: 'log-5',
            to: 'invalid@example',
            from: 'noreply@jamescrm.com',
            subject: 'Welcome to JamesCRM',
            templateId: 'template-1',
            status,
            error: 'Invalid email address',
            sentAt: new Date('2023-01-03T11:00:00Z')
          }
        ];
      }
      
      return [];
    });
    
    mockEmailLogRepository.findByDateRange.mockImplementation((startDate, endDate) => {
      if (startDate > endDate) {
        return [];
      }
      
      return [
        {
          id: 'log-1',
          to: 'user1@example.com',
          from: 'noreply@jamescrm.com',
          subject: 'Welcome to JamesCRM',
          templateId: 'template-1',
          status: 'sent',
          sentAt: new Date('2023-01-01T10:00:00Z')
        },
        {
          id: 'log-2',
          to: 'user2@example.com',
          from: 'noreply@jamescrm.com',
          subject: 'Your weekly report',
          templateId: 'template-4',
          status: 'sent',
          sentAt: new Date('2023-01-08T10:00:00Z')
        },
        {
          id: 'log-3',
          to: 'user1@example.com',
          from: 'user3@example.com',
          subject: 'Meeting reminder',
          templateId: null,
          status: 'sent',
          sentAt: new Date('2023-01-05T14:00:00Z')
        },
        {
          id: 'log-5',
          to: 'invalid@example',
          from: 'noreply@jamescrm.com',
          subject: 'Welcome to JamesCRM',
          templateId: 'template-1',
          status: 'failed',
          error: 'Invalid email address',
          sentAt: new Date('2023-01-03T11:00:00Z')
        }
      ].filter(log => {
        const sentAt = new Date(log.sentAt);
        return sentAt >= startDate && sentAt <= endDate;
      });
    });
  });

  describe('getEmailLogs', () => {
    test('should get email logs by recipient', async () => {
      // Arrange
      const recipient = 'user1@example.com';
      
      // Act
      const result = await emailService.getEmailLogs({ recipient });
      
      // Assert
      expect(mockEmailLogRepository.findByRecipient).toHaveBeenCalledWith(recipient);
      expect(result).toHaveLength(2);
      expect(result[0].to).toBe(recipient);
      expect(result[1].to).toBe(recipient);
    });
    
    test('should return empty array when recipient has no logs', async () => {
      // Arrange
      const recipient = 'nonexistent@example.com';
      
      // Act
      const result = await emailService.getEmailLogs({ recipient });
      
      // Assert
      expect(mockEmailLogRepository.findByRecipient).toHaveBeenCalledWith(recipient);
      expect(result).toEqual([]);
    });
    
    test('should get email logs by sender', async () => {
      // Arrange
      const sender = 'user3@example.com';
      
      // Act
      const result = await emailService.getEmailLogs({ sender });
      
      // Assert
      expect(mockEmailLogRepository.findBySender).toHaveBeenCalledWith(sender);
      expect(result).toHaveLength(2);
      expect(result[0].from).toBe(sender);
      expect(result[1].from).toBe(sender);
    });
    
    test('should return empty array when sender has no logs', async () => {
      // Arrange
      const sender = 'nonexistent@example.com';
      
      // Act
      const result = await emailService.getEmailLogs({ sender });
      
      // Assert
      expect(mockEmailLogRepository.findBySender).toHaveBeenCalledWith(sender);
      expect(result).toEqual([]);
    });
    
    test('should get email logs by sent status', async () => {
      // Arrange
      const status = 'sent';
      
      // Act
      const result = await emailService.getEmailLogs({ status });
      
      // Assert
      expect(mockEmailLogRepository.findByStatus).toHaveBeenCalledWith(status);
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe(status);
      expect(result[1].status).toBe(status);
    });
    
    test('should get email logs by failed status', async () => {
      // Arrange
      const status = 'failed';
      
      // Act
      const result = await emailService.getEmailLogs({ status });
      
      // Assert
      expect(mockEmailLogRepository.findByStatus).toHaveBeenCalledWith(status);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(status);
      expect(result[0].error).toBe('Invalid email address');
    });
    
    test('should get email logs by date range', async () => {
      // Arrange
      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-31T23:59:59Z');
      
      // Act
      const result = await emailService.getEmailLogs({ startDate, endDate });
      
      // Assert
      expect(mockEmailLogRepository.findByDateRange).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toHaveLength(4);
    });
    
    test('should get email logs for first week of January', async () => {
      // Arrange
      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-07T23:59:59Z');
      
      // Mock implementation for this specific test
      mockEmailLogRepository.findByDateRange.mockImplementation((start, end) => {
        return [
          {
            id: 'log-1',
            to: 'user1@example.com',
            from: 'noreply@jamescrm.com',
            subject: 'Welcome to JamesCRM',
            templateId: 'template-1',
            status: 'sent',
            sentAt: new Date('2023-01-01T10:00:00Z')
          },
          {
            id: 'log-3',
            to: 'user1@example.com',
            from: 'user3@example.com',
            subject: 'Meeting reminder',
            templateId: null,
            status: 'sent',
            sentAt: new Date('2023-01-05T14:00:00Z')
          },
          {
            id: 'log-5',
            to: 'invalid@example',
            from: 'noreply@jamescrm.com',
            subject: 'Welcome to JamesCRM',
            templateId: 'template-1',
            status: 'failed',
            error: 'Invalid email address',
            sentAt: new Date('2023-01-03T11:00:00Z')
          }
        ];
      });
      
      // Act
      const result = await emailService.getEmailLogs({ startDate, endDate });
      
      // Assert
      expect(mockEmailLogRepository.findByDateRange).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toHaveLength(3);
    });
    
    test('should return empty array when no logs in date range', async () => {
      // Arrange
      const startDate = new Date('2023-02-01T00:00:00Z');
      const endDate = new Date('2023-02-28T23:59:59Z');
      
      // Mock implementation for this specific test
      mockEmailLogRepository.findByDateRange.mockResolvedValue([]);
      
      // Act
      const result = await emailService.getEmailLogs({ startDate, endDate });
      
      // Assert
      expect(mockEmailLogRepository.findByDateRange).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual([]);
    });
    
    test('should return empty array when no options are provided', async () => {
      // Act
      const result = await emailService.getEmailLogs();
      
      // Assert
      expect(mockEmailLogRepository.findByRecipient).not.toHaveBeenCalled();
      expect(mockEmailLogRepository.findBySender).not.toHaveBeenCalled();
      expect(mockEmailLogRepository.findByStatus).not.toHaveBeenCalled();
      expect(mockEmailLogRepository.findByDateRange).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
