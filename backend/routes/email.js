const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const router = express.Router();

// Create production-ready email transporter
const createTransporter = () => {
  // Use Brevo (formerly Sendinblue) - free tier with 300 emails/day
  if (process.env.BREVO_API_KEY) {
    return nodemailer.createTransporter({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_EMAIL,
        pass: process.env.BREVO_API_KEY
      }
    });
  }
  
  // Fallback to Ethereal (for testing)
  return nodemailer.createTransporter({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal.pass'
    }
  });
};

let transporter = createTransporter();

// Store verification codes temporarily (in production, use Redis)
const verificationCodes = new Map();

// Test email configuration
router.get('/test-email', async (req, res) => {
  try {
    // Verify transporter configuration
    await transporter.verify();
    res.json({ 
      message: 'Email service is working correctly',
      config: {
        service: 'gmail',
        user: process.env.EMAIL_USER,
        hasPassword: !!process.env.EMAIL_PASS
      }
    });
  } catch (error) {
    console.error('Email service test failed:', error);
    res.status(500).json({ 
      message: 'Email service configuration error',
      error: error.message,
      config: {
        service: 'gmail',
        user: process.env.EMAIL_USER,
        hasPassword: !!process.env.EMAIL_PASS
      }
    });
  }
});

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
    
    // Send email using the robust email service
    const emailResult = await emailService.sendVerificationEmail(email, verificationCode);
    
    // Always log the code for development/testing
    console.log(`🔑 Verification code for ${email}: ${verificationCode}`);
    
    res.json({ 
      message: emailResult.success ? 'Verification code sent to your email' : 'Verification code generated (check server logs for testing)',
      email: email,
      emailSent: emailResult.success,
      service: emailResult.service || 'none'
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