const sgMail = require('@sendgrid/mail');

// Set SendGrid API Key directly
const apiKey = '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';
sgMail.setApiKey(apiKey);

// Create test message
const msg = {
  to: 'jamesperram@gmail.com',
  from: {
    email: 'jamesperram@gmail.com',
    name: 'James Perram'
  },
  subject: 'JamesCRM Invitation Test',
  text: 'This is a test invitation email from JamesCRM.',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0ea5e9;">Welcome to JamesCRM!</h2>
      <p>Hello James,</p>
      <p>You've been invited to join JamesCRM. This is a direct test email.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/register?token=test-token" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
          Accept Invitation
        </a>
      </div>
      <p>This invitation link will expire in 7 days.</p>
      <p>If you have any questions, please contact support.</p>
      <p>Best regards,<br>The JamesCRM Team</p>
    </div>
  `,
};

// Send the email
console.log('Attempting to send direct test email...');
sgMail.send(msg)
  .then((response) => {
    console.log('Email sent successfully!');
    console.log('Status Code:', response[0].statusCode);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error sending email:', error);
    
    // Check if it's a SendGrid API error
    if (error.response) {
      console.error('SendGrid API Error:');
      console.error('Status code:', error.response.statusCode);
      console.error('Body:', error.response.body);
    }
    
    process.exit(1);
  });
