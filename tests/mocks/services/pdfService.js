/**
 * Mock PDF service for testing
 */

class MockPdfService {
  constructor() {
    this.generatedPdfs = [];
  }

  /**
   * Reset the generated PDFs array
   */
  reset() {
    this.generatedPdfs = [];
  }

  /**
   * Generate a PDF quote from a deal
   * @param {Object} deal - The deal object
   * @param {Object} options - Options for PDF generation
   * @returns {Promise<string>} - The path to the generated PDF
   */
  async generateQuotePdf(deal, options = {}) {
    const pdfRecord = {
      id: this.generatedPdfs.length + 1,
      deal_id: deal.id,
      filename: `quote_${deal.quote_number.replace(/[^a-zA-Z0-9]/g, '_')}_mock.pdf`,
      path: `/uploads/quotes/quote_${deal.quote_number.replace(/[^a-zA-Z0-9]/g, '_')}_mock.pdf`,
      generated_at: new Date(),
    };

    this.generatedPdfs.push(pdfRecord);
    
    return pdfRecord.path;
  }

  /**
   * Generate a PDF contract from a deal
   * @param {Object} deal - The deal object
   * @param {Object} options - Options for PDF generation
   * @returns {Promise<string>} - The path to the generated PDF
   */
  async generateContractPdf(deal, options = {}) {
    const pdfRecord = {
      id: this.generatedPdfs.length + 1,
      deal_id: deal.id,
      filename: `contract_${deal.quote_number.replace(/[^a-zA-Z0-9]/g, '_')}_mock.pdf`,
      path: `/uploads/contracts/contract_${deal.quote_number.replace(/[^a-zA-Z0-9]/g, '_')}_mock.pdf`,
      generated_at: new Date(),
    };

    this.generatedPdfs.push(pdfRecord);
    
    return pdfRecord.path;
  }
}

module.exports = new MockPdfService();
