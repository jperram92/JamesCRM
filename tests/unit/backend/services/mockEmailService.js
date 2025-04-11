/**
 * Mock Email Service for testing
 */

const nodemailer = require('nodemailer');

// Create a mock transport
const mockTransport = {
  sendMail: jest.fn().mockResolvedValue({
    messageId: 'mock-message-id',
    envelope: {
      from: 'from@example.com',
      to: ['to@example.com']
    },
    accepted: ['to@example.com'],
    rejected: [],
    pending: [],
    response: '250 OK'
  })
};

// Mock nodemailer createTransport
nodemailer.createTransport = jest.fn().mockReturnValue(mockTransport);

/**
 * Email Service
 */
const emailService = {
  /**
   * Send an email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.text - Plain text content
   * @param {string} options.html - HTML content
   * @returns {Promise<Object>} - Delivery result
   */
  sendEmail: async (options) => {
    try {
      const { to, subject, text, html } = options;
      
      if (!to) {
        throw new Error('Recipient email is required');
      }
      
      if (!subject) {
        throw new Error('Email subject is required');
      }
      
      if (!text && !html) {
        throw new Error('Email content is required (text or html)');
      }
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@jamescrm.com',
        to,
        subject,
        text,
        html
      };
      
      const result = await mockTransport.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        to: result.envelope.to
      };
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Send a welcome email
   * @param {Object} user - User object
   * @returns {Promise<Object>} - Delivery result
   */
  sendWelcomeEmail: async (user) => {
    try {
      if (!user || !user.email) {
        throw new Error('User email is required');
      }
      
      const subject = 'Welcome to JamesCRM';
      const text = `Hello ${user.first_name || 'there'},\n\nWelcome to JamesCRM! We're excited to have you on board.\n\nBest regards,\nThe JamesCRM Team`;
      const html = `<p>Hello ${user.first_name || 'there'},</p><p>Welcome to JamesCRM! We're excited to have you on board.</p><p>Best regards,<br>The JamesCRM Team</p>`;
      
      return await emailService.sendEmail({
        to: user.email,
        subject,
        text,
        html
      });
    } catch (error) {
      console.error('Welcome email error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Send a password reset email
   * @param {Object} options - Options
   * @param {string} options.email - User email
   * @param {string} options.resetToken - Reset token
   * @param {string} options.resetUrl - Reset URL
   * @returns {Promise<Object>} - Delivery result
   */
  sendPasswordResetEmail: async (options) => {
    try {
      const { email, resetToken, resetUrl } = options;
      
      if (!email) {
        throw new Error('User email is required');
      }
      
      if (!resetToken) {
        throw new Error('Reset token is required');
      }
      
      if (!resetUrl) {
        throw new Error('Reset URL is required');
      }
      
      const subject = 'Password Reset Request';
      const text = `You requested a password reset. Please use the following link to reset your password: ${resetUrl}\n\nIf you didn't request this, please ignore this email.`;
      const html = `<p>You requested a password reset. Please use the following link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, please ignore this email.</p>`;
      
      return await emailService.sendEmail({
        to: email,
        subject,
        text,
        html
      });
    } catch (error) {
      console.error('Password reset email error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Send an invitation email
   * @param {Object} options - Options
   * @param {string} options.email - Recipient email
   * @param {string} options.invitationToken - Invitation token
   * @param {string} options.invitationUrl - Invitation URL
   * @param {string} options.inviterName - Inviter name
   * @returns {Promise<Object>} - Delivery result
   */
  sendInvitationEmail: async (options) => {
    try {
      const { email, invitationToken, invitationUrl, inviterName } = options;
      
      if (!email) {
        throw new Error('Recipient email is required');
      }
      
      if (!invitationToken) {
        throw new Error('Invitation token is required');
      }
      
      if (!invitationUrl) {
        throw new Error('Invitation URL is required');
      }
      
      const subject = 'Invitation to JamesCRM';
      const text = `${inviterName || 'Someone'} has invited you to join JamesCRM. Please use the following link to complete your registration: ${invitationUrl}\n\nThis invitation will expire in 7 days.`;
      const html = `<p>${inviterName || 'Someone'} has invited you to join JamesCRM. Please use the following link to complete your registration:</p><p><a href="${invitationUrl}">${invitationUrl}</a></p><p>This invitation will expire in 7 days.</p>`;
      
      return await emailService.sendEmail({
        to: email,
        subject,
        text,
        html
      });
    } catch (error) {
      console.error('Invitation email error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

module.exports = emailService;
