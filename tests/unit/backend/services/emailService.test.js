/**
 * Unit tests for email service
 */

// Import dependencies
const { mockUsers } = require('../../../mocks/data');
const emailService = require('./mockEmailService');
const nodemailer = require('nodemailer');

// Get the mock transport
const mockTransport = nodemailer.createTransport();

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      // Arrange
      const emailOptions = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test content',
        html: '<p>Test content</p>'
      };

      // Act
      const result = await emailService.sendEmail(emailOptions);

      // Assert
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('mock-message-id');
      expect(mockTransport.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: emailOptions.to,
        subject: emailOptions.subject,
        text: emailOptions.text,
        html: emailOptions.html
      }));
    });

    it('should handle missing recipient', async () => {
      // Arrange
      const emailOptions = {
        subject: 'Test Subject',
        text: 'Test content',
        html: '<p>Test content</p>'
      };

      // Act
      const result = await emailService.sendEmail(emailOptions);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Recipient email is required');
      expect(mockTransport.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send a welcome email successfully', async () => {
      // Arrange
      const user = {
        id: 1,
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe'
      };

      // Act
      const result = await emailService.sendWelcomeEmail(user);

      // Assert
      expect(result.success).toBe(true);
      expect(mockTransport.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: user.email,
        subject: 'Welcome to JamesCRM'
      }));
    });

    it('should handle missing user email', async () => {
      // Arrange
      const user = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe'
      };

      // Act
      const result = await emailService.sendWelcomeEmail(user);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User email is required');
      expect(mockTransport.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send a password reset email successfully', async () => {
      // Arrange
      const options = {
        email: 'user@example.com',
        resetToken: 'reset-token-123',
        resetUrl: 'https://example.com/reset-password?token=reset-token-123'
      };

      // Act
      const result = await emailService.sendPasswordResetEmail(options);

      // Assert
      expect(result.success).toBe(true);
      expect(mockTransport.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: options.email,
        subject: 'Password Reset Request'
      }));
    });

    it('should handle missing email', async () => {
      // Arrange
      const options = {
        resetToken: 'reset-token-123',
        resetUrl: 'https://example.com/reset-password?token=reset-token-123'
      };

      // Act
      const result = await emailService.sendPasswordResetEmail(options);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User email is required');
      expect(mockTransport.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('sendInvitationEmail', () => {
    it('should send an invitation email successfully', async () => {
      // Arrange
      const options = {
        email: 'newuser@example.com',
        invitationToken: 'invitation-token-123',
        invitationUrl: 'https://example.com/accept-invitation?token=invitation-token-123',
        inviterName: 'John Doe'
      };

      // Act
      const result = await emailService.sendInvitationEmail(options);

      // Assert
      expect(result.success).toBe(true);
      expect(mockTransport.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: options.email,
        subject: 'Invitation to JamesCRM'
      }));
    });

    it('should handle missing email', async () => {
      // Arrange
      const options = {
        invitationToken: 'invitation-token-123',
        invitationUrl: 'https://example.com/accept-invitation?token=invitation-token-123',
        inviterName: 'John Doe'
      };

      // Act
      const result = await emailService.sendInvitationEmail(options);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Recipient email is required');
      expect(mockTransport.sendMail).not.toHaveBeenCalled();
    });
  });
});
