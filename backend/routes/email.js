const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const router = express.Router();

// Store verification codes temporarily
const verificationCodes = new Map();

// Use Resend API - works reliably on Render
const sendEmailWithResend = async (email, code) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'LifeLink <noreply@resend.dev>',
      to: [email],
      subject: 'Verify your LifeLink account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ef4444; margin: 0;">LifeLink</h1>
            <p style="color: #6b7280; margin: 5px 0;">Blood Donation Platform</p>
          </div>
          
          <h2 style="color: #1f2937;">Welcome to LifeLink!</h2>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for joining our life-saving community. Please verify your email address using the code below:
          </p>
          
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">VERIFICATION CODE</p>
            <div style="font-size: 32px; font-weight: bold; color: #ef4444; letter-spacing: 4px; font-family: monospace;">${code}</div>
          </div>
          
          <p style="color: #ef4444; font-weight: bold;">This code expires in 5 minutes.</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you didn't create an account, please ignore this email.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © 2024 LifeLink - Saving lives, one donation at a time.
          </p>
        </div>
      `
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return await response.json();
};

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
    
    try {
      // Send email using Resend
      await sendEmailWithResend(email, verificationCode);
      console.log(`✅ Email sent successfully to ${email}`);
      
      res.json({
        message: 'Verification code sent to your email',
        email: email,
        success: true
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      
      // Still store the code and respond success
      console.log(`🔑 Verification code for ${email}: ${verificationCode}`);
      
      res.json({
        message: 'Verification code generated. Check server logs if email fails.',
        email: email,
        success: true
      });
    }
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Unable to process verification request' });
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
    
    // Rate limiting
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
    
    // Success
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

module.exports = router;