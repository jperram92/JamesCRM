const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a PDF quote from a deal
 * @param {Object} deal - The deal object
 * @param {Object} options - Options for PDF generation
 * @returns {Promise<string>} - The path to the generated PDF
 */
const generateQuotePdf = async (deal, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a unique filename
      const filename = `quote_${deal.quoteNumber.replace(/[^a-zA-Z0-9]/g, '_')}_${uuidv4()}.pdf`;
      const uploadDir = path.join(__dirname, '../uploads/quotes');
      
      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, filename);
      const fileUrl = `/uploads/quotes/${filename}`;
      
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Quote ${deal.quoteNumber}`,
          Author: 'JamesCRM',
          Subject: `Quote for ${deal.company.name}`,
        }
      });
      
      // Pipe output to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Add company logo if provided
      if (options.logoPath && fs.existsSync(options.logoPath)) {
        doc.image(options.logoPath, 50, 50, { width: 150 });
        doc.moveDown(2);
      } else {
        // Add title if no logo
        doc.fontSize(25).text('JamesCRM', { align: 'left' });
        doc.moveDown();
      }
      
      // Add quote information
      doc.fontSize(20).text(`Quote ${deal.quoteNumber}`, { align: 'right' });
      doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
      if (deal.expiryDate) {
        doc.text(`Valid until: ${new Date(deal.expiryDate).toLocaleDateString()}`, { align: 'right' });
      }
      doc.moveDown(2);
      
      // Add company information
      doc.fontSize(12).text('From:', { continued: true }).fontSize(14).text(' JamesCRM');
      doc.fontSize(10).text('123 Business Street');
      doc.text('Business City, State 12345');
      doc.text('Phone: (555) 123-4567');
      doc.text('Email: sales@jamescrm.com');
      doc.moveDown();
      
      // Add client information
      doc.fontSize(12).text('To:', { continued: true }).fontSize(14).text(` ${deal.company.name}`);
      if (deal.company.address) {
        const address = deal.company.address;
        if (address.street) doc.fontSize(10).text(address.street);
        if (address.city || address.state || address.zipCode) {
          doc.text(`${address.city || ''}, ${address.state || ''} ${address.zipCode || ''}`);
        }
        if (address.country) doc.text(address.country);
      }
      
      // Add contact information
      if (deal.contact) {
        doc.moveDown(0.5);
        doc.fontSize(12).text('Contact:');
        doc.fontSize(10).text(`${deal.contact.firstName} ${deal.contact.lastName}`);
        if (deal.contact.email) doc.text(`Email: ${deal.contact.email}`);
        if (deal.contact.phone) doc.text(`Phone: ${deal.contact.phone}`);
      }
      
      // Add billing contact if different
      if (deal.billingContact && (!deal.contact || deal.billingContact._id !== deal.contact._id)) {
        doc.moveDown(0.5);
        doc.fontSize(12).text('Billing Contact:');
        doc.fontSize(10).text(`${deal.billingContact.firstName} ${deal.billingContact.lastName}`);
        if (deal.billingContact.email) doc.text(`Email: ${deal.billingContact.email}`);
        if (deal.billingContact.phone) doc.text(`Phone: ${deal.billingContact.phone}`);
      }
      
      doc.moveDown(2);
      
      // Add quote title
      doc.fontSize(16).text(deal.name, { align: 'center' });
      doc.moveDown();
      
      // Add line items table
      const tableTop = doc.y;
      const tableHeaders = ['Description', 'Qty', 'Unit Price', 'Discount', 'Tax', 'Total'];
      const tableWidths = [250, 40, 80, 60, 40, 80];
      
      // Draw table headers
      doc.fontSize(10).font('Helvetica-Bold');
      let xPosition = 50;
      tableHeaders.forEach((header, i) => {
        doc.text(header, xPosition, tableTop, { width: tableWidths[i], align: i === 0 ? 'left' : 'right' });
        xPosition += tableWidths[i];
      });
      
      // Draw table rows
      doc.font('Helvetica');
      let yPosition = tableTop + 20;
      
      // Function to format currency
      const formatCurrency = (amount) => {
        return `${deal.currency} ${amount.toFixed(2)}`;
      };
      
      // Draw line items
      deal.lineItems.forEach((item, index) => {
        // Check if we need a new page
        if (yPosition > doc.page.height - 150) {
          doc.addPage();
          yPosition = 50;
        }
        
        xPosition = 50;
        
        // Description
        doc.text(item.description, xPosition, yPosition, { width: tableWidths[0] });
        xPosition += tableWidths[0];
        
        // Quantity
        doc.text(item.quantity.toString(), xPosition, yPosition, { width: tableWidths[1], align: 'right' });
        xPosition += tableWidths[1];
        
        // Unit Price
        doc.text(formatCurrency(item.unitPrice), xPosition, yPosition, { width: tableWidths[2], align: 'right' });
        xPosition += tableWidths[2];
        
        // Discount
        doc.text(`${item.discount}%`, xPosition, yPosition, { width: tableWidths[3], align: 'right' });
        xPosition += tableWidths[3];
        
        // Tax
        doc.text(`${item.tax}%`, xPosition, yPosition, { width: tableWidths[4], align: 'right' });
        xPosition += tableWidths[4];
        
        // Total
        doc.text(formatCurrency(item.total), xPosition, yPosition, { width: tableWidths[5], align: 'right' });
        
        yPosition += 20;
      });
      
      // Draw table bottom line
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 10;
      
      // Add subtotal, discount, tax, and total
      const summaryX = 380;
      const summaryValueX = 550;
      
      doc.text('Subtotal:', summaryX, yPosition, { width: 100, align: 'right' });
      doc.text(formatCurrency(deal.subtotal), summaryValueX, yPosition, { width: 80, align: 'right' });
      yPosition += 20;
      
      if (deal.discountValue > 0) {
        const discountLabel = deal.discountType === 'Percentage' 
          ? `Discount (${deal.discountValue}%):` 
          : 'Discount:';
        
        doc.text(discountLabel, summaryX, yPosition, { width: 100, align: 'right' });
        
        const discountAmount = deal.discountType === 'Percentage'
          ? deal.subtotal * (deal.discountValue / 100)
          : deal.discountValue;
          
        doc.text(`- ${formatCurrency(discountAmount)}`, summaryValueX, yPosition, { width: 80, align: 'right' });
        yPosition += 20;
      }
      
      if (deal.taxRate > 0) {
        doc.text(`Tax (${deal.taxRate}%):`, summaryX, yPosition, { width: 100, align: 'right' });
        doc.text(formatCurrency(deal.taxAmount), summaryValueX, yPosition, { width: 80, align: 'right' });
        yPosition += 20;
      }
      
      // Total
      doc.font('Helvetica-Bold');
      doc.text('Total:', summaryX, yPosition, { width: 100, align: 'right' });
      doc.text(formatCurrency(deal.totalAmount), summaryValueX, yPosition, { width: 80, align: 'right' });
      doc.font('Helvetica');
      yPosition += 30;
      
      // Add notes
      if (deal.notes) {
        // Check if we need a new page
        if (yPosition > doc.page.height - 200) {
          doc.addPage();
          yPosition = 50;
        }
        
        doc.fontSize(12).text('Notes:', 50, yPosition);
        doc.fontSize(10).text(deal.notes, 50, yPosition + 20, { width: 500 });
        yPosition += 20 + doc.heightOfString(deal.notes, { width: 500 });
        yPosition += 20;
      }
      
      // Add terms
      if (deal.terms) {
        // Check if we need a new page
        if (yPosition > doc.page.height - 200) {
          doc.addPage();
          yPosition = 50;
        }
        
        doc.fontSize(12).text('Terms and Conditions:', 50, yPosition);
        doc.fontSize(10).text(deal.terms, 50, yPosition + 20, { width: 500 });
        yPosition += 20 + doc.heightOfString(deal.terms, { width: 500 });
        yPosition += 20;
      }
      
      // Add signature section if required
      if (deal.signatureRequired) {
        // Check if we need a new page
        if (yPosition > doc.page.height - 150) {
          doc.addPage();
          yPosition = 50;
        }
        
        doc.fontSize(12).text('Acceptance:', 50, yPosition);
        yPosition += 20;
        
        // If already signed, show signature
        if (deal.signedBy && deal.signedBy.signatureImage) {
          doc.fontSize(10).text(`Signed by: ${deal.signedBy.name}`, 50, yPosition);
          yPosition += 15;
          
          if (deal.signedBy.title) {
            doc.text(`Title: ${deal.signedBy.title}`, 50, yPosition);
            yPosition += 15;
          }
          
          doc.text(`Email: ${deal.signedBy.email}`, 50, yPosition);
          yPosition += 15;
          
          if (deal.signatureDate) {
            doc.text(`Date: ${new Date(deal.signatureDate).toLocaleDateString()}`, 50, yPosition);
            yPosition += 15;
          }
          
          // Add signature image if it's a data URL
          if (deal.signedBy.signatureImage.startsWith('data:image')) {
            doc.image(deal.signedBy.signatureImage, 50, yPosition, { width: 150 });
          }
        } else {
          // Signature line for manual signing
          doc.fontSize(10).text('Signature:', 50, yPosition);
          doc.moveTo(120, yPosition).lineTo(300, yPosition).stroke();
          yPosition += 20;
          
          doc.text('Name:', 50, yPosition);
          doc.moveTo(120, yPosition).lineTo(300, yPosition).stroke();
          yPosition += 20;
          
          doc.text('Title:', 50, yPosition);
          doc.moveTo(120, yPosition).lineTo(300, yPosition).stroke();
          yPosition += 20;
          
          doc.text('Date:', 50, yPosition);
          doc.moveTo(120, yPosition).lineTo(300, yPosition).stroke();
        }
      }
      
      // Add footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        
        // Add page number
        doc.fontSize(8).text(
          `Page ${i + 1} of ${pageCount}`,
          50,
          doc.page.height - 50,
          { align: 'center', width: doc.page.width - 100 }
        );
        
        // Add footer text
        doc.fontSize(8).text(
          'Thank you for your business!',
          50,
          doc.page.height - 40,
          { align: 'center', width: doc.page.width - 100 }
        );
      }
      
      // Finalize the PDF
      doc.end();
      
      // When the stream is finished, resolve with the file URL
      stream.on('finish', () => {
        resolve(fileUrl);
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateQuotePdf
};
