const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Store verification codes temporarily
const verificationCodes = new Map();

// Generate verification code (no email sending - frontend handles it)
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
    
    console.log(`🔑 Verification code for ${email}: ${verificationCode}`);
    
    // Return code for frontend to send via EmailJS
    res.json({
      message: 'Verification code generated',
      email: email,
      verificationCode: verificationCode,
      success: true
    });
    
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