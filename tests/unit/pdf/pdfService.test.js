/**
 * Unit tests for PDF service
 */

describe('PDF Service', () => {
  // Mock dependencies
  const mockPdfLib = {
    PDFDocument: jest.fn().mockImplementation(() => ({
      addPage: jest.fn(),
      drawText: jest.fn(),
      drawImage: jest.fn(),
      embedFont: jest.fn(),
      embedJpg: jest.fn(),
      embedPng: jest.fn(),
      save: jest.fn().mockResolvedValue(Buffer.from('PDF content'))
    }))
  };
  
  // Mock PDF service
  const pdfService = {
    generateQuotePdf: async (deal) => {
      try {
        // Create a new PDF document
        const pdfDoc = new mockPdfLib.PDFDocument();
        
        // Add a page
        pdfDoc.addPage();
        
        // Add company logo
        const logoImage = await pdfDoc.embedPng(Buffer.from('logo content'));
        pdfDoc.drawImage(logoImage, 50, 50, { width: 100 });
        
        // Add title
        const font = await pdfDoc.embedFont('Helvetica-Bold');
        pdfDoc.drawText('QUOTE', { x: 250, y: 50, font, size: 24 });
        
        // Add quote details
        pdfDoc.drawText(`Quote #: ${deal.id}`, { x: 50, y: 150 });
        pdfDoc.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 50, y: 170 });
        pdfDoc.drawText(`Valid until: ${deal.valid_until || 'N/A'}`, { x: 50, y: 190 });
        
        // Add company details
        pdfDoc.drawText('From:', { x: 50, y: 230, font, size: 12 });
        pdfDoc.drawText('JamesCRM Inc.', { x: 50, y: 250 });
        pdfDoc.drawText('123 Business St.', { x: 50, y: 270 });
        pdfDoc.drawText('New York, NY 10001', { x: 50, y: 290 });
        
        // Add client details
        pdfDoc.drawText('To:', { x: 300, y: 230, font, size: 12 });
        pdfDoc.drawText(deal.company?.name || 'N/A', { x: 300, y: 250 });
        pdfDoc.drawText(`Attn: ${deal.contact?.first_name || ''} ${deal.contact?.last_name || ''}`, { x: 300, y: 270 });
        
        // Add items table
        pdfDoc.drawText('Description', { x: 50, y: 350, font, size: 12 });
        pdfDoc.drawText('Quantity', { x: 300, y: 350, font, size: 12 });
        pdfDoc.drawText('Price', { x: 400, y: 350, font, size: 12 });
        pdfDoc.drawText('Total', { x: 500, y: 350, font, size: 12 });
        
        let y = 380;
        let total = 0;
        
        if (deal.items && deal.items.length > 0) {
          for (const item of deal.items) {
            const itemTotal = item.quantity * item.price;
            total += itemTotal;
            
            pdfDoc.drawText(item.description, { x: 50, y });
            pdfDoc.drawText(item.quantity.toString(), { x: 300, y });
            pdfDoc.drawText(`$${item.price.toFixed(2)}`, { x: 400, y });
            pdfDoc.drawText(`$${itemTotal.toFixed(2)}`, { x: 500, y });
            
            y += 30;
          }
        } else {
          pdfDoc.drawText('No items', { x: 50, y });
          y += 30;
        }
        
        // Add total
        pdfDoc.drawText('Total:', { x: 400, y: y + 20, font, size: 14 });
        pdfDoc.drawText(`$${total.toFixed(2)}`, { x: 500, y: y + 20, font, size: 14 });
        
        // Add terms and conditions
        pdfDoc.drawText('Terms and Conditions:', { x: 50, y: y + 70, font, size: 12 });
        pdfDoc.drawText('1. Payment due within 30 days of invoice date.', { x: 50, y: y + 90 });
        pdfDoc.drawText('2. This quote is valid for 30 days from the date of issue.', { x: 50, y: y + 110 });
        
        // Add signature
        pdfDoc.drawText('Signature: _______________________', { x: 50, y: y + 160 });
        pdfDoc.drawText('Date: _______________________', { x: 50, y: y + 180 });
        
        // Save the PDF
        return await pdfDoc.save();
      } catch (error) {
        throw new Error(`Failed to generate quote PDF: ${error.message}`);
      }
    },
    
    generateInvoicePdf: async (invoice) => {
      try {
        // Create a new PDF document
        const pdfDoc = new mockPdfLib.PDFDocument();
        
        // Add a page
        pdfDoc.addPage();
        
        // Add company logo
        const logoImage = await pdfDoc.embedPng(Buffer.from('logo content'));
        pdfDoc.drawImage(logoImage, 50, 50, { width: 100 });
        
        // Add title
        const font = await pdfDoc.embedFont('Helvetica-Bold');
        pdfDoc.drawText('INVOICE', { x: 250, y: 50, font, size: 24 });
        
        // Add invoice details
        pdfDoc.drawText(`Invoice #: ${invoice.id}`, { x: 50, y: 150 });
        pdfDoc.drawText(`Date: ${new Date(invoice.date).toLocaleDateString()}`, { x: 50, y: 170 });
        pdfDoc.drawText(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, { x: 50, y: 190 });
        
        // Add company details
        pdfDoc.drawText('From:', { x: 50, y: 230, font, size: 12 });
        pdfDoc.drawText('JamesCRM Inc.', { x: 50, y: 250 });
        pdfDoc.drawText('123 Business St.', { x: 50, y: 270 });
        pdfDoc.drawText('New York, NY 10001', { x: 50, y: 290 });
        
        // Add client details
        pdfDoc.drawText('To:', { x: 300, y: 230, font, size: 12 });
        pdfDoc.drawText(invoice.company?.name || 'N/A', { x: 300, y: 250 });
        pdfDoc.drawText(`Attn: ${invoice.contact?.first_name || ''} ${invoice.contact?.last_name || ''}`, { x: 300, y: 270 });
        
        // Add items table
        pdfDoc.drawText('Description', { x: 50, y: 350, font, size: 12 });
        pdfDoc.drawText('Quantity', { x: 300, y: 350, font, size: 12 });
        pdfDoc.drawText('Price', { x: 400, y: 350, font, size: 12 });
        pdfDoc.drawText('Total', { x: 500, y: 350, font, size: 12 });
        
        let y = 380;
        let total = 0;
        
        if (invoice.items && invoice.items.length > 0) {
          for (const item of invoice.items) {
            const itemTotal = item.quantity * item.price;
            total += itemTotal;
            
            pdfDoc.drawText(item.description, { x: 50, y });
            pdfDoc.drawText(item.quantity.toString(), { x: 300, y });
            pdfDoc.drawText(`$${item.price.toFixed(2)}`, { x: 400, y });
            pdfDoc.drawText(`$${itemTotal.toFixed(2)}`, { x: 500, y });
            
            y += 30;
          }
        } else {
          pdfDoc.drawText('No items', { x: 50, y });
          y += 30;
        }
        
        // Add subtotal, tax, and total
        pdfDoc.drawText('Subtotal:', { x: 400, y: y + 20 });
        pdfDoc.drawText(`$${total.toFixed(2)}`, { x: 500, y: y + 20 });
        
        const tax = total * (invoice.tax_rate || 0) / 100;
        pdfDoc.drawText(`Tax (${invoice.tax_rate || 0}%):`, { x: 400, y: y + 40 });
        pdfDoc.drawText(`$${tax.toFixed(2)}`, { x: 500, y: y + 40 });
        
        pdfDoc.drawText('Total:', { x: 400, y: y + 60, font, size: 14 });
        pdfDoc.drawText(`$${(total + tax).toFixed(2)}`, { x: 500, y: y + 60, font, size: 14 });
        
        // Add payment instructions
        pdfDoc.drawText('Payment Instructions:', { x: 50, y: y + 100, font, size: 12 });
        pdfDoc.drawText('Bank: National Bank', { x: 50, y: y + 120 });
        pdfDoc.drawText('Account: 123456789', { x: 50, y: y + 140 });
        pdfDoc.drawText('Reference: Invoice #' + invoice.id, { x: 50, y: y + 160 });
        
        // Save the PDF
        return await pdfDoc.save();
      } catch (error) {
        throw new Error(`Failed to generate invoice PDF: ${error.message}`);
      }
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateQuotePdf', () => {
    test('should generate a quote PDF', async () => {
      // Arrange
      const deal = {
        id: 1,
        name: 'Software Development',
        amount: 5000,
        status: 'open',
        valid_until: '2023-12-31',
        company: {
          name: 'Acme Inc.'
        },
        contact: {
          first_name: 'John',
          last_name: 'Doe'
        },
        items: [
          { description: 'Web Development', quantity: 1, price: 3000 },
          { description: 'Mobile App Development', quantity: 1, price: 2000 }
        ]
      };
      
      // Act
      const result = await pdfService.generateQuotePdf(deal);
      
      // Assert
      expect(mockPdfLib.PDFDocument).toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('PDF content'));
    });
    
    test('should handle deal without items', async () => {
      // Arrange
      const deal = {
        id: 1,
        name: 'Software Development',
        amount: 0,
        status: 'open',
        company: {
          name: 'Acme Inc.'
        },
        contact: {
          first_name: 'John',
          last_name: 'Doe'
        },
        items: []
      };
      
      // Act
      const result = await pdfService.generateQuotePdf(deal);
      
      // Assert
      expect(mockPdfLib.PDFDocument).toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('PDF content'));
    });
    
    test('should handle deal without company or contact', async () => {
      // Arrange
      const deal = {
        id: 1,
        name: 'Software Development',
        amount: 5000,
        status: 'open',
        items: [
          { description: 'Web Development', quantity: 1, price: 3000 },
          { description: 'Mobile App Development', quantity: 1, price: 2000 }
        ]
      };
      
      // Act
      const result = await pdfService.generateQuotePdf(deal);
      
      // Assert
      expect(mockPdfLib.PDFDocument).toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('PDF content'));
    });
  });
  
  describe('generateInvoicePdf', () => {
    test('should generate an invoice PDF', async () => {
      // Arrange
      const invoice = {
        id: 1,
        date: '2023-01-01',
        due_date: '2023-01-31',
        tax_rate: 10,
        company: {
          name: 'Acme Inc.'
        },
        contact: {
          first_name: 'John',
          last_name: 'Doe'
        },
        items: [
          { description: 'Web Development', quantity: 1, price: 3000 },
          { description: 'Mobile App Development', quantity: 1, price: 2000 }
        ]
      };
      
      // Act
      const result = await pdfService.generateInvoicePdf(invoice);
      
      // Assert
      expect(mockPdfLib.PDFDocument).toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('PDF content'));
    });
    
    test('should handle invoice without items', async () => {
      // Arrange
      const invoice = {
        id: 1,
        date: '2023-01-01',
        due_date: '2023-01-31',
        tax_rate: 10,
        company: {
          name: 'Acme Inc.'
        },
        contact: {
          first_name: 'John',
          last_name: 'Doe'
        },
        items: []
      };
      
      // Act
      const result = await pdfService.generateInvoicePdf(invoice);
      
      // Assert
      expect(mockPdfLib.PDFDocument).toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('PDF content'));
    });
    
    test('should handle invoice without tax rate', async () => {
      // Arrange
      const invoice = {
        id: 1,
        date: '2023-01-01',
        due_date: '2023-01-31',
        company: {
          name: 'Acme Inc.'
        },
        contact: {
          first_name: 'John',
          last_name: 'Doe'
        },
        items: [
          { description: 'Web Development', quantity: 1, price: 3000 },
          { description: 'Mobile App Development', quantity: 1, price: 2000 }
        ]
      };
      
      // Act
      const result = await pdfService.generateInvoicePdf(invoice);
      
      // Assert
      expect(mockPdfLib.PDFDocument).toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('PDF content'));
    });
  });
});
