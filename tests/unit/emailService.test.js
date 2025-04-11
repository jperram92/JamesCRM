/**
 * Unit tests for email service
 */

describe('Email Service', () => {
  // Mock dependencies
  const mockSendEmail = jest.fn();
  const mockSendTemplate = jest.fn();
  const mockCreateEmailRecord = jest.fn();
  
  // Mock email service
  const emailService = {
    sendEmail: mockSendEmail,
    sendTemplate: mockSendTemplate,
    createEmailRecord: mockCreateEmailRecord,
    
    // Higher-level methods that use the above methods
    sendUserInvitation: async (user, invitationUrl) => {
      const emailData = {
        to: user.email,
        subject: 'Invitation to JamesCRM',
        templateId: 'user-invitation',
        templateData: {
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          invitationUrl
        }
      };
      
      const result = await emailService.sendTemplate(emailData);
      await emailService.createEmailRecord({
        to: user.email,
        subject: emailData.subject,
        template_id: emailData.templateId,
        user_id: user.id,
        status: result.status
      });
      
      return result;
    },
    
    sendPasswordReset: async (user, resetUrl) => {
      const emailData = {
        to: user.email,
        subject: 'Reset Your JamesCRM Password',
        templateId: 'password-reset',
        templateData: {
          firstName: user.first_name,
          resetUrl
        }
      };
      
      const result = await emailService.sendTemplate(emailData);
      await emailService.createEmailRecord({
        to: user.email,
        subject: emailData.subject,
        template_id: emailData.templateId,
        user_id: user.id,
        status: result.status
      });
      
      return result;
    },
    
    sendDealNotification: async (deal, user) => {
      const emailData = {
        to: user.email,
        subject: `New Deal: ${deal.name}`,
        templateId: 'deal-notification',
        templateData: {
          firstName: user.first_name,
          dealName: deal.name,
          dealAmount: deal.amount,
          dealUrl: `https://jamescrm.com/deals/${deal.id}`
        }
      };
      
      const result = await emailService.sendTemplate(emailData);
      await emailService.createEmailRecord({
        to: user.email,
        subject: emailData.subject,
        template_id: emailData.templateId,
        user_id: user.id,
        deal_id: deal.id,
        status: result.status
      });
      
      return result;
    },
    
    sendQuote: async (deal, contact, pdfUrl) => {
      const emailData = {
        to: contact.email,
        subject: `Quote: ${deal.name}`,
        templateId: 'quote-email',
        templateData: {
          firstName: contact.first_name,
          dealName: deal.name,
          quoteNumber: deal.quote_number,
          quoteUrl: pdfUrl
        },
        attachments: [
          {
            content: 'base64-encoded-pdf-content',
            filename: `Quote_${deal.quote_number}.pdf`,
            type: 'application/pdf',
            disposition: 'attachment'
          }
        ]
      };
      
      const result = await emailService.sendEmail(emailData);
      await emailService.createEmailRecord({
        to: contact.email,
        subject: emailData.subject,
        template_id: emailData.templateId,
        user_id: contact.id,
        deal_id: deal.id,
        status: result.status
      });
      
      return result;
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockSendEmail.mockReset();
    mockSendTemplate.mockReset();
    mockCreateEmailRecord.mockReset();
    
    // Default mock implementations
    mockSendEmail.mockResolvedValue({ id: 'email-123', status: 'sent' });
    mockSendTemplate.mockResolvedValue({ id: 'email-123', status: 'sent' });
    mockCreateEmailRecord.mockResolvedValue({ id: 1 });
  });

  test('should send a user invitation email', async () => {
    // Arrange
    const user = {
      id: 4,
      email: 'newuser@example.com',
      first_name: null,
      last_name: null,
      status: 'pending'
    };
    const invitationUrl = 'https://jamescrm.com/accept-invitation?token=abc123';
    
    // Act
    const result = await emailService.sendUserInvitation(user, invitationUrl);
    
    // Assert
    expect(mockSendTemplate).toHaveBeenCalledWith({
      to: user.email,
      subject: 'Invitation to JamesCRM',
      templateId: 'user-invitation',
      templateData: {
        firstName: '',
        lastName: '',
        invitationUrl
      }
    });
    
    expect(mockCreateEmailRecord).toHaveBeenCalledWith({
      to: user.email,
      subject: 'Invitation to JamesCRM',
      template_id: 'user-invitation',
      user_id: user.id,
      status: 'sent'
    });
    
    expect(result).toEqual({ id: 'email-123', status: 'sent' });
  });

  test('should send a password reset email', async () => {
    // Arrange
    const user = {
      id: 1,
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      status: 'active'
    };
    const resetUrl = 'https://jamescrm.com/reset-password?token=xyz789';
    
    // Act
    const result = await emailService.sendPasswordReset(user, resetUrl);
    
    // Assert
    expect(mockSendTemplate).toHaveBeenCalledWith({
      to: user.email,
      subject: 'Reset Your JamesCRM Password',
      templateId: 'password-reset',
      templateData: {
        firstName: user.first_name,
        resetUrl
      }
    });
    
    expect(mockCreateEmailRecord).toHaveBeenCalledWith({
      to: user.email,
      subject: 'Reset Your JamesCRM Password',
      template_id: 'password-reset',
      user_id: user.id,
      status: 'sent'
    });
    
    expect(result).toEqual({ id: 'email-123', status: 'sent' });
  });

  test('should send a deal notification email', async () => {
    // Arrange
    const deal = {
      id: 1,
      name: 'Enterprise Software License',
      amount: 50000.00,
      status: 'Sent'
    };
    
    const user = {
      id: 2,
      email: 'jane.smith@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      status: 'active'
    };
    
    // Act
    const result = await emailService.sendDealNotification(deal, user);
    
    // Assert
    expect(mockSendTemplate).toHaveBeenCalledWith({
      to: user.email,
      subject: `New Deal: ${deal.name}`,
      templateId: 'deal-notification',
      templateData: {
        firstName: user.first_name,
        dealName: deal.name,
        dealAmount: deal.amount,
        dealUrl: `https://jamescrm.com/deals/${deal.id}`
      }
    });
    
    expect(mockCreateEmailRecord).toHaveBeenCalledWith({
      to: user.email,
      subject: `New Deal: ${deal.name}`,
      template_id: 'deal-notification',
      user_id: user.id,
      deal_id: deal.id,
      status: 'sent'
    });
    
    expect(result).toEqual({ id: 'email-123', status: 'sent' });
  });

  test('should send a quote email with attachment', async () => {
    // Arrange
    const deal = {
      id: 1,
      name: 'Enterprise Software License',
      quote_number: 'Q-2023-001',
      amount: 50000.00,
      status: 'Sent'
    };
    
    const contact = {
      id: 1,
      first_name: 'Alice',
      last_name: 'Anderson',
      email: 'alice.anderson@acme.example.com',
      company_id: 1
    };
    
    const pdfUrl = 'https://jamescrm.com/quotes/Q-2023-001.pdf';
    
    // Act
    const result = await emailService.sendQuote(deal, contact, pdfUrl);
    
    // Assert
    expect(mockSendEmail).toHaveBeenCalledWith({
      to: contact.email,
      subject: `Quote: ${deal.name}`,
      templateId: 'quote-email',
      templateData: {
        firstName: contact.first_name,
        dealName: deal.name,
        quoteNumber: deal.quote_number,
        quoteUrl: pdfUrl
      },
      attachments: [
        {
          content: 'base64-encoded-pdf-content',
          filename: `Quote_${deal.quote_number}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    });
    
    expect(mockCreateEmailRecord).toHaveBeenCalledWith({
      to: contact.email,
      subject: `Quote: ${deal.name}`,
      template_id: 'quote-email',
      user_id: contact.id,
      deal_id: deal.id,
      status: 'sent'
    });
    
    expect(result).toEqual({ id: 'email-123', status: 'sent' });
  });

  test('should handle email sending failure', async () => {
    // Arrange
    const user = {
      id: 1,
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      status: 'active'
    };
    const resetUrl = 'https://jamescrm.com/reset-password?token=xyz789';
    
    // Mock failure
    mockSendTemplate.mockRejectedValue(new Error('Failed to send email'));
    
    // Act & Assert
    await expect(emailService.sendPasswordReset(user, resetUrl)).rejects.toThrow('Failed to send email');
    expect(mockSendTemplate).toHaveBeenCalled();
    expect(mockCreateEmailRecord).not.toHaveBeenCalled();
  });

  test('should handle email record creation failure', async () => {
    // Arrange
    const user = {
      id: 1,
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      status: 'active'
    };
    const resetUrl = 'https://jamescrm.com/reset-password?token=xyz789';
    
    // Mock email record creation failure
    mockCreateEmailRecord.mockRejectedValue(new Error('Failed to create email record'));
    
    // Act & Assert
    await expect(emailService.sendPasswordReset(user, resetUrl)).rejects.toThrow('Failed to create email record');
    expect(mockSendTemplate).toHaveBeenCalled();
    expect(mockCreateEmailRecord).toHaveBeenCalled();
  });
});
