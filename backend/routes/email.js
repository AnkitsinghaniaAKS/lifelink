const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const router = express.Router();

// Create email transporter (using Gmail for demo)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'demo@gmail.com',
    pass: process.env.EMAIL_PASS || 'demo_password'
  }
});

// Store verification codes temporarily (in production, use Redis)
const verificationCodes = new Map();

// Send verification email
router.post('/verify-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code with expiration (5 minutes)
    verificationCodes.set(email, {
      code: verificationCode,
      expires: Date.now() + 5 * 60 * 1000
    });
    
    // Send real email with timeout
    const emailPromise = transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'LifeLink Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Welcome to LifeLink!</h2>
          <p>Thank you for registering with LifeLink - Blood Donation Platform.</p>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #ef4444; font-size: 32px; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
          </div>
          <p><strong>This code will expire in 5 minutes.</strong></p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">LifeLink - Saving lives, one donation at a time.</p>
        </div>
      `
    });
    
    // Set timeout for email sending
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email timeout')), 15000)
    );
    
    try {
      await Promise.race([emailPromise, timeoutPromise]);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      // Always log the code as fallback for development
      console.log(`🔑 Verification code for ${email}: ${verificationCode}`);
      // Don't throw error - still allow the process to continue
    }
    
    res.json({ 
      message: 'Verification code sent to your email',
      email: email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify email code
router.post('/verify-token', async (req, res) => {
  try {
    const { email, token } = req.body;
    
    const storedData = verificationCodes.get(email);
    
    if (!storedData) {
      return res.status(400).json({ message: 'No verification code found for this email' });
    }
    
    if (Date.now() > storedData.expires) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Verification code expired' });
    }
    
    if (storedData.code !== token) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Code is valid, remove it
    verificationCodes.delete(email);
    
    res.json({ 
      message: 'Email verified successfully',
      verified: true 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;