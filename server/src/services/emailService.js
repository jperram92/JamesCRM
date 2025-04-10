const emailConfig = require('../config/email');
const { EmailDelivery } = require('../models');
const nodemailer = require('nodemailer');
let sgMail, Mailgun;

// Conditionally require email service providers
try {
  sgMail = require('@sendgrid/mail');
} catch (error) {
  console.warn('SendGrid package not installed. SendGrid email provider will not be available.');
}

try {
  Mailgun = require('mailgun-js');
} catch (error) {
  console.warn('Mailgun package not installed. Mailgun email provider will not be available.');
}

/**
 * Email Service for sending emails
 */
class EmailService {
  constructor() {
    this.initializeProvider();
  }

  /**
   * Initialize the email provider based on configuration
   */
  initializeProvider() {
    const { provider } = emailConfig;

    switch (provider) {
      case 'mock':
        this.sendEmail = this.sendWithConsoleLog;
        console.log('Mock email provider initialized');
        break;
      case 'sendgrid':
        if (!sgMail) {
          console.warn('SendGrid package not installed. Falling back to SMTP.');
          this.initializeSMTP();
          break;
        }
        try {
          sgMail.setApiKey(emailConfig.sendgrid.apiKey);
          this.sendEmail = this.sendWithSendGrid;
          console.log('SendGrid email provider initialized');
        } catch (error) {
          console.error('Failed to initialize SendGrid:', error.message);
          this.initializeSMTP();
        }
        break;
      case 'mailgun':
        if (!Mailgun) {
          console.warn('Mailgun package not installed. Falling back to SMTP.');
          this.initializeSMTP();
          break;
        }
        try {
          this.mailgun = Mailgun({
            apiKey: emailConfig.mailgun.apiKey,
            domain: emailConfig.mailgun.domain
          });
          this.sendEmail = this.sendWithMailgun;
          console.log('Mailgun email provider initialized');
        } catch (error) {
          console.error('Failed to initialize Mailgun:', error.message);
          this.initializeSMTP();
        }
        break;
      case 'smtp':
      default:
        this.initializeSMTP();
        break;
    }
  }

  /**
   * Initialize SMTP transport
   */
  initializeSMTP() {
    try {
      this.transporter = nodemailer.createTransport({
        host: emailConfig.smtp.host,
        port: emailConfig.smtp.port,
        secure: emailConfig.smtp.secure,
        auth: emailConfig.smtp.auth
      });
      this.sendEmail = this.sendWithSmtp;
      console.log('SMTP email provider initialized');
    } catch (error) {
      console.error('Failed to initialize SMTP:', error.message);
      this.sendEmail = this.sendWithConsoleLog;
      console.warn('Using console.log for emails as fallback');
    }
  }

  /**
   * Fallback email sender that just logs to console
   * @param {Object} options - Email options
   * @returns {Promise<Object>} - Email delivery record
   */
  async sendWithConsoleLog(options) {
    const { to, subject, html, text, userId, type } = options;

    console.log('\n==== EMAIL WOULD BE SENT ====');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Type: ${type}`);
    console.log('\nText content:');
    console.log(text);
    console.log('\nHTML content:');
    console.log(html);
    console.log('==== END OF EMAIL ====\n');

    try {
      // Create email delivery record
      const emailDelivery = await EmailDelivery.create({
        user_id: userId,
        email_type: type,
        recipient: to,
        subject,
        status: 'delivered',
        provider: 'console',
        provider_id: null,
        sent_at: new Date()
      });

      return emailDelivery;
    } catch (error) {
      console.error('Error creating email delivery record:', error);
      // Return a mock delivery record if database is not available
      return {
        id: Math.floor(Math.random() * 1000),
        user_id: userId,
        email_type: type,
        recipient: to,
        subject,
        status: 'delivered',
        provider: 'console',
        provider_id: null,
        sent_at: new Date()
      };
    }
  }

  /**
   * Send email with SendGrid
   * @param {Object} options - Email options
   * @returns {Promise<Object>} - Email delivery record
   */
  async sendWithSendGrid(options) {
    const { to, subject, html, text, userId, type } = options;

    const msg = {
      to,
      from: {
        email: emailConfig.sendgrid.fromEmail,
        name: emailConfig.sendgrid.fromName
      },
      subject,
      text,
      html
    };

    try {
      const response = await sgMail.send(msg);

      // Create email delivery record
      const emailDelivery = await EmailDelivery.create({
        user_id: userId,
        email_type: type,
        recipient: to,
        subject,
        status: 'delivered',
        provider: 'sendgrid',
        provider_id: response[0]?.headers['x-message-id'] || null,
        sent_at: new Date()
      });

      return emailDelivery;
    } catch (error) {
      // Create failed email delivery record
      const emailDelivery = await EmailDelivery.create({
        user_id: userId,
        email_type: type,
        recipient: to,
        subject,
        status: 'failed',
        provider: 'sendgrid',
        error_message: error.message,
        sent_at: new Date()
      });

      throw error;
    }
  }

  /**
   * Send email with Mailgun
   * @param {Object} options - Email options
   * @returns {Promise<Object>} - Email delivery record
   */
  async sendWithMailgun(options) {
    const { to, subject, html, text, userId, type } = options;

    const data = {
      from: `${emailConfig.mailgun.fromName} <${emailConfig.mailgun.fromEmail}>`,
      to,
      subject,
      text,
      html
    };

    try {
      const response = await this.mailgun.messages().send(data);

      // Create email delivery record
      const emailDelivery = await EmailDelivery.create({
        user_id: userId,
        email_type: type,
        recipient: to,
        subject,
        status: 'delivered',
        provider: 'mailgun',
        provider_id: response.id || null,
        sent_at: new Date()
      });

      return emailDelivery;
    } catch (error) {
      // Create failed email delivery record
      const emailDelivery = await EmailDelivery.create({
        user_id: userId,
        email_type: type,
        recipient: to,
        subject,
        status: 'failed',
        provider: 'mailgun',
        error_message: error.message,
        sent_at: new Date()
      });

      throw error;
    }
  }

  /**
   * Send email with SMTP
   * @param {Object} options - Email options
   * @returns {Promise<Object>} - Email delivery record
   */
  async sendWithSmtp(options) {
    const { to, subject, html, text, userId, type } = options;

    const mailOptions = {
      from: `"${emailConfig.smtp.fromName}" <${emailConfig.smtp.fromEmail}>`,
      to,
      subject,
      text,
      html
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);

      // Create email delivery record
      const emailDelivery = await EmailDelivery.create({
        user_id: userId,
        email_type: type,
        recipient: to,
        subject,
        status: 'delivered',
        provider: 'smtp',
        provider_id: info.messageId || null,
        sent_at: new Date()
      });

      return emailDelivery;
    } catch (error) {
      // Create failed email delivery record
      const emailDelivery = await EmailDelivery.create({
        user_id: userId,
        email_type: type,
        recipient: to,
        subject,
        status: 'failed',
        provider: 'smtp',
        error_message: error.message,
        sent_at: new Date()
      });

      throw error;
    }
  }

  /**
   * Send user invitation email
   * @param {Object} user - User object
   * @param {string} tempPassword - Temporary password
   * @returns {Promise<Object>} - Email delivery record
   */
  async sendUserInvitation(user, tempPassword) {
    const { email, first_name, last_name, id, role } = user;

    // Generate login URL
    const loginUrl = 'file:///C:/Users/james/Documents/augment-projects/JamesCRM/frontend/public/redirect.html';

    // Create email content
    const subject = emailConfig.templates.userInvitation.subject;
    const text = `
      Hello ${first_name},

      You have been invited to join JamesCRM as a ${role}.

      Please use the following credentials to log in:

      Email: ${email}
      Temporary Password: ${tempPassword}

      You will be asked to change your password after your first login.

      To get started, please visit: ${loginUrl}

      If you have any questions, please contact your administrator.

      Best regards,
      The JamesCRM Team
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Welcome to JamesCRM</h2>
        <p>Hello ${first_name},</p>
        <p>You have been invited to join JamesCRM as a <strong>${role}</strong>.</p>
        <p>Please use the following credentials to log in:</p>

        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 4px; margin: 16px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p style="font-size: 0.875rem; color: #6b7280; margin-top: 8px;">You will be asked to change your password after your first login.</p>
        </div>

        <p>To get started, please click the button below or copy and paste the link into your browser:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${loginUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">Log in to JamesCRM</a>
        </div>
        <div style="margin: 16px 0; word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 4px;">
          <p style="font-size: 0.875rem; color: #4b5563;">Copy this link: <strong>${loginUrl}</strong></p>
        </div>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 0.875rem; color: #6b7280;">
          <p>If you have any questions, please contact your administrator.</p>
          <p>Best regards,<br>The JamesCRM Team</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
      userId: id,
      type: 'invitation'
    });
  }

  /**
   * Send password reset email
   * @param {Object} user - User object
   * @param {string} resetToken - Password reset token
   * @returns {Promise<Object>} - Email delivery record
   */
  async sendPasswordReset(user, resetToken) {
    const { email, first_name, id } = user;

    // Generate reset URL
    const resetUrl = process.env.APP_URL
      ? `${process.env.APP_URL}/reset-password.html?token=${resetToken}`
      : `http://localhost:3000/reset-password.html?token=${resetToken}`;

    // Create email content
    const subject = emailConfig.templates.passwordReset.subject;
    const text = `
      Hello ${first_name},

      You recently requested to reset your password for your JamesCRM account.

      Please click the link below to reset your password:
      ${resetUrl}

      This link will expire in 1 hour.

      If you did not request a password reset, please ignore this email or contact support if you have questions.

      Best regards,
      The JamesCRM Team
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Reset Your Password</h2>
        <p>Hello ${first_name},</p>
        <p>You recently requested to reset your password for your JamesCRM account.</p>
        <p>Please click the button below or copy and paste the link into your browser to reset your password:</p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">Reset Password</a>
        </div>
        <div style="margin: 16px 0; word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 4px;">
          <p style="font-size: 0.875rem; color: #4b5563;">Copy this link: <strong>${resetUrl}</strong></p>
        </div>

        <p style="font-size: 0.875rem; color: #6b7280;">This link will expire in 1 hour.</p>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 0.875rem; color: #6b7280;">
          <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
          <p>Best regards,<br>The JamesCRM Team</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
      userId: id,
      type: 'password_reset'
    });
  }
}

module.exports = new EmailService();
