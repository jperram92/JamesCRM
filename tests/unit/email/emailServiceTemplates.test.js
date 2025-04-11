/**
 * Unit tests for email service - template methods
 */

describe('Email Service - Template Methods', () => {
  // Mock dependencies
  const mockSendGrid = {
    send: jest.fn()
  };
  
  const mockTemplateRepository = {
    findByName: jest.fn()
  };
  
  const mockEmailLogRepository = {
    create: jest.fn()
  };
  
  // Mock email service
  const emailService = {
    sendEmail: jest.fn(),
    
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
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockSendGrid.send.mockReset();
    mockTemplateRepository.findByName.mockReset();
    mockEmailLogRepository.create.mockReset();
    emailService.sendEmail.mockReset();
    
    // Default mock implementations
    mockSendGrid.send.mockResolvedValue({ statusCode: 202 });
    
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
    
    emailService.sendEmail.mockResolvedValue({
      success: true,
      message: 'Email sent successfully'
    });
  });

  describe('sendTemplateEmail', () => {
    test('should send an email using a template', async () => {
      // Arrange
      const templateName = 'welcome';
      const to = 'recipient@example.com';
      const from = 'sender@example.com';
      const templateData = {
        name: 'John Doe'
      };
      
      // Act
      const result = await emailService.sendTemplateEmail(templateName, to, from, templateData);
      
      // Assert
      expect(mockTemplateRepository.findByName).toHaveBeenCalledWith(templateName);
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to,
        from,
        templateId: 'template-1',
        templateData
      });
      
      expect(result).toEqual({
        success: true,
        message: 'Email sent successfully'
      });
    });
    
    test('should throw error when template is not found', async () => {
      // Arrange
      const templateName = 'nonexistent-template';
      const to = 'recipient@example.com';
      const from = 'sender@example.com';
      const templateData = {
        name: 'John Doe'
      };
      
      mockTemplateRepository.findByName.mockResolvedValue(null);
      
      // Act & Assert
      await expect(emailService.sendTemplateEmail(templateName, to, from, templateData))
        .rejects.toThrow(`Email template '${templateName}' not found`);
      
      expect(mockTemplateRepository.findByName).toHaveBeenCalledWith(templateName);
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });
  });
  
  describe('sendInvitation', () => {
    test('should send an invitation email', async () => {
      // Arrange
      const email = 'newuser@example.com';
      const invitationToken = 'invitation-token-123';
      
      // Act
      const result = await emailService.sendInvitation(email, invitationToken);
      
      // Assert
      expect(mockTemplateRepository.findByName).toHaveBeenCalledWith('user-invitation');
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: email,
        from: 'noreply@jamescrm.com',
        templateId: 'template-2',
        templateData: {
          invitationLink: `https://jamescrm.com/accept-invitation?token=${invitationToken}`,
          expiresIn: '7 days'
        }
      });
      
      expect(result).toEqual({
        success: true,
        message: 'Email sent successfully'
      });
    });
  });
  
  describe('sendPasswordReset', () => {
    test('should send a password reset email', async () => {
      // Arrange
      const email = 'user@example.com';
      const resetToken = 'reset-token-123';
      
      // Act
      const result = await emailService.sendPasswordReset(email, resetToken);
      
      // Assert
      expect(mockTemplateRepository.findByName).toHaveBeenCalledWith('password-reset');
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: email,
        from: 'noreply@jamescrm.com',
        templateId: 'template-3',
        templateData: {
          resetLink: `https://jamescrm.com/reset-password?token=${resetToken}`,
          expiresIn: '1 hour'
        }
      });
      
      expect(result).toEqual({
        success: true,
        message: 'Email sent successfully'
      });
    });
  });
  
  describe('sendWelcome', () => {
    test('should send a welcome email', async () => {
      // Arrange
      const email = 'newuser@example.com';
      const name = 'John Doe';
      
      // Act
      const result = await emailService.sendWelcome(email, name);
      
      // Assert
      expect(mockTemplateRepository.findByName).toHaveBeenCalledWith('welcome');
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: email,
        from: 'noreply@jamescrm.com',
        templateId: 'template-1',
        templateData: {
          name,
          loginLink: 'https://jamescrm.com/login'
        }
      });
      
      expect(result).toEqual({
        success: true,
        message: 'Email sent successfully'
      });
    });
  });
});
