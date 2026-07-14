/**
 * Authentication Routes
 * Handles email/password signup, signin, and OAuth token exchange
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

/**
 * Generate JWT token
 */
const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

/**
 * POST /api/auth/signup — Email/Password signup
 */
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

    res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/signin — Email/Password signin
 */
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
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/google — Google OAuth token exchange
 * Expects: { accessToken }
 * Returns the user's Google profile info + creates/updates user in DB
 */
router.post('/google', async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken)
      return res.status(400).json({ error: 'Access token required' });

    // Exchange access token for user info from Google's API
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { email, name, picture } = data;
    if (!email)
      return res.status(400).json({ error: 'Google account must have email' });

    // Upsert user: create if not exists, link OAuth if does
    let user = await User.findOne({ email });

    if (!user) {
      // New user — create with OAuth
      user = await User.create({
        email,
        firstName: name?.split(' ')[0] || '',
        lastName: name?.split(' ').slice(1).join(' ') || '',
        oauthProviders: [
          {
            provider: 'google',
            providerId: data.id,
            email,
            displayName: name,
            photoUrl: picture,
            linkedAt: new Date(),
          },
        ],
        role: email === process.env.ADMIN_EMAIL ? 'admin' : 'user',
      });
    } else if (!user.oauthProviders.find(p => p.provider === 'google')) {
      // Existing user — link Google if not already linked
      user.oauthProviders.push({
        provider: 'google',
        providerId: data.id,
        email,
        displayName: name,
        photoUrl: picture,
        linkedAt: new Date(),
      });
      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Google OAuth error:', err.message);
    res.status(400).json({ error: err.message || 'Google authentication failed' });
  }
});

/**
 * POST /api/auth/facebook — Facebook OAuth token exchange
 * Expects: { accessToken }
 */
router.post('/facebook', async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken)
      return res.status(400).json({ error: 'Access token required' });

    // Exchange access token for user info from Facebook's API
    const { data } = await axios.get('https://graph.facebook.com/me', {
      params: {
        fields: 'id,email,name,picture',
        access_token: accessToken,
      },
    });

    const { email, name, picture, id: facebookId } = data;
    if (!email)
      return res.status(400).json({ error: 'Facebook account must have email' });

    // Upsert user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        firstName: name?.split(' ')[0] || '',
        lastName: name?.split(' ').slice(1).join(' ') || '',
        oauthProviders: [
          {
            provider: 'facebook',
            providerId: facebookId,
            email,
            displayName: name,
            photoUrl: picture?.data?.url,
            linkedAt: new Date(),
          },
        ],
        role: email === process.env.ADMIN_EMAIL ? 'admin' : 'user',
      });
    } else if (!user.oauthProviders.find(p => p.provider === 'facebook')) {
      user.oauthProviders.push({
        provider: 'facebook',
        providerId: facebookId,
        email,
        displayName: name,
        photoUrl: picture?.data?.url,
        linkedAt: new Date(),
      });
      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Facebook OAuth error:', err.message);
    res.status(400).json({ error: err.message || 'Facebook authentication failed' });
  }
});

module.exports = router;
