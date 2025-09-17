const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, authProvider } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    let hashedPassword = null;
    if (password && authProvider !== 'google') {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'donor',
      authProvider: authProvider || 'local',
      isEmailVerified: authProvider === 'google' ? true : false
    });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Google OAuth Login
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
      return res.status(400).json({ message: 'Google Client ID not configured. Please set GOOGLE_CLIENT_ID in .env file.' });
    }
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, email_verified } = payload;
    
    if (!email_verified) {
      return res.status(400).json({ message: 'Google email not verified' });
    }
    
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        isEmailVerified: true,
        role: 'donor' // Default role
      });
    } else if (user.authProvider !== 'google') {
      // Link existing account with Google
      user.googleId = googleId;
      user.authProvider = 'google';
      user.isEmailVerified = true;
      await user.save();
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
      message: 'Google Sign-In successful'
    });
  } catch (error) {
    console.error('Google OAuth Error:', error);
    res.status(500).json({ message: 'Google Sign-In failed: ' + error.message });
  }
});

// Production Google OAuth with PKCE
router.post('/google-oauth', async (req, res) => {
  try {
    const { code, codeVerifier, redirectUri } = req.body;
    
    if (!code || !codeVerifier || !redirectUri) {
      return res.status(400).json({ message: 'Missing required OAuth parameters' });
    }
    
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('Google token exchange error:', tokenData);
      return res.status(400).json({ message: `Google OAuth error: ${tokenData.error_description || tokenData.error}` });
    }
    
    if (!tokenData.access_token) {
      return res.status(400).json({ message: 'Failed to get access token from Google' });
    }
    
    // Get user profile from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json'
      }
    });
    
    if (!profileResponse.ok) {
      throw new Error(`Failed to fetch user profile: ${profileResponse.status}`);
    }
    
    const profile = await profileResponse.json();
    const { id: googleId, email, name, verified_email, picture } = profile;
    
    if (!verified_email) {
      return res.status(400).json({ message: 'Google email not verified. Please verify your email with Google first.' });
    }
    
    if (!email || !name) {
      return res.status(400).json({ message: 'Incomplete profile information from Google' });
    }
    
    // Check if user exists
    let user = await User.findOne({ email });
    let isNewUser = false;
    
    if (user) {
      // Update existing user with Google info if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.isEmailVerified = true;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        isEmailVerified: true,
        role: 'donor' // Default role - will be updated in role selection
      });
      isNewUser = true;
    }
    
    // Generate JWT token
    const jwtToken = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        authProvider: 'google'
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );
    
    // Log successful authentication
    console.log(`Google OAuth successful for user: ${email}`);
    
    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,
      token: jwtToken,
      message: isNewUser ? 'Account created successfully' : 'Google Sign-In successful',
      isNewUser: isNewUser
    });
    
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ 
      message: 'Google authentication failed', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update user role (for Google OAuth users)
router.post('/update-role', async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    if (!userId || !role) {
      return res.status(400).json({ message: 'User ID and role are required' });
    }
    
    if (!['donor', 'patient'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be donor or patient' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { role: role },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Role updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Role update error:', error);
    res.status(500).json({ message: 'Failed to update role' });
  }
});

module.exports = router;