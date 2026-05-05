const nodemailer = require('nodemailer');

/**
 * Create a Nodemailer transporter using Gmail/Google Workspace SMTP
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send a verification email with OTP code
 * @param {string} toEmail - Recipient's email address
 * @param {string} otp - The 6-digit OTP code
 * @param {string} name - Recipient's name
 */
const sendVerificationEmail = async (toEmail, otp, name) => {
  try {
    const transporter = createTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0F0E17; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 520px; margin: 40px auto; background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(108, 99, 255, 0.2);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6C63FF 0%, #5A52D5 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
              Thes-ease
            </h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 14px;">
              Thesis Slot Booking System
            </p>
          </div>

          <!-- Body -->
          <div style="padding: 32px 24px;">
            <h2 style="color: #EAEAEA; margin: 0 0 8px 0; font-size: 20px;">
              Verify Your Email
            </h2>
            <p style="color: #A0A0B0; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
              Hi <strong style="color: #EAEAEA;">${name}</strong>, welcome to Thes-ease! Use the verification code below to activate your account.
            </p>

            <!-- OTP Code -->
            <div style="background: rgba(108, 99, 255, 0.1); border: 1px solid rgba(108, 99, 255, 0.3); border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
              <p style="color: #A0A0B0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">
                Your Verification Code
              </p>
              <div style="font-size: 36px; font-weight: 700; color: #6C63FF; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
            </div>

            <p style="color: #A0A0B0; font-size: 13px; line-height: 1.6; margin: 0 0 8px 0;">
              This code expires in <strong style="color: #EAEAEA;">10 minutes</strong>.
            </p>
            <p style="color: #A0A0B0; font-size: 13px; line-height: 1.6; margin: 0;">
              If you didn't create an account on Thes-ease, please ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="padding: 16px 24px; border-top: 1px solid rgba(108, 99, 255, 0.15); text-align: center;">
            <p style="color: #666; font-size: 11px; margin: 0;">
              &copy; 2026 Thes-ease - BRAC University
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `${otp} - Your Thes-ease Verification Code`,
      html: htmlContent,
    };

    console.log(`📧 Sending verification email to: ${toEmail}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('   Full error:', error);
    throw new Error('Failed to send verification email. Please try again.');
  }
};

module.exports = { sendVerificationEmail };
