const nodemailer = require('nodemailer');
const { promisify } = require('util');
const sgMail = require('@sendgrid/mail');

// Create a reusable transporter object
let transporter;
let emailService;

// Initialize transporter
const initializeTransporter = async () => {
  if (transporter) return transporter;

  // Force using SendGrid for now
  emailService = 'sendgrid';
  console.log('Using email service:', emailService);

  // Initialize SendGrid if selected
  if (emailService === 'sendgrid') {
    try {
      // Set SendGrid API Key directly
      const apiKey = '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';
      sgMail.setApiKey(apiKey);
      console.log('SendGrid initialized successfully with direct API key');
      return 'sendgrid'; // Return identifier for SendGrid
    } catch (error) {
      console.error('Failed to initialize SendGrid:', error);
      console.warn('Falling back to Ethereal for email testing');
      emailService = 'ethereal';
    }
  }

  // If we're using SMTP in production
  if (emailService === 'smtp' && process.env.NODE_ENV === 'production') {
    // Production SMTP email service
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    console.log('SMTP transporter created successfully');
    return transporter;
  }

  // For development or fallback, create a test account with Ethereal
  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    console.log('Created Ethereal test account:', testAccount.user);

    // Create a transporter using the test account
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    console.log('Ethereal email transporter created successfully');
    return transporter;
  } catch (error) {
    console.error('Failed to create Ethereal test account:', error);
    throw error;
  }
};

// Send invitation email
exports.sendInvitationEmail = async (email, inviteUrl, firstName) => {
  try {
    // Initialize the transporter
    const transport = await initializeTransporter();

    // Prepare email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">Welcome to JamesCRM!</h2>
        <p>Hello ${firstName || 'there'},</p>
        <p>You've been invited to join JamesCRM. Please click the button below to complete your registration:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p>This invitation link will expire in 7 days.</p>
        <p>If you have any questions, please contact support.</p>
        <p>Best regards,<br>The JamesCRM Team</p>
      </div>
    `;

    // Check if we're using SendGrid
    if (transport === 'sendgrid') {
      // SendGrid message format
      const msg = {
        to: email,
        from: {
          email: 'jamesperram@gmail.com',
          name: 'James Perram'
        },
        subject: 'Invitation to JamesCRM',
        html: emailContent,
      };

      console.log('Using verified sender email: jamesperram@gmail.com');

      // Send email with SendGrid
      console.log('Attempting to send email via SendGrid to:', email);
      console.log('From:', 'jamesperram@gmail.com');
      console.log('SendGrid message:', JSON.stringify(msg, null, 2));

      try {
        const response = await sgMail.send(msg);
        console.log('Email sent with SendGrid:', response[0].statusCode);
        console.log('SendGrid response headers:', JSON.stringify(response[0].headers, null, 2));
      } catch (sendGridError) {
        console.error('SendGrid error:', sendGridError);
        if (sendGridError.response) {
          console.error('SendGrid API error details:');
          console.error('Status code:', sendGridError.response.statusCode);
          console.error('Body:', JSON.stringify(sendGridError.response.body, null, 2));
        }
        throw sendGridError;
      }

      return {
        messageId: `sendgrid_${Date.now()}`,
        provider: 'sendgrid'
      };
    } else {
      // Using Nodemailer (Ethereal or SMTP)
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'JamesCRM'}" <${process.env.EMAIL_FROM || 'noreply@jamescrm.com'}>`,
        to: email,
        subject: 'Invitation to JamesCRM',
        html: emailContent
      };

      // Send the email with Nodemailer
      const info = await transport.sendMail(mailOptions);
      console.log('Email sent with Nodemailer: %s', info.messageId);

      // For development with Ethereal, log the URL to preview the email
      if (process.env.NODE_ENV !== 'production') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('Preview URL: %s', previewUrl);
        return {
          messageId: info.messageId,
          previewUrl,
          provider: 'ethereal'
        };
      }

      return {
        messageId: info.messageId,
        provider: 'smtp'
      };
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send a generic email
exports.sendEmail = async ({ to, subject, html }) => {
  try {
    // Initialize the transporter
    const transport = await initializeTransporter();

    // Check if we're using SendGrid
    if (transport === 'sendgrid') {
      // SendGrid message format
      const msg = {
        to,
        from: {
          email: 'jamesperram@gmail.com',
          name: 'James Perram'
        },
        subject,
        html,
      };

      console.log('Using verified sender email: jamesperram@gmail.com');

      // Send email with SendGrid
      console.log('Attempting to send email via SendGrid to:', to);
      console.log('Subject:', subject);

      try {
        const response = await sgMail.send(msg);
        console.log('Email sent with SendGrid:', response[0].statusCode);
        return {
          messageId: `sendgrid_${Date.now()}`,
          provider: 'sendgrid'
        };
      } catch (sendGridError) {
        console.error('SendGrid error:', sendGridError);
        if (sendGridError.response) {
          console.error('SendGrid API error details:');
          console.error('Status code:', sendGridError.response.statusCode);
          console.error('Body:', JSON.stringify(sendGridError.response.body, null, 2));
        }
        throw sendGridError;
      }
    } else {
      // Using Nodemailer (Ethereal or SMTP)
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'JamesCRM'}" <${process.env.EMAIL_FROM || 'noreply@jamescrm.com'}>`,
        to,
        subject,
        html
      };

      // Send the email with Nodemailer
      const info = await transport.sendMail(mailOptions);
      console.log('Email sent with Nodemailer: %s', info.messageId);

      // For development with Ethereal, log the URL to preview the email
      if (process.env.NODE_ENV !== 'production') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('Preview URL: %s', previewUrl);
        return {
          messageId: info.messageId,
          previewUrl,
          provider: 'ethereal'
        };
      }

      return {
        messageId: info.messageId,
        provider: 'smtp'
      };
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Export the initialize function for use in server startup
exports.initializeTransporter = initializeTransporter;
