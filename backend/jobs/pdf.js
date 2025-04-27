/**
 * PDF generation job processor for JamesCRM
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { APIError } = require('../utils/errorHandler');
const Deal = require('../models/Deal');
const Company = require('../models/Company');
const Contact = require('../models/Contact');
const User = require('../models/User');

/**
 * Process a PDF generation job
 * @param {Object} job - Bull job object
 * @returns {Promise<Object>} Job result
 */
module.exports = async (job) => {
  try {
    // Update job progress
    await job.progress(10);
    
    const { type, id, options } = job.data;
    
    if (!type || !id) {
      throw new APIError('Missing required PDF parameters', 400);
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Create PDF documents directory if it doesn't exist
    const pdfDir = path.join(uploadsDir, 'pdf');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
    
    // Update job progress
    await job.progress(20);
    
    // Generate PDF based on type
    let pdfPath;
    let pdfData;
    
    switch (type) {
      case 'quote':
        // Get deal data
        const deal = await Deal.findById(id)
          .populate('company')
          .populate('contact')
          .populate('billingContact')
          .populate('assignedTo');
        
        if (!deal) {
          throw new APIError(`Deal not found: ${id}`, 404);
        }
        
        // Update job progress
        await job.progress(40);
        
        // Generate quote PDF
        pdfPath = path.join(pdfDir, `quote_${deal._id}.pdf`);
        pdfData = await generateQuotePDF(deal, pdfPath, options);
        break;
        
      case 'company_report':
        // Get company data
        const company = await Company.findById(id);
        
        if (!company) {
          throw new APIError(`Company not found: ${id}`, 404);
        }
        
        // Update job progress
        await job.progress(40);
        
        // Generate company report PDF
        pdfPath = path.join(pdfDir, `company_report_${company._id}.pdf`);
        pdfData = await generateCompanyReportPDF(company, pdfPath, options);
        break;
        
      default:
        throw new APIError(`Unknown PDF type: ${type}`, 400);
    }
    
    // Update job progress
    await job.progress(100);
    
    return {
      success: true,
      pdfPath: pdfPath.replace(/\\/g, '/').replace(`${__dirname}/../`, ''),
      type,
      id,
      ...pdfData
    };
  } catch (error) {
    console.error('PDF job error:', error);
    throw error;
  }
};

/**
 * Generate a quote PDF
 * @param {Object} deal - Deal object
 * @param {String} outputPath - Output file path
 * @param {Object} options - PDF options
 * @returns {Promise<Object>} PDF data
 */
const generateQuotePDF = async (deal, outputPath, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Quote #${deal.quoteNumber}`,
          Author: 'JamesCRM',
          Subject: `Quote for ${deal.company.name}`,
          Keywords: 'quote, proposal, jamescrm'
        }
      });
      
      // Pipe the PDF to a file
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      
      // Add company logo
      // doc.image('path/to/logo.png', 50, 45, { width: 150 });
      
      // Add title
      doc.fontSize(20).text('QUOTE', { align: 'right' });
      doc.fontSize(12).text(`#${deal.quoteNumber}`, { align: 'right' });
      
      // Add date
      doc.moveDown();
      doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
      
      // Add company info
      doc.moveDown(2);
      doc.fontSize(14).text('From:');
      doc.fontSize(12).text('JamesCRM Inc.');
      doc.fontSize(10).text('123 Business Street');
      doc.text('Suite 100');
      doc.text('San Francisco, CA 94107');
      doc.text('Phone: (555) 123-4567');
      doc.text('Email: sales@jamescrm.com');
      
      // Add client info
      doc.moveDown(2);
      doc.fontSize(14).text('To:');
      doc.fontSize(12).text(deal.company.name);
      if (deal.company.address) {
        doc.fontSize(10).text(deal.company.address);
      }
      if (deal.contact) {
        doc.text(`Attn: ${deal.contact.firstName} ${deal.contact.lastName}`);
        doc.text(`Email: ${deal.contact.email}`);
      }
      
      // Add quote details
      doc.moveDown(2);
      doc.fontSize(14).text('Quote Details:');
      doc.moveDown();
      
      // Add items table
      const tableTop = doc.y;
      const tableHeaders = ['Item', 'Description', 'Quantity', 'Unit Price', 'Total'];
      const tableWidths = [80, 200, 70, 80, 80];
      
      // Draw table headers
      let xPos = 50;
      doc.fontSize(10).font('Helvetica-Bold');
      tableHeaders.forEach((header, i) => {
        doc.text(header, xPos, tableTop, { width: tableWidths[i], align: 'left' });
        xPos += tableWidths[i];
      });
      
      // Draw table rows
      doc.font('Helvetica');
      let yPos = tableTop + 20;
      
      // Sample items (in a real implementation, these would come from the deal)
      const items = deal.lineItems || [
        { name: 'Service 1', description: 'Professional service description', quantity: 1, unitPrice: 1000 },
        { name: 'Service 2', description: 'Additional service with longer description that might wrap to multiple lines', quantity: 2, unitPrice: 500 }
      ];
      
      let totalAmount = 0;
      
      items.forEach((item, i) => {
        const itemTotal = item.quantity * item.unitPrice;
        totalAmount += itemTotal;
        
        xPos = 50;
        doc.text(item.name, xPos, yPos, { width: tableWidths[0], align: 'left' });
        xPos += tableWidths[0];
        
        doc.text(item.description, xPos, yPos, { width: tableWidths[1], align: 'left' });
        xPos += tableWidths[1];
        
        doc.text(item.quantity.toString(), xPos, yPos, { width: tableWidths[2], align: 'center' });
        xPos += tableWidths[2];
        
        doc.text(`$${item.unitPrice.toFixed(2)}`, xPos, yPos, { width: tableWidths[3], align: 'right' });
        xPos += tableWidths[3];
        
        doc.text(`$${itemTotal.toFixed(2)}`, xPos, yPos, { width: tableWidths[4], align: 'right' });
        
        yPos += 30;
      });
      
      // Draw total
      doc.moveDown(2);
      doc.fontSize(12).font('Helvetica-Bold').text(`Total: $${totalAmount.toFixed(2)}`, { align: 'right' });
      
      // Add terms and conditions
      doc.moveDown(2);
      doc.fontSize(12).font('Helvetica-Bold').text('Terms and Conditions:');
      doc.fontSize(10).font('Helvetica').text('1. This quote is valid for 30 days from the date of issue.');
      doc.text('2. Payment terms: 50% deposit required to begin work, balance due upon completion.');
      doc.text('3. Estimated completion time: 2-4 weeks from project start date.');
      
      // Add signature section
      doc.moveDown(2);
      doc.fontSize(12).font('Helvetica-Bold').text('Acceptance:');
      doc.fontSize(10).font('Helvetica').text('To accept this quote, please sign below and return a copy to us.');
      
      doc.moveDown(2);
      doc.text('Signature: _______________________________');
      doc.moveDown();
      doc.text('Name: ___________________________________');
      doc.moveDown();
      doc.text('Date: ___________________________________');
      
      // Finalize the PDF
      doc.end();
      
      // Handle stream events
      stream.on('finish', () => {
        resolve({
          fileName: path.basename(outputPath),
          size: fs.statSync(outputPath).size,
          totalAmount
        });
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate a company report PDF
 * @param {Object} company - Company object
 * @param {String} outputPath - Output file path
 * @param {Object} options - PDF options
 * @returns {Promise<Object>} PDF data
 */
const generateCompanyReportPDF = async (company, outputPath, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Company Report - ${company.name}`,
          Author: 'JamesCRM',
          Subject: `Report for ${company.name}`,
          Keywords: 'report, company, jamescrm'
        }
      });
      
      // Pipe the PDF to a file
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      
      // Add title
      doc.fontSize(20).text('COMPANY REPORT', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text(company.name, { align: 'center' });
      
      // Add date
      doc.moveDown();
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
      
      // Add company info
      doc.moveDown(2);
      doc.fontSize(14).text('Company Information:');
      doc.moveDown();
      doc.fontSize(12).text(`Name: ${company.name}`);
      doc.text(`Industry: ${company.industry || 'N/A'}`);
      doc.text(`Website: ${company.website || 'N/A'}`);
      doc.text(`Phone: ${company.phone || 'N/A'}`);
      doc.text(`Address: ${company.address || 'N/A'}`);
      
      // Add summary
      doc.moveDown(2);
      doc.fontSize(14).text('Summary:');
      doc.moveDown();
      doc.fontSize(10).text(company.description || 'No description available.');
      
      // Finalize the PDF
      doc.end();
      
      // Handle stream events
      stream.on('finish', () => {
        resolve({
          fileName: path.basename(outputPath),
          size: fs.statSync(outputPath).size
        });
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};
