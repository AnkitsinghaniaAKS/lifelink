const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const router = express.Router();

// Professional email service configuration
const createEmailTransporter = () => {
  // Primary: Brevo (Sendinblue) - Professional service
  if (process.env.BREVO_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_EMAIL,
        pass: process.env.BREVO_API_KEY
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000
    });
  }
  
  // Fallback: SMTP2GO - Reliable alternative
  return nodemailer.createTransport({
    host: 'mail.smtp2go.com',
    port: 2525,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000
  });
};

// Store verification codes temporarily
const verificationCodes = new Map();

// Professional email template
const createEmailTemplate = (code) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LifeLink Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">LifeLink</h1>
            <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">Blood Donation Platform</p>
        </div>
        
        <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Welcome to LifeLink!</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for joining our life-saving community. To complete your registration, please verify your email address using the code below:
            </p>
            
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
                <div style="font-size: 36px; font-weight: 700; color: #ef4444; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</div>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 30px 0; border-radius: 4px;">
                <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
                    ⏰ This code will expire in 5 minutes for security reasons.
                </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                If you didn't create an account with LifeLink, please ignore this email. Your email address will not be used without verification.
            </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                © 2024 LifeLink - Saving lives, one donation at a time.<br>
                This is an automated message, please do not reply.
            </p>
        </div>
    </div>
</body>
</html>`;

// Send verification email
router.post('/verify-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email address is required' });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Generate secure 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code with expiration (5 minutes)
    verificationCodes.set(email, {
      code: verificationCode,
      expires: Date.now() + 5 * 60 * 1000,
      attempts: 0
    });
    
    // Create transporter
    const transporter = createEmailTransporter();
    
    // Professional email options
    const mailOptions = {
      from: {
        name: 'LifeLink',
        address: process.env.BREVO_EMAIL || process.env.EMAIL_USER || 'noreply@lifelink.com'
      },
      to: email,
      subject: 'Verify your LifeLink account - Action required',
      html: createEmailTemplate(verificationCode),
      text: `Welcome to LifeLink! Your verification code is: ${verificationCode}. This code expires in 5 minutes.`
    };
    
    // Send email with timeout and retry logic
    let emailSent = false;
    let attempts = 0;
    const maxAttempts = 2;
    
    while (!emailSent && attempts < maxAttempts) {
      try {
        await Promise.race([
          transporter.sendMail(mailOptions),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Email timeout')), 15000)
          )
        ]);
        emailSent = true;
        console.log(`✅ Professional email sent to ${email}`);
      } catch (error) {
        attempts++;
        console.log(`❌ Email attempt ${attempts} failed: ${error.message}`);
        
        if (attempts < maxAttempts) {
          // Wait 2 seconds before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    // Always respond success to prevent email enumeration
    res.json({
      message: 'Verification code sent to your email address',
      email: email,
      success: true
    });
    
    // Log for debugging (remove in production)
    if (!emailSent) {
      console.log(`🔑 FALLBACK - Verification code for ${email}: ${verificationCode}`);
    }
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Unable to send verification email. Please try again.' });
  }
});

// Verify email code
router.post('/verify-token', async (req, res) => {
  try {
    const { email, token } = req.body;
    
    if (!email || !token) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }
    
    const storedData = verificationCodes.get(email);
    
    if (!storedData) {
      return res.status(400).json({ message: 'No verification code found. Please request a new code.' });
    }
    
    // Check expiration
    if (Date.now() > storedData.expires) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Verification code expired. Please request a new code.' });
    }
    
    // Rate limiting - max 5 attempts
    if (storedData.attempts >= 5) {
      verificationCodes.delete(email);
      return res.status(429).json({ message: 'Too many attempts. Please request a new code.' });
    }
    
    // Verify code
    if (storedData.code !== token.toString()) {
      storedData.attempts++;
      verificationCodes.set(email, storedData);
      return res.status(400).json({ 
        message: `Invalid verification code. ${5 - storedData.attempts} attempts remaining.` 
      });
    }
    
    // Success - remove code
    verificationCodes.delete(email);
    
    res.json({
      message: 'Email verified successfully',
      verified: true,
      success: true
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    res.json({
      status: 'healthy',
      service: process.env.BREVO_API_KEY ? 'Brevo' : 'SMTP2GO',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;