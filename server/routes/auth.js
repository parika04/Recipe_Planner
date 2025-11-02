const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../utils/emailService');

// Registration route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create and save new user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// Forgot Password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Delete any existing reset tokens for this email
    await PasswordReset.deleteMany({ email });
    
    // Save new reset token with expiration (1 hour)
    const passwordReset = new PasswordReset({
      email,
      token: resetToken,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    });
    await passwordReset.save();
    
    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    // Send email
    await sendPasswordResetEmail(email, resetToken, resetUrl);
    
    // Return success message
    res.json({ 
      message: 'Reset email has been sent. Please check your inbox.' 
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ 
      message: 'Failed to process password reset request. Please try again later.' 
    });
  }
});

// Reset Password route (verify token and update password)
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    
    // Validate password strength (same rules as registration)
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
    }
    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one number' });
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one special character' });
    }
    
    // Find valid reset token
    const passwordReset = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }, // Not expired
    });
    
    if (!passwordReset) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email: passwordReset.email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    user.password = hashedPassword;
    await user.save();
    
    // Mark reset token as used
    passwordReset.used = true;
    await passwordReset.save();
    
    // Delete all reset tokens for this email (cleanup)
    await PasswordReset.deleteMany({ email: passwordReset.email });
    
    res.json({ 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

module.exports = router;
