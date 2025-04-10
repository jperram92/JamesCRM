const Deal = require('../models/Deal');
const emailService = require('./emailService');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Import mockDeals array from dealController if needed
let mockDeals;
try {
  mockDeals = require('../controllers/dealController').mockDeals;
} catch (error) {
  // If mockDeals is not available, create an empty array
  mockDeals = [];
}

/**
 * Generate a unique signature token for a deal
 * @param {string} dealId - The deal ID
 * @param {string} email - The recipient's email
 * @returns {Promise<string>} - The signature token
 */
const generateSignatureToken = async (dealId, email) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      console.log('Signature Service - generateSignatureToken - Using mock data (SKIP_MONGODB=true)');

      // Find the deal in mockDeals array
      const deal = mockDeals.find(d => d._id === dealId);

      if (!deal) {
        console.log('Signature Service - generateSignatureToken - Deal not found in mock data');
        throw new Error('Deal not found');
      }

      // Create a token with deal ID and email
      const token = jwt.sign(
        { dealId, email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' } // Token expires in 30 days
      );

      console.log('Signature Service - generateSignatureToken - Token generated for mock deal');
      return token;
    }

    // Find the deal
    const deal = await Deal.findById(dealId);
    if (!deal) {
      throw new Error('Deal not found');
    }

    // Create a token with deal ID and email
    const token = jwt.sign(
      { dealId, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' } // Token expires in 30 days
    );

    return token;
  } catch (error) {
    console.error('Error generating signature token:', error);
    throw error;
  }
};

/**
 * Verify a signature token
 * @param {string} token - The signature token
 * @returns {Promise<Object>} - The decoded token data
 */
const verifySignatureToken = async (token) => {
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      console.log('Signature Service - verifySignatureToken - Using mock data (SKIP_MONGODB=true)');

      // Find the deal in mockDeals array
      const deal = mockDeals.find(d => d._id === decoded.dealId);

      if (!deal) {
        console.log('Signature Service - verifySignatureToken - Deal not found in mock data');
        throw new Error('Deal not found');
      }

      console.log('Signature Service - verifySignatureToken - Token verified for mock deal');
      return {
        dealId: decoded.dealId,
        email: decoded.email,
        deal
      };
    }

    // Find the deal
    const deal = await Deal.findById(decoded.dealId);
    if (!deal) {
      throw new Error('Deal not found');
    }

    return {
      dealId: decoded.dealId,
      email: decoded.email,
      deal
    };
  } catch (error) {
    console.error('Error verifying signature token:', error);
    throw error;
  }
};

/**
 * Send a signature request email
 * @param {string} dealId - The deal ID
 * @param {string} recipientEmail - The recipient's email
 * @param {string} recipientName - The recipient's name
 * @param {string} baseUrl - The base URL for the signature page
 * @returns {Promise<void>}
 */
const sendSignatureRequest = async (dealId, recipientEmail, recipientName, baseUrl) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      console.log('Signature Service - sendSignatureRequest - Using mock data (SKIP_MONGODB=true)');

      // Find the deal in mockDeals array
      const deal = mockDeals.find(d => d._id === dealId);

      if (!deal) {
        console.log('Signature Service - sendSignatureRequest - Deal not found in mock data');
        throw new Error('Deal not found');
      }

      // Generate signature token
      const token = await generateSignatureToken(dealId, recipientEmail);

      // Create signature URL
      const signatureUrl = `${baseUrl}/signature/${token}`;

      // Send email
      await emailService.sendEmail({
        to: recipientEmail,
        subject: `Signature Request: ${deal.name} (${deal.quoteNumber})`,
        html: `
          <h2>Signature Request</h2>
          <p>Dear ${recipientName},</p>
          <p>You have received a quote from JamesCRM.</p>
          <p><strong>Quote Details:</strong></p>
          <ul>
            <li>Quote Number: ${deal.quoteNumber}</li>
            <li>Quote Name: ${deal.name}</li>
            <li>Company: ${deal.company.name}</li>
            <li>Amount: ${deal.currency} ${deal.totalAmount.toFixed(2)}</li>
          </ul>
          <p>Please click the link below to view and sign the quote:</p>
          <p><a href="${signatureUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">View and Sign Quote</a></p>
          <p>Or copy and paste this URL into your browser:</p>
          <p>${signatureUrl}</p>
          <p>This link will expire in 30 days.</p>
          <p>Thank you,<br>JamesCRM Team</p>
        `
      });

      console.log('Signature Service - sendSignatureRequest - Email sent for mock deal');
      return signatureUrl;
    }

    // Find the deal
    const deal = await Deal.findById(dealId)
      .populate('company', 'name')
      .populate('createdBy', 'firstName lastName email');

    if (!deal) {
      throw new Error('Deal not found');
    }

    // Generate signature token
    const token = await generateSignatureToken(dealId, recipientEmail);

    // Create signature URL
    const signatureUrl = `${baseUrl}/signature/${token}`;

    // Send email
    await emailService.sendEmail({
      to: recipientEmail,
      subject: `Signature Request: ${deal.name} (${deal.quoteNumber})`,
      html: `
        <h2>Signature Request</h2>
        <p>Dear ${recipientName},</p>
        <p>You have received a quote from ${deal.createdBy.firstName} ${deal.createdBy.lastName} at JamesCRM.</p>
        <p><strong>Quote Details:</strong></p>
        <ul>
          <li>Quote Number: ${deal.quoteNumber}</li>
          <li>Quote Name: ${deal.name}</li>
          <li>Company: ${deal.company.name}</li>
          <li>Amount: ${deal.currency} ${deal.totalAmount.toFixed(2)}</li>
        </ul>
        <p>Please click the link below to view and sign the quote:</p>
        <p><a href="${signatureUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">View and Sign Quote</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${signatureUrl}</p>
        <p>This link will expire in 30 days.</p>
        <p>If you have any questions, please contact ${deal.createdBy.firstName} ${deal.createdBy.lastName} at ${deal.createdBy.email}.</p>
        <p>Thank you,<br>JamesCRM Team</p>
      `
    });

    // Update deal status to Sent if it's in Draft
    if (deal.status === 'Draft') {
      deal.status = 'Sent';
      await deal.save();
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending signature request:', error);
    throw error;
  }
};

module.exports = {
  generateSignatureToken,
  verifySignatureToken,
  sendSignatureRequest
};
