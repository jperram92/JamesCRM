/**
 * Email configuration for the application
 */
require('dotenv').config();

module.exports = {
  // Email service provider (sendgrid, mailgun, smtp)
  provider: process.env.EMAIL_PROVIDER || 'smtp',

  // SendGrid configuration
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@jamescrm.com',
    fromName: process.env.SENDGRID_FROM_NAME || 'JamesCRM',
  },

  // Mailgun configuration
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN || 'mail.jamescrm.com',
    fromEmail: process.env.MAILGUN_FROM_EMAIL || 'noreply@jamescrm.com',
    fromName: process.env.MAILGUN_FROM_NAME || 'JamesCRM',
  },

  // SMTP configuration
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@jamescrm.com',
    fromName: process.env.SMTP_FROM_NAME || 'JamesCRM',
  },

  // Email templates
  templates: {
    userInvitation: {
      subject: 'You\'ve been invited to JamesCRM',
      // Other template settings can be added here
    },
    passwordReset: {
      subject: 'Reset your JamesCRM password',
      // Other template settings can be added here
    },
  },

  // Email delivery settings
  deliverySettings: {
    retryAttempts: 3,
    retryDelay: 5 * 60 * 1000, // 5 minutes
  }
};
