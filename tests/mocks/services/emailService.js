/**
 * Mock email service for testing
 */

class MockEmailService {
  constructor() {
    this.sentEmails = [];
  }

  /**
   * Reset the sent emails array
   */
  reset() {
    this.sentEmails = [];
  }

  /**
   * Send an email
   * @param {Object} options - Email options
   * @returns {Promise<Object>} - Email delivery record
   */
  async sendEmail(options) {
    const emailRecord = {
      id: this.sentEmails.length + 1,
      to: options.to,
      from: options.from || 'noreply@jamescrm.example.com',
      subject: options.subject,
      html: options.html,
      text: options.text,
      sent_at: new Date(),
      status: 'sent',
    };

    this.sentEmails.push(emailRecord);
    
    return {
      id: emailRecord.id,
      status: emailRecord.status,
    };
  }

  /**
   * Send user invitation email
   * @param {Object} user - User object
   * @param {string} tempPassword - Temporary password
   * @returns {Promise<Object>} - Email delivery record
   */
  async sendUserInvitation(user, tempPassword) {
    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to JamesCRM',
      html: `<p>Hello,</p><p>You've been invited to join JamesCRM.</p><p>Your temporary password is: ${tempPassword}</p>`,
      text: `Hello, You've been invited to join JamesCRM. Your temporary password is: ${tempPassword}`,
    });
  }

  /**
   * Send password reset email
   * @param {Object} user - User object
   * @param {string} resetToken - Password reset token
   * @returns {Promise<Object>} - Email delivery record
   */
  async sendPasswordReset(user, resetToken) {
    return this.sendEmail({
      to: user.email,
      subject: 'Reset Your JamesCRM Password',
      html: `<p>Hello ${user.first_name},</p><p>Click <a href="http://localhost:3000/reset-password?token=${resetToken}">here</a> to reset your password.</p>`,
      text: `Hello ${user.first_name}, Click here to reset your password: http://localhost:3000/reset-password?token=${resetToken}`,
    });
  }

  /**
   * Send deal notification email
   * @param {Object} deal - Deal object
   * @param {Object} user - User object
   * @returns {Promise<Object>} - Email delivery record
   */
  async sendDealNotification(deal, user) {
    return this.sendEmail({
      to: user.email,
      subject: `New Deal: ${deal.name}`,
      html: `<p>Hello ${user.first_name},</p><p>A new deal "${deal.name}" has been created.</p>`,
      text: `Hello ${user.first_name}, A new deal "${deal.name}" has been created.`,
    });
  }
}

module.exports = new MockEmailService();
