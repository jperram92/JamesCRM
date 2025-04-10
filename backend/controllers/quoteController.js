const Deal = require('../models/Deal');
const pdfService = require('../services/pdfService');
const signatureService = require('../services/signatureService');
const emailService = require('../services/emailService');
const path = require('path');
const samplePdfService = require('../services/samplePdfService');

// Import mockDeals array from dealController
const { mockDeals } = require('./dealController');

// @desc    Generate PDF for a deal
// @route   POST /api/quotes/:id/generate-pdf
// @access  Private
exports.generatePdf = async (req, res) => {
  try {
    console.log('Generate PDF - Deal ID:', req.params.id);

    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      console.log('Generate PDF - Using mock data (SKIP_MONGODB=true)');

      // Find the deal in the mockDeals array
      const deal = mockDeals.find(d => d._id === req.params.id);

      if (!deal) {
        console.log('Generate PDF - Deal not found in mock data');
        return res.status(404).json({ message: 'Deal not found' });
      }

      console.log('Generate PDF - Found deal:', deal.name);

      // Generate a real sample PDF file
      try {
        const pdfUrl = await samplePdfService.createSamplePdf(deal._id);

        // Update deal with PDF URL
        deal.pdfUrl = pdfUrl;

        console.log('Generate PDF - Sample PDF created:', pdfUrl);
        return res.json({ pdfUrl });
      } catch (pdfError) {
        console.error('Generate PDF - Error creating sample PDF:', pdfError);
        return res.status(500).json({ message: 'Error generating PDF' });
      }
    }

    const deal = await Deal.findById(req.params.id)
      .populate('company', 'name industry address')
      .populate('contact', 'firstName lastName email phone')
      .populate('billingContact', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Options for PDF generation
    const options = {
      logoPath: path.join(__dirname, '../assets/logo.png') // Update with your logo path
    };

    // Generate PDF
    const pdfUrl = await pdfService.generateQuotePdf(deal, options);

    // Update deal with PDF URL
    deal.pdfUrl = pdfUrl;
    await deal.save();

    res.json({ pdfUrl });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
};

// @desc    Send signature request
// @route   POST /api/quotes/:id/send-signature
// @access  Private
exports.sendSignatureRequest = async (req, res) => {
  try {
    console.log('Send Signature Request - Deal ID:', req.params.id);
    console.log('Send Signature Request - Request Body:', req.body);

    const { recipientEmail, recipientName } = req.body;

    if (!recipientEmail || !recipientName) {
      console.log('Send Signature Request - Missing required fields');
      return res.status(400).json({ message: 'Recipient email and name are required' });
    }

    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      console.log('Send Signature Request - Using mock data (SKIP_MONGODB=true)');

      // Find the deal in the mockDeals array
      const dealIndex = mockDeals.findIndex(d => d._id === req.params.id);

      if (dealIndex === -1) {
        console.log('Send Signature Request - Deal not found in mock data');
        return res.status(404).json({ message: 'Deal not found' });
      }

      console.log('Send Signature Request - Found deal:', mockDeals[dealIndex].name);

      // Generate mock token
      const token = `mock-token-${Date.now()}`;

      // Generate signature URL
      const signatureUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/signature/${token}`;

      // Update deal status to 'Sent'
      mockDeals[dealIndex].status = 'Sent';

      // Send a real email using the email service
      try {
        await emailService.sendEmail({
          to: recipientEmail,
          subject: `Signature Request: ${mockDeals[dealIndex].name} (${mockDeals[dealIndex].quoteNumber})`,
          html: `
            <h2>Signature Request</h2>
            <p>Dear ${recipientName},</p>
            <p>You have received a quote from JamesCRM.</p>
            <p><strong>Quote Details:</strong></p>
            <ul>
              <li>Quote Number: ${mockDeals[dealIndex].quoteNumber}</li>
              <li>Quote Name: ${mockDeals[dealIndex].name}</li>
              <li>Company: ${mockDeals[dealIndex].company.name}</li>
              <li>Amount: ${mockDeals[dealIndex].currency} ${mockDeals[dealIndex].totalAmount.toFixed(2)}</li>
            </ul>
            <p>Please click the link below to view and sign the quote:</p>
            <p><a href="${signatureUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">View and Sign Quote</a></p>
            <p>Or copy and paste this URL into your browser:</p>
            <p>${signatureUrl}</p>
            <p>This link will expire in 30 days.</p>
            <p>Thank you,<br>JamesCRM Team</p>
          `
        });
        console.log(`Real email sent to ${recipientEmail} for deal ${mockDeals[dealIndex]._id}`);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Continue even if email fails
      }

      console.log(`Signature request processed for deal ${mockDeals[dealIndex]._id}`);
      console.log(`Signature URL: ${signatureUrl}`);

      return res.json({ message: 'Signature request sent successfully' });
    }

    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Base URL for signature page
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Send signature request
    await signatureService.sendSignatureRequest(
      deal._id,
      recipientEmail,
      recipientName,
      baseUrl
    );

    res.json({ message: 'Signature request sent successfully' });
  } catch (error) {
    console.error('Error sending signature request:', error);
    res.status(500).json({ message: 'Error sending signature request' });
  }
};

// @desc    Verify signature token
// @route   GET /api/quotes/verify-signature/:token
// @access  Public
exports.verifySignatureToken = async (req, res) => {
  try {
    console.log('Verify Signature Token - Token:', req.params.token);

    const { token } = req.params;

    if (!token) {
      console.log('Verify Signature Token - Token is required');
      return res.status(400).json({ message: 'Token is required' });
    }

    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      console.log('Verify Signature Token - Using mock data (SKIP_MONGODB=true)');

      // Check if it's a mock token
      if (token.startsWith('mock-token-')) {
        console.log('Verify Signature Token - Valid mock token');

        // Use the first deal as a sample
        const deal = mockDeals[0];

        return res.json({
          dealId: deal._id,
          email: 'test@example.com',
          deal: {
            name: deal.name,
            quoteNumber: deal.quoteNumber,
            company: deal.company,
            totalAmount: deal.totalAmount,
            currency: deal.currency
          }
        });
      } else {
        console.log('Verify Signature Token - Invalid mock token');
        return res.status(400).json({ message: 'Invalid token' });
      }
    }

    // Verify token
    const tokenData = await signatureService.verifySignatureToken(token);

    res.json({
      dealId: tokenData.dealId,
      email: tokenData.email,
      deal: {
        name: tokenData.deal.name,
        quoteNumber: tokenData.deal.quoteNumber,
        company: tokenData.deal.company,
        totalAmount: tokenData.deal.totalAmount,
        currency: tokenData.deal.currency
      }
    });
  } catch (error) {
    console.error('Error verifying signature token:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// @desc    Process signature
// @route   POST /api/quotes/process-signature/:token
// @access  Public
exports.processSignature = async (req, res) => {
  try {
    console.log('Process Signature - Token:', req.params.token);
    console.log('Process Signature - Request Body:', req.body);

    const { token } = req.params;
    const { name, email, title, signatureImage } = req.body;

    if (!token || !name || !email || !signatureImage) {
      console.log('Process Signature - Missing required fields');
      return res.status(400).json({
        message: 'Token, name, email, and signature image are required'
      });
    }

    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      console.log('Process Signature - Using mock data (SKIP_MONGODB=true)');

      // Check if it's a mock token
      if (token.startsWith('mock-token-')) {
        console.log('Process Signature - Valid mock token');

        // Find a deal to update (use the first one for simplicity)
        if (mockDeals.length > 0) {
          const dealIndex = 0;

          // Update deal status and signature info
          mockDeals[dealIndex].status = 'Accepted';
          mockDeals[dealIndex].signedBy = {
            name,
            email,
            title,
            signatureImage: signatureImage.substring(0, 50) + '...' // Truncate for logging
          };
          mockDeals[dealIndex].signatureDate = new Date().toISOString();

          console.log(`Signature processed for deal ${mockDeals[dealIndex]._id}`);

          return res.json({ message: 'Signature processed successfully' });
        } else {
          console.log('Process Signature - No deals found in mock data');
          return res.status(404).json({ message: 'Deal not found' });
        }
      } else {
        console.log('Process Signature - Invalid mock token');
        return res.status(400).json({ message: 'Invalid token' });
      }
    }

    // Verify token
    const tokenData = await signatureService.verifySignatureToken(token);

    // Update deal with signature
    const deal = await Deal.findById(tokenData.dealId);

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    deal.signedBy = {
      name,
      email,
      title,
      signatureImage
    };
    deal.signatureDate = new Date();
    deal.status = 'Accepted';

    await deal.save();

    res.json({ message: 'Signature processed successfully' });
  } catch (error) {
    console.error('Error processing signature:', error);
    res.status(500).json({ message: 'Error processing signature' });
  }
};
