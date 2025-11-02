const nodemailer = require('nodemailer');

// Create reusable transporter (using Gmail as example - you can use other services)
const createTransporter = () => {
  // For development, you can use Gmail with an App Password
  // For production, use services like SendGrid, AWS SES, Mailgun, etc.
  
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password, not regular password
      },
    });
  }
  
  // Generic SMTP configuration
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  
  // Development mode - just log emails instead of sending
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  Email service not configured. Emails will be logged to console.');
  }
  
  return {
    sendMail: async (options) => {
      if (process.env.NODE_ENV !== 'production') {
        const resetUrl = options.html.match(/href="([^"]+)"/)?.[1] || 'Not found';
        console.log(`📧 Email would be sent to: ${options.to}`);
        console.log(`   Reset URL: ${resetUrl}`);
      }
      return { messageId: 'dev-mode-email-id' };
    },
  };
};

const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Recipe Planner" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - Recipe Planner',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Password Reset Request</h2>
        <p>You requested to reset your password for your Recipe Planner account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 1 hour.<br>
          If you didn't request this password reset, please ignore this email.
        </p>
      </div>
    `,
    text: `
      Password Reset Request
      
      You requested to reset your password for your Recipe Planner account.
      
      Click this link to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request this password reset, please ignore this email.
    `,
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Password reset email sent:', info.messageId);
    }
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendPasswordResetEmail,
};

