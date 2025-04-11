/**
 * Unit tests for quote status service
 */

describe('Quote Status Service', () => {
  // Mock dependencies
  const mockQuoteRepository = {
    findById: jest.fn(),
    updateStatus: jest.fn()
  };
  
  const mockEmailService = {
    sendEmail: jest.fn()
  };
  
  const mockPdfService = {
    generateQuotePdf: jest.fn()
  };
  
  // Mock quote status service
  const quoteStatusService = {
    sendQuote: async (quoteId, emailData) => {
      const quote = await mockQuoteRepository.findById(quoteId);
      
      if (!quote) {
        throw new Error('Quote not found');
      }
      
      if (quote.status !== 'draft') {
        throw new Error('Only draft quotes can be sent');
      }
      
      // Generate PDF
      const pdfBuffer = await mockPdfService.generateQuotePdf(quote);
      
      // Send email with PDF attachment
      await mockEmailService.sendEmail({
        to: emailData.to,
        subject: emailData.subject || `Quote ${quote.quote_number}`,
        body: emailData.body || `Please find attached quote ${quote.quote_number}`,
        attachments: [
          {
            filename: `Quote_${quote.quote_number}.pdf`,
            content: pdfBuffer
          }
        ]
      });
      
      // Update quote status
      await mockQuoteRepository.updateStatus(quoteId, 'sent');
      
      return {
        success: true,
        message: 'Quote sent successfully'
      };
    },
    
    approveQuote: async (quoteId) => {
      const quote = await mockQuoteRepository.findById(quoteId);
      
      if (!quote) {
        throw new Error('Quote not found');
      }
      
      if (quote.status !== 'sent') {
        throw new Error('Only sent quotes can be approved');
      }
      
      // Update quote status
      await mockQuoteRepository.updateStatus(quoteId, 'approved');
      
      return {
        success: true,
        message: 'Quote approved successfully'
      };
    },
    
    rejectQuote: async (quoteId, reason) => {
      const quote = await mockQuoteRepository.findById(quoteId);
      
      if (!quote) {
        throw new Error('Quote not found');
      }
      
      if (quote.status !== 'sent') {
        throw new Error('Only sent quotes can be rejected');
      }
      
      // Update quote status
      await mockQuoteRepository.updateStatus(quoteId, 'rejected', { rejection_reason: reason });
      
      return {
        success: true,
        message: 'Quote rejected successfully'
      };
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockQuoteRepository.findById.mockImplementation((id) => {
      if (id === 1) {
        return {
          id,
          quote_number: 'Q-123456',
          title: 'Website Development',
          status: 'draft',
          items: [
            { description: 'Web Design', quantity: 1, unit_price: 1000 },
            { description: 'Web Development', quantity: 1, unit_price: 2000 }
          ],
          subtotal: 3000,
          total: 3300
        };
      }
      
      if (id === 2) {
        return {
          id,
          quote_number: 'Q-234567',
          title: 'SEO Services',
          status: 'sent',
          items: [
            { description: 'SEO Audit', quantity: 1, unit_price: 500 },
            { description: 'SEO Optimization', quantity: 1, unit_price: 1500 }
          ],
          subtotal: 2000,
          total: 1980
        };
      }
      
      if (id === 3) {
        return {
          id,
          quote_number: 'Q-345678',
          title: 'Content Writing',
          status: 'approved',
          items: [
            { description: 'Blog Posts', quantity: 5, unit_price: 200 }
          ],
          subtotal: 1000,
          total: 1000
        };
      }
      
      return null;
    });
    
    mockQuoteRepository.updateStatus.mockImplementation((id, status, data) => ({
      id,
      status,
      ...data
    }));
    
    mockEmailService.sendEmail.mockResolvedValue({
      success: true,
      message: 'Email sent successfully'
    });
    
    mockPdfService.generateQuotePdf.mockResolvedValue(Buffer.from('PDF content'));
  });

  describe('sendQuote', () => {
    test('should send a quote and update status', async () => {
      // Arrange
      const quoteId = 1;
      const emailData = {
        to: 'client@example.com',
        subject: 'Your Website Development Quote',
        body: 'Please find attached your quote for website development services.'
      };
      
      // Act
      const result = await quoteStatusService.sendQuote(quoteId, emailData);
      
      // Assert
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(mockPdfService.generateQuotePdf).toHaveBeenCalledWith(expect.objectContaining({
        id: quoteId,
        quote_number: 'Q-123456'
      }));
      
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: emailData.to,
        subject: emailData.subject,
        body: emailData.body,
        attachments: [
          {
            filename: 'Quote_Q-123456.pdf',
            content: expect.any(Buffer)
          }
        ]
      });
      
      expect(mockQuoteRepository.updateStatus).toHaveBeenCalledWith(quoteId, 'sent');
      
      expect(result).toEqual({
        success: true,
        message: 'Quote sent successfully'
      });
    });
    
    test('should throw error when quote is not found', async () => {
      // Arrange
      const quoteId = 999;
      const emailData = {
        to: 'client@example.com'
      };
      
      // Act & Assert
      await expect(quoteStatusService.sendQuote(quoteId, emailData))
        .rejects.toThrow('Quote not found');
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(mockPdfService.generateQuotePdf).not.toHaveBeenCalled();
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
      expect(mockQuoteRepository.updateStatus).not.toHaveBeenCalled();
    });
    
    test('should throw error when quote is not in draft status', async () => {
      // Arrange
      const quoteId = 2; // Already in 'sent' status
      const emailData = {
        to: 'client@example.com'
      };
      
      // Act & Assert
      await expect(quoteStatusService.sendQuote(quoteId, emailData))
        .rejects.toThrow('Only draft quotes can be sent');
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(mockPdfService.generateQuotePdf).not.toHaveBeenCalled();
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
      expect(mockQuoteRepository.updateStatus).not.toHaveBeenCalled();
    });
  });
  
  describe('approveQuote', () => {
    test('should approve a quote and update status', async () => {
      // Arrange
      const quoteId = 2; // In 'sent' status
      
      // Act
      const result = await quoteStatusService.approveQuote(quoteId);
      
      // Assert
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(mockQuoteRepository.updateStatus).toHaveBeenCalledWith(quoteId, 'approved');
      
      expect(result).toEqual({
        success: true,
        message: 'Quote approved successfully'
      });
    });
    
    test('should throw error when quote is not found', async () => {
      // Arrange
      const quoteId = 999;
      
      // Act & Assert
      await expect(quoteStatusService.approveQuote(quoteId))
        .rejects.toThrow('Quote not found');
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(mockQuoteRepository.updateStatus).not.toHaveBeenCalled();
    });
    
    test('should throw error when quote is not in sent status', async () => {
      // Arrange
      const quoteId = 1; // In 'draft' status
      
      // Act & Assert
      await expect(quoteStatusService.approveQuote(quoteId))
        .rejects.toThrow('Only sent quotes can be approved');
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(mockQuoteRepository.updateStatus).not.toHaveBeenCalled();
    });
  });
  
  describe('rejectQuote', () => {
    test('should reject a quote with reason and update status', async () => {
      // Arrange
      const quoteId = 2; // In 'sent' status
      const reason = 'Price is too high';
      
      // Act
      const result = await quoteStatusService.rejectQuote(quoteId, reason);
      
      // Assert
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(mockQuoteRepository.updateStatus).toHaveBeenCalledWith(quoteId, 'rejected', { rejection_reason: reason });
      
      expect(result).toEqual({
        success: true,
        message: 'Quote rejected successfully'
      });
    });
    
    test('should throw error when quote is not found', async () => {
      // Arrange
      const quoteId = 999;
      const reason = 'Price is too high';
      
      // Act & Assert
      await expect(quoteStatusService.rejectQuote(quoteId, reason))
        .rejects.toThrow('Quote not found');
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(mockQuoteRepository.updateStatus).not.toHaveBeenCalled();
    });
    
    test('should throw error when quote is not in sent status', async () => {
      // Arrange
      const quoteId = 3; // In 'approved' status
      const reason = 'Price is too high';
      
      // Act & Assert
      await expect(quoteStatusService.rejectQuote(quoteId, reason))
        .rejects.toThrow('Only sent quotes can be rejected');
      expect(mockQuoteRepository.findById).toHaveBeenCalledWith(quoteId);
      expect(mockQuoteRepository.updateStatus).not.toHaveBeenCalled();
    });
  });
});
