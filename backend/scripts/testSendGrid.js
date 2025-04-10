const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Create test message
const msg = {
  to: 'jamesperram@gmail.com',
  from: {
    email: process.env.EMAIL_FROM || 'noreply@jamescrm.com',
    name: process.env.EMAIL_FROM_NAME || 'JamesCRM'
  },
  subject: 'SendGrid Test Email',
  text: 'This is a test email from SendGrid to verify the integration is working.',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0ea5e9;">SendGrid Test Email</h2>
      <p>This is a test email from SendGrid to verify the integration is working.</p>
      <p>If you're seeing this, the SendGrid integration is working correctly!</p>
      <p>Best regards,<br>The JamesCRM Team</p>
    </div>
  `,
};

// Send the email
sgMail.send(msg)
  .then((response) => {
    console.log('SendGrid Test Email Sent Successfully');
    console.log('Status Code:', response[0].statusCode);
    console.log('Headers:', response[0].headers);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error sending test email:', error);
    
    // Check if it's a SendGrid API error
    if (error.response) {
      console.error('SendGrid API Error:');
      console.error('Status code:', error.response.statusCode);
      console.error('Body:', error.response.body);
    }
    
    process.exit(1);
  });
