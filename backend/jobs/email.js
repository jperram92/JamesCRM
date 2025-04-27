/**
 * Email job processor for JamesCRM
 */
const emailService = require('../services/emailService');
const { APIError } = require('../utils/errorHandler');

/**
 * Process an email job
 * @param {Object} job - Bull job object
 * @returns {Promise<Object>} Job result
 */
module.exports = async (job) => {
  try {
    // Update job progress
    await job.progress(10);
    
    const { type, to, subject, template, data, userId } = job.data;
    
    if (!type || !to || !subject) {
      throw new APIError('Missing required email parameters', 400);
    }
    
    // Update job progress
    await job.progress(30);
    
    // Send email based on type
    let result;
    
    switch (type) {
      case 'invitation':
        result = await emailService.sendInvitationEmail(to, data.token, data.invitedBy);
        break;
        
      case 'password_reset':
        result = await emailService.sendPasswordResetEmail(to, data.token);
        break;
        
      case 'welcome':
        result = await emailService.sendWelcomeEmail(to, data.firstName);
        break;
        
      case 'deal_created':
        result = await emailService.sendDealCreatedEmail(to, data.deal);
        break;
        
      case 'quote_sent':
        result = await emailService.sendQuoteEmail(to, data.quote, data.pdfUrl);
        break;
        
      case 'custom':
        // Send custom email with template
        result = await emailService.sendEmail({
          to,
          subject,
          template,
          data,
          userId,
          type: 'custom'
        });
        break;
        
      default:
        throw new APIError(`Unknown email type: ${type}`, 400);
    }
    
    // Update job progress
    await job.progress(100);
    
    return {
      success: true,
      emailId: result.id || result._id,
      to,
      subject,
      type
    };
  } catch (error) {
    console.error('Email job error:', error);
    throw error;
  }
};
