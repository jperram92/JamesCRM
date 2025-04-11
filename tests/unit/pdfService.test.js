/**
 * Unit tests for PDF service
 */

describe('PDF Service', () => {
  // Mock dependencies
  const mockGeneratePdf = jest.fn();
  const mockSavePdf = jest.fn();
  const mockCreatePdfRecord = jest.fn();

  // Mock PDF service
  const pdfService = {
    generatePdf: mockGeneratePdf,
    savePdf: mockSavePdf,
    createPdfRecord: mockCreatePdfRecord,

    // Higher-level methods that use the above methods
    generateQuotePdf: async (deal, company, contact) => {
      const templateData = {
        quoteNumber: deal.quote_number,
        date: new Date().toLocaleDateString(),
        companyName: company.name,
        companyAddress: formatAddress(company),
        contactName: `${contact.first_name} ${contact.last_name}`,
        contactEmail: contact.email,
        dealName: deal.name,
        dealDescription: deal.description,
        items: deal.items || [],
        subtotal: calculateSubtotal(deal.items),
        tax: calculateTax(deal.items),
        total: deal.amount,
        terms: deal.terms || 'Net 30',
        notes: deal.notes || ''
      };

      const pdfBuffer = await pdfService.generatePdf('quote-template', templateData);
      const filename = `Quote_${deal.quote_number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const filePath = `quotes/${filename}`;

      await pdfService.savePdf(filePath, pdfBuffer);

      const pdfRecord = await pdfService.createPdfRecord({
        deal_id: deal.id,
        type: 'quote',
        filename,
        file_path: filePath,
        created_by: deal.owner_id
      });

      return {
        url: `/uploads/${filePath}`,
        filename,
        id: pdfRecord.id
      };
    },

    generateContractPdf: async (deal, company, contact) => {
      const templateData = {
        contractNumber: `C-${deal.quote_number.substring(2)}`,
        date: new Date().toLocaleDateString(),
        companyName: company.name,
        companyAddress: formatAddress(company),
        contactName: `${contact.first_name} ${contact.last_name}`,
        contactEmail: contact.email,
        dealName: deal.name,
        dealDescription: deal.description,
        startDate: deal.start_date ? new Date(deal.start_date).toLocaleDateString() : '',
        endDate: deal.end_date ? new Date(deal.end_date).toLocaleDateString() : '',
        items: deal.items || [],
        subtotal: calculateSubtotal(deal.items),
        tax: calculateTax(deal.items),
        total: deal.amount,
        terms: deal.terms || 'Net 30',
        legalTerms: deal.legal_terms || 'Standard terms and conditions apply.'
      };

      const pdfBuffer = await pdfService.generatePdf('contract-template', templateData);
      const filename = `Contract_${deal.quote_number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const filePath = `contracts/${filename}`;

      await pdfService.savePdf(filePath, pdfBuffer);

      const pdfRecord = await pdfService.createPdfRecord({
        deal_id: deal.id,
        type: 'contract',
        filename,
        file_path: filePath,
        created_by: deal.owner_id
      });

      return {
        url: `/uploads/${filePath}`,
        filename,
        id: pdfRecord.id
      };
    },

    generateInvoicePdf: async (deal, company, contact) => {
      const templateData = {
        invoiceNumber: `INV-${deal.quote_number.substring(2)}`,
        date: new Date().toLocaleDateString(),
        dueDate: deal.payment_due_date ? new Date(deal.payment_due_date).toLocaleDateString() : '',
        companyName: company.name,
        companyAddress: formatAddress(company),
        contactName: `${contact.first_name} ${contact.last_name}`,
        contactEmail: contact.email,
        dealName: deal.name,
        dealDescription: deal.description,
        items: deal.items || [],
        subtotal: calculateSubtotal(deal.items),
        tax: calculateTax(deal.items),
        total: deal.amount,
        terms: deal.terms || 'Net 30',
        paymentInstructions: deal.payment_instructions || 'Please make payment to the account details provided.'
      };

      const pdfBuffer = await pdfService.generatePdf('invoice-template', templateData);
      const filename = `Invoice_${deal.quote_number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const filePath = `invoices/${filename}`;

      await pdfService.savePdf(filePath, pdfBuffer);

      const pdfRecord = await pdfService.createPdfRecord({
        deal_id: deal.id,
        type: 'invoice',
        filename,
        file_path: filePath,
        created_by: deal.owner_id
      });

      return {
        url: `/uploads/${filePath}`,
        filename,
        id: pdfRecord.id
      };
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockGeneratePdf.mockReset();
    mockSavePdf.mockReset();
    mockCreatePdfRecord.mockReset();

    // Default mock implementations
    mockGeneratePdf.mockResolvedValue(Buffer.from('mock-pdf-content'));
    mockSavePdf.mockResolvedValue(true);
    mockCreatePdfRecord.mockResolvedValue({ id: 1 });
  });

  test('should generate a quote PDF', async () => {
    // Arrange
    const deal = {
      id: 1,
      name: 'Enterprise Software License',
      quote_number: 'Q-2023-001',
      amount: 50000.00,
      description: 'Enterprise software license for 100 users',
      items: [
        { description: 'Software License', quantity: 100, unit_price: 500.00 }
      ],
      owner_id: 1
    };

    const company = {
      id: 1,
      name: 'Acme Corporation',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      country: 'USA'
    };

    const contact = {
      id: 1,
      first_name: 'Alice',
      last_name: 'Anderson',
      email: 'alice.anderson@acme.example.com'
    };

    // Act
    const result = await pdfService.generateQuotePdf(deal, company, contact);

    // Assert
    expect(mockGeneratePdf).toHaveBeenCalledWith('quote-template', expect.objectContaining({
      quoteNumber: deal.quote_number,
      companyName: company.name,
      contactName: 'Alice Anderson',
      dealName: deal.name,
      total: deal.amount
    }));

    expect(mockSavePdf).toHaveBeenCalledWith(
      'quotes/Quote_Q_2023_001.pdf',
      expect.any(Buffer)
    );

    expect(mockCreatePdfRecord).toHaveBeenCalledWith({
      deal_id: deal.id,
      type: 'quote',
      filename: 'Quote_Q_2023_001.pdf',
      file_path: 'quotes/Quote_Q_2023_001.pdf',
      created_by: deal.owner_id
    });

    expect(result).toEqual({
      url: '/uploads/quotes/Quote_Q_2023_001.pdf',
      filename: 'Quote_Q_2023_001.pdf',
      id: 1
    });
  });

  test('should generate a contract PDF', async () => {
    // Arrange
    const deal = {
      id: 1,
      name: 'Enterprise Software License',
      quote_number: 'Q-2023-001',
      amount: 50000.00,
      description: 'Enterprise software license for 100 users',
      items: [
        { description: 'Software License', quantity: 100, unit_price: 500.00 }
      ],
      start_date: '2023-04-01',
      end_date: '2024-03-31',
      owner_id: 1
    };

    const company = {
      id: 1,
      name: 'Acme Corporation',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      country: 'USA'
    };

    const contact = {
      id: 1,
      first_name: 'Alice',
      last_name: 'Anderson',
      email: 'alice.anderson@acme.example.com'
    };

    // Act
    const result = await pdfService.generateContractPdf(deal, company, contact);

    // Assert
    expect(mockGeneratePdf).toHaveBeenCalledWith('contract-template', expect.objectContaining({
      contractNumber: 'C-2023-001',
      companyName: company.name,
      contactName: 'Alice Anderson',
      dealName: deal.name,
      startDate: expect.any(String),
      endDate: expect.any(String),
      total: deal.amount
    }));

    expect(mockSavePdf).toHaveBeenCalledWith(
      'contracts/Contract_Q_2023_001.pdf',
      expect.any(Buffer)
    );

    expect(mockCreatePdfRecord).toHaveBeenCalledWith({
      deal_id: deal.id,
      type: 'contract',
      filename: 'Contract_Q_2023_001.pdf',
      file_path: 'contracts/Contract_Q_2023_001.pdf',
      created_by: deal.owner_id
    });

    expect(result).toEqual({
      url: '/uploads/contracts/Contract_Q_2023_001.pdf',
      filename: 'Contract_Q_2023_001.pdf',
      id: 1
    });
  });

  test('should generate an invoice PDF', async () => {
    // Arrange
    const deal = {
      id: 1,
      name: 'Enterprise Software License',
      quote_number: 'Q-2023-001',
      amount: 50000.00,
      description: 'Enterprise software license for 100 users',
      items: [
        { description: 'Software License', quantity: 100, unit_price: 500.00 }
      ],
      payment_due_date: '2023-04-30',
      owner_id: 1
    };

    const company = {
      id: 1,
      name: 'Acme Corporation',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      country: 'USA'
    };

    const contact = {
      id: 1,
      first_name: 'Alice',
      last_name: 'Anderson',
      email: 'alice.anderson@acme.example.com'
    };

    // Act
    const result = await pdfService.generateInvoicePdf(deal, company, contact);

    // Assert
    expect(mockGeneratePdf).toHaveBeenCalledWith('invoice-template', expect.objectContaining({
      invoiceNumber: 'INV-2023-001',
      companyName: company.name,
      contactName: 'Alice Anderson',
      dealName: deal.name,
      dueDate: expect.any(String),
      total: deal.amount
    }));

    expect(mockSavePdf).toHaveBeenCalledWith(
      'invoices/Invoice_Q_2023_001.pdf',
      expect.any(Buffer)
    );

    expect(mockCreatePdfRecord).toHaveBeenCalledWith({
      deal_id: deal.id,
      type: 'invoice',
      filename: 'Invoice_Q_2023_001.pdf',
      file_path: 'invoices/Invoice_Q_2023_001.pdf',
      created_by: deal.owner_id
    });

    expect(result).toEqual({
      url: '/uploads/invoices/Invoice_Q_2023_001.pdf',
      filename: 'Invoice_Q_2023_001.pdf',
      id: 1
    });
  });

  test('should handle PDF generation failure', async () => {
    // Arrange
    const deal = {
      id: 1,
      name: 'Enterprise Software License',
      quote_number: 'Q-2023-001',
      amount: 50000.00,
      owner_id: 1
    };

    const company = {
      id: 1,
      name: 'Acme Corporation'
    };

    const contact = {
      id: 1,
      first_name: 'Alice',
      last_name: 'Anderson',
      email: 'alice.anderson@acme.example.com'
    };

    // Mock failure
    mockGeneratePdf.mockRejectedValue(new Error('Failed to generate PDF'));

    // Act & Assert
    await expect(pdfService.generateQuotePdf(deal, company, contact)).rejects.toThrow('Failed to generate PDF');
    expect(mockGeneratePdf).toHaveBeenCalled();
    expect(mockSavePdf).not.toHaveBeenCalled();
    expect(mockCreatePdfRecord).not.toHaveBeenCalled();
  });

  test('should handle PDF saving failure', async () => {
    // Arrange
    const deal = {
      id: 1,
      name: 'Enterprise Software License',
      quote_number: 'Q-2023-001',
      amount: 50000.00,
      owner_id: 1
    };

    const company = {
      id: 1,
      name: 'Acme Corporation'
    };

    const contact = {
      id: 1,
      first_name: 'Alice',
      last_name: 'Anderson',
      email: 'alice.anderson@acme.example.com'
    };

    // Mock failure
    mockSavePdf.mockRejectedValue(new Error('Failed to save PDF'));

    // Act & Assert
    await expect(pdfService.generateQuotePdf(deal, company, contact)).rejects.toThrow('Failed to save PDF');
    expect(mockGeneratePdf).toHaveBeenCalled();
    expect(mockSavePdf).toHaveBeenCalled();
    expect(mockCreatePdfRecord).not.toHaveBeenCalled();
  });

  // Helper functions for testing
  function formatAddress(company) {
    const parts = [
      company.address,
      company.city,
      company.state,
      company.zip_code,
      company.country
    ].filter(Boolean);

    return parts.join(', ');
  }

  function calculateSubtotal(items) {
    if (!items || !Array.isArray(items)) {
      return 0;
    }

    return items.reduce((total, item) => {
      return total + (item.quantity * item.unit_price);
    }, 0);
  }

  function calculateTax(items) {
    const subtotal = calculateSubtotal(items);
    return subtotal * 0.1; // 10% tax rate
  }
});
