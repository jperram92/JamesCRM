/**
 * Unit tests for email service
 */

describe('Email Service', () => {
  // Mock dependencies
  const mockSendGrid = {
    setApiKey: jest.fn(),
    send: jest.fn()
  };
  
  const mockTemplateRepository = {
    findById: jest.fn(),
    findByName: jest.fn()
  };
  
  const mockEmailLogRepository = {
    create: jest.fn(),
    findByRecipient: jest.fn(),
    findBySender: jest.fn(),
    findByStatus: jest.fn(),
    findByDateRange: jest.fn()
  };
  
  // Mock email service
  const emailService = {
    initialize: (apiKey) => {
      mockSendGrid.setApiKey(apiKey);
      return true;
    },
    
    sendEmail: async (emailData) => {
      const { to, from, subject, text, html, templateId, templateData } = emailData;
      
      let emailContent = {};
      
      if (templateId) {
        const template = await mockTemplateRepository.findById(templateId);
        
        if (!template) {
          throw new Error('Email template not found');
        }
        
        emailContent = {
          templateId,
          dynamicTemplateData: templateData
        };
      } else {
        emailContent = {
          subject,
          text,
          html
        };
      }
      
      const message = {
        to,
        from,
        ...emailContent
      };
      
      try {
        await mockSendGrid.send(message);
        
        await mockEmailLogRepository.create({
          to,
          from,
          subject: subject || 'Template Email',
          templateId,
          status: 'sent',
          sentAt: new Date()
        });
        
        return { success: true, message: 'Email sent successfully' };
      } catch (error) {
        await mockEmailLogRepository.create({
          to,
          from,
          subject: subject || 'Template Email',
          templateId,
          status: 'failed',
          error: error.message,
          sentAt: new Date()
        });
        
        throw new Error(`Failed to send email: ${error.message}`);
      }
    },
    
    sendTemplateEmail: async (templateName, to, from, templateData) => {
      const template = await mockTemplateRepository.findByName(templateName);
      
      if (!template) {
        throw new Error(`Email template '${templateName}' not found`);
      }
      
      return await emailService.sendEmail({
        to,
        from,
        templateId: template.id,
        templateData
      });
    },
    
    sendInvitation: async (email, invitationToken) => {
      return await emailService.sendTemplateEmail(
        'user-invitation',
        email,
        'noreply@jamescrm.com',
        {
          invitationLink: `https://jamescrm.com/accept-invitation?token=${invitationToken}`,
          expiresIn: '7 days'
        }
      );
    },
    
    sendPasswordReset: async (email, resetToken) => {
      return await emailService.sendTemplateEmail(
        'password-reset',
        email,
        'noreply@jamescrm.com',
        {
          resetLink: `https://jamescrm.com/reset-password?token=${resetToken}`,
          expiresIn: '1 hour'
        }
      );
    },
    
    sendWelcome: async (email, name) => {
      return await emailService.sendTemplateEmail(
        'welcome',
        email,
        'noreply@jamescrm.com',
        {
          name,
          loginLink: 'https://jamescrm.com/login'
        }
      );
    },
    
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
    mockSendGrid.setApiKey.mockReset();
    mockSendGrid.send.mockReset();
    mockTemplateRepository.findById.mockReset();
    mockTemplateRepository.findByName.mockReset();
    mockEmailLogRepository.create.mockReset();
    mockEmailLogRepository.findByRecipient.mockReset();
    mockEmailLogRepository.findBySender.mockReset();
    mockEmailLogRepository.findByStatus.mockReset();
    mockEmailLogRepository.findByDateRange.mockReset();
    
    // Default mock implementations
    mockSendGrid.setApiKey.mockReturnValue(undefined);
    mockSendGrid.send.mockResolvedValue({ statusCode: 202 });
    
    mockTemplateRepository.findById.mockImplementation((id) => {
      if (id === 'template-1') {
        return {
          id,
          name: 'welcome',
          subject: 'Welcome to JamesCRM',
          content: '<p>Welcome {{name}}!</p>'
        };
      }
      
      if (id === 'template-2') {
        return {
          id,
          name: 'user-invitation',
          subject: 'You have been invited to JamesCRM',
          content: '<p>Click <a href="{{invitationLink}}">here</a> to accept the invitation.</p>'
        };
      }
      
      if (id === 'template-3') {
        return {
          id,
          name: 'password-reset',
          subject: 'Reset your JamesCRM password',
          content: '<p>Click <a href="{{resetLink}}">here</a> to reset your password.</p>'
        };
      }
      
      return null;
    });
    
    mockTemplateRepository.findByName.mockImplementation((name) => {
      if (name === 'welcome') {
        return {
          id: 'template-1',
          name,
          subject: 'Welcome to JamesCRM',
          content: '<p>Welcome {{name}}!</p>'
        };
      }
      
      if (name === 'user-invitation') {
        return {
          id: 'template-2',
          name,
          subject: 'You have been invited to JamesCRM',
          content: '<p>Click <a href="{{invitationLink}}">here</a> to accept the invitation.</p>'
        };
      }
      
      if (name === 'password-reset') {
        return {
          id: 'template-3',
          name,
          subject: 'Reset your JamesCRM password',
          content: '<p>Click <a href="{{resetLink}}">here</a> to reset your password.</p>'
        };
      }
      
      return null;
    });
    
    mockEmailLogRepository.create.mockImplementation((logData) => ({
      id: 'log-123',
      ...logData
    }));
    
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

  describe('initialize', () => {
    test('should initialize the email service with API key', () => {
      // Arrange
      const apiKey = 'SG.test-api-key';
      
      // Act
      const result = emailService.initialize(apiKey);
      
      // Assert
      expect(mockSendGrid.setApiKey).toHaveBeenCalledWith(apiKey);
      expect(result).toBe(true);
    });
  });
  
  describe('sendEmail', () => {
    test('should send a simple email successfully', async () => {
      // Arrange
      const emailData = {
        to: 'recipient@example.com',
        from: 'sender@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
        html: '<p>This is a test email</p>'
      };
      
      // Act
      const result = await emailService.sendEmail(emailData);
      
      // Assert
      expect(mockSendGrid.send).toHaveBeenCalledWith({
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html
      });
      
      expect(mockEmailLogRepository.create).toHaveBeenCalledWith({
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        templateId: undefined,
        status: 'sent',
        sentAt: expect.any(Date)
      });
      
      expect(result).toEqual({
        success: true,
        message: 'Email sent successfully'
      });
    });
    
    test('should send a template email successfully', async () => {
      // Arrange
      const emailData = {
        to: 'recipient@example.com',
        from: 'sender@example.com',
        templateId: 'template-1',
        templateData: {
          name: 'John Doe'
        }
      };
      
      // Act
      const result = await emailService.sendEmail(emailData);
      
      // Assert
      expect(mockTemplateRepository.findById).toHaveBeenCalledWith(emailData.templateId);
      
      expect(mockSendGrid.send).toHaveBeenCalledWith({
        to: emailData.to,
        from: emailData.from,
        templateId: emailData.templateId,
        dynamicTemplateData: emailData.templateData
      });
      
      expect(mockEmailLogRepository.create).toHaveBeenCalledWith({
        to: emailData.to,
        from: emailData.from,
        subject: 'Template Email',
        templateId: emailData.templateId,
        status: 'sent',
        sentAt: expect.any(Date)
      });
      
      expect(result).toEqual({
        success: true,
        message: 'Email sent successfully'
      });
    });
    
    test('should throw error when template is not found', async () => {
      // Arrange
      const emailData = {
        to: 'recipient@example.com',
        from: 'sender@example.com',
        templateId: 'nonexistent-template',
        templateData: {
          name: 'John Doe'
        }
      };
      
      mockTemplateRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(emailService.sendEmail(emailData)).rejects.toThrow('Email template not found');
      expect(mockTemplateRepository.findById).toHaveBeenCalledWith(emailData.templateId);
      expect(mockSendGrid.send).not.toHaveBeenCalled();
      expect(mockEmailLogRepository.create).not.toHaveBeenCalled();
    });
    
    test('should handle send failure and log error', async () => {
      // Arrange
      const emailData = {
        to: 'recipient@example.com',
        from: 'sender@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
        html: '<p>This is a test email</p>'
      };
      
      const errorMessage = 'Failed to send email';
      mockSendGrid.send.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(emailService.sendEmail(emailData)).rejects.toThrow(`Failed to send email: ${errorMessage}`);
      
      expect(mockSendGrid.send).toHaveBeenCalledWith({
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html
      });
      
      expect(mockEmailLogRepository.create).toHaveBeenCalledWith({
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        templateId: undefined,
        status: 'failed',
        error: errorMessage,
        sentAt: expect.any(Date)
      });
    });
  });
});
