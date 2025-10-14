import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like SendGrid, Mailgun, etc.
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password', // Use app password for Gmail
  },
});

// Generate OTP
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP email
export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@internwithme.com',
      to: email,
      subject: 'InternWithMe - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">InternWithMe</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Internship Journey Starts Here</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for signing up with InternWithMe! To complete your registration, please verify your email address using the OTP below:
            </p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 30px 0;">
              <h3 style="color: #333; margin: 0; font-size: 32px; letter-spacing: 5px; font-family: monospace;">${otp}</h3>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              This OTP will expire in 10 minutes. If you didn't request this verification, please ignore this email.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Best regards,<br>
                The InternWithMe Team
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

// Send application notification email
export const sendApplicationNotification = async (
  companyEmail: string, 
  internName: string, 
  internshipTitle: string
): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@internwithme.com',
      to: companyEmail,
      subject: `New Application for ${internshipTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">InternWithMe</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">New Internship Application</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              You have received a new application for your internship posting:
            </p>
            
            <div style="background: white; border-radius: 10px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 10px 0;">${internshipTitle}</h3>
              <p style="color: #666; margin: 0;"><strong>Applicant:</strong> ${internName}</p>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Log in to your company dashboard to review the application and manage your candidates.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending application notification:', error);
    return false;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<boolean> => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@internwithme.com',
      to: email,
      subject: 'InternWithMe - Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">InternWithMe</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              You requested to reset your password. Click the button below to reset it:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};
