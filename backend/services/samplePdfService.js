const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Create a sample PDF file for testing
const createSamplePdf = (dealId) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `${dealId}_${timestamp}.pdf`;
      const filePath = path.join(__dirname, '../uploads/quotes', filename);
      
      // Create a PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Pipe the PDF to a file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Add content to the PDF
      doc.fontSize(25).text('Sample Quote PDF', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text(`Quote ID: ${dealId}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text('This is a sample PDF generated for testing purposes.', { align: 'center' });
      doc.moveDown(2);
      
      // Add a table-like structure
      doc.fontSize(14).text('Line Items:', { underline: true });
      doc.moveDown();
      
      // Table header
      const tableTop = doc.y;
      const tableLeft = 50;
      const colWidths = [250, 80, 80, 80];
      
      doc.fontSize(12);
      doc.text('Description', tableLeft, tableTop);
      doc.text('Quantity', tableLeft + colWidths[0], tableTop);
      doc.text('Unit Price', tableLeft + colWidths[0] + colWidths[1], tableTop);
      doc.text('Total', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop);
      
      doc.moveDown();
      
      // Sample line items
      const items = [
        { description: 'Website Design', quantity: 1, unitPrice: 2000, total: 2000 },
        { description: 'Website Development', quantity: 1, unitPrice: 3000, total: 3000 },
        { description: 'Content Creation', quantity: 1, unitPrice: 1000, total: 1000 }
      ];
      
      let y = doc.y;
      items.forEach(item => {
        doc.text(item.description, tableLeft, y);
        doc.text(item.quantity.toString(), tableLeft + colWidths[0], y);
        doc.text(`$${item.unitPrice.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1], y);
        doc.text(`$${item.total.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], y);
        y += 20;
      });
      
      // Add a line
      doc.moveDown(2);
      doc.moveTo(tableLeft, doc.y)
         .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] - 50, doc.y)
         .stroke();
      
      doc.moveDown();
      
      // Add totals
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax;
      
      doc.fontSize(12);
      doc.text('Subtotal:', tableLeft + colWidths[0] + colWidths[1], doc.y);
      doc.text(`$${subtotal.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], doc.y);
      doc.moveDown();
      
      doc.text('Tax (10%):', tableLeft + colWidths[0] + colWidths[1], doc.y);
      doc.text(`$${tax.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], doc.y);
      doc.moveDown();
      
      doc.fontSize(14).text('Total:', tableLeft + colWidths[0] + colWidths[1], doc.y);
      doc.fontSize(14).text(`$${total.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], doc.y);
      
      // Add footer
      doc.fontSize(10);
      doc.moveDown(4);
      doc.text('Thank you for your business!', { align: 'center' });
      doc.moveDown();
      doc.text('This is a sample PDF for demonstration purposes only.', { align: 'center' });
      
      // Finalize the PDF
      doc.end();
      
      // Wait for the stream to finish
      stream.on('finish', () => {
        const pdfUrl = `/uploads/quotes/${filename}`;
        resolve(pdfUrl);
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { createSamplePdf };
