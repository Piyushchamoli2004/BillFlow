const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, resetCode) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Tenant Bill System" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Password Reset Code - Tenant Bill System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
            .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${name || 'User'},</p>
              <p>We received a request to reset your password for your Tenant Bill System account.</p>
              
              <div class="code-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your reset code is:</p>
                <div class="code">${resetCode}</div>
              </div>

              <p>Enter this code on the password reset page to create a new password.</p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>This code expires in <strong>15 minutes</strong></li>
                  <li>Don't share this code with anyone</li>
                  <li>If you didn't request this, ignore this email</li>
                </ul>
              </div>

              <p>If you have any questions, please contact our support team.</p>
              
              <p>Best regards,<br><strong>Tenant Bill System Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} Tenant Bill System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Hello ${name || 'User'},
        
        We received a request to reset your password for your Tenant Bill System account.
        
        Your reset code is: ${resetCode}
        
        Enter this code on the password reset page to create a new password.
        
        Important:
        - This code expires in 15 minutes
        - Don't share this code with anyone
        - If you didn't request this, ignore this email
        
        Best regards,
        Tenant Bill System Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (err) {
    console.error('Error sending password reset email:', err);
    // Don't throw error - we don't want to expose if email sending failed
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Tenant Bill System" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Welcome to Tenant Bill System! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Tenant Bill System!</h1>
            </div>
            <div class="content">
              <p>Hello ${name || 'User'},</p>
              <p>Thank you for registering with Tenant Bill System!</p>
              <p>You can now:</p>
              <ul>
                <li>✅ Manage tenant information</li>
                <li>✅ Generate and track bills</li>
                <li>✅ Monitor payment history</li>
                <li>✅ View detailed reports</li>
              </ul>
              <p>Get started by logging into your account.</p>
              <p>Best regards,<br><strong>Tenant Bill System Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Tenant Bill System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Error sending welcome email:', err);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail
};
