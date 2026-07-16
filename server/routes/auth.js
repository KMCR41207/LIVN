const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: 'Email already registered' });

    const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';
    const user = await User.create({ email, password, role });
    const token = signToken(user);

    return res.status(201).json({ 
      token, 
      user: { id: user._id, email: user.email, role: user.role },
      error: null
    });
  } catch (err) {
    console.error('Sign up error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    return res.status(200).json({ 
      token, 
      user: { id: user._id, email: user.email, role: user.role },
      error: null
    });
  } catch (err) {
    console.error('Sign in error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/google — exchange Google access token for app JWT
router.post('/google', async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'Access token required' });

    const { data } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!data.email) return res.status(400).json({ error: 'No email from Google' });

    let user = await User.findOne({ email: data.email });
    if (!user) {
      user = await User.create({
        email: data.email,
        firstName: data.name?.split(' ')[0] || '',
        lastName: data.name?.split(' ').slice(1).join(' ') || '',
        role: data.email === process.env.ADMIN_EMAIL ? 'admin' : 'user',
      });
    }

    const token = signToken(user);
    return res.status(200).json({ 
      token, 
      user: { id: user._id, email: user.email, role: user.role },
      error: null
    });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(400).json({ error: err.message || 'Google login failed' });
  }
});

// POST /api/auth/facebook — exchange Facebook access token for app JWT
router.post('/facebook', async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'Access token required' });

    const { data } = await axios.get('https://graph.facebook.com/me', {
      params: { fields: 'id,email,name', access_token: accessToken },
    });

    if (!data.email) return res.status(400).json({ error: 'No email from Facebook' });

    let user = await User.findOne({ email: data.email });
    if (!user) {
      user = await User.create({
        email: data.email,
        firstName: data.name?.split(' ')[0] || '',
        lastName: data.name?.split(' ').slice(1).join(' ') || '',
        role: data.email === process.env.ADMIN_EMAIL ? 'admin' : 'user',
      });
    }

    const token = signToken(user);
    return res.status(200).json({ 
      token, 
      user: { id: user._id, email: user.email, role: user.role },
      error: null
    });
  } catch (err) {
    console.error('Facebook login error:', err);
    return res.status(400).json({ error: err.message || 'Facebook login failed' });
  }
});

module.exports = router;
