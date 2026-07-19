const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// ─── Token Generation ────────────────────────────────────────────────────────

/**
 * Generate short-lived access token (7 days)
 */
const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // 7 day access token
  );

/**
 * Generate long-lived refresh token (7 days)
 */
const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' } // 7 day refresh token
  );

/**
 * Hash refresh token before storing
 */
const hashToken = async (token) => {
  return bcrypt.hash(token, 10);
};

/**
 * Verify hashed token matches
 */
const verifyHashedToken = (token, hash) => {
  return bcrypt.compare(token, hash);
};

/**
 * Set secure HTTP-only cookies for tokens
 * Credentials cannot be accessed by JavaScript (protection against XSS)
 */
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Access token cookie (15 minutes)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,        // Cannot be accessed by JavaScript
    secure: isProduction,  // HTTPS only in production
    sameSite: 'strict',    // CSRF protection
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });
  
  // Refresh token cookie (7 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

/**
 * Clear token cookies on logout
 */
const clearTokenCookies = (res) => {
  res.clearCookie('accessToken', { path: '/', sameSite: 'strict' });
  res.clearCookie('refreshToken', { path: '/', sameSite: 'strict' });
};

/**
 * Generate token response object
 * Returns both access and refresh tokens, plus user data
 */
const tokenResponse = (user) => ({
  token: generateAccessToken(user),
  refreshToken: generateRefreshToken(user),
  user: {
    id: user._id,
    email: user.email,
    name: user.name || user.email.split('@')[0],
    role: user.role,
    profilePhoto: user.profilePhoto || null,
    provider: user.provider,
  },
});

// ─── Middleware ─────────────────────────────────────────────────────────────

/**
 * Verify access token middleware
 */
const verifyAccessToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ─── POST /api/auth/signup ──────────────────────────────────────────────────

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: 'Email already registered' });

    const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';
    const user = await User.create({
      email,
      password,
      name: name || email.split('@')[0],
      role,
      provider: 'email',
      isEmailVerified: false,
    });

    // Generate tokens
    const tokens = tokenResponse(user);
    
    // Store hashed refresh token
    user.refreshToken = await hashToken(tokens.refreshToken);
    user.lastLogin = new Date();
    await user.save();

    return res.status(201).json({
      ...tokens,
      error: null,
    });
  } catch (err) {
    console.error('Sign up error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/auth/signin ──────────────────────────────────────────────────

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // Check if account is active
    if (!user.isActive) 
      return res.status(403).json({ error: 'Account is deactivated' });

    // Generate tokens
    const tokens = tokenResponse(user);
    
    // Store hashed refresh token and update lastLogin
    user.refreshToken = await hashToken(tokens.refreshToken);
    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      ...tokens,
      error: null,
    });
  } catch (err) {
    console.error('Sign in error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/auth/google ──────────────────────────────────────────────────

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
      const role = data.email === process.env.ADMIN_EMAIL ? 'admin' : 'user';
      user = await User.create({
        email: data.email,
        name: data.name || data.email.split('@')[0],
        profilePhoto: data.picture,
        role,
        provider: 'google',
        providerId: data.id,
        isEmailVerified: true,
        password: Math.random().toString(36), // Random password for OAuth users
      });
    }

    // Generate tokens
    const tokens = tokenResponse(user);
    
    // Store hashed refresh token and update lastLogin
    user.refreshToken = await hashToken(tokens.refreshToken);
    user.lastLogin = new Date();
    user.provider = 'google';
    user.providerId = data.id;
    await user.save();

    return res.status(200).json({
      ...tokens,
      error: null,
    });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(400).json({ error: err.message || 'Google login failed' });
  }
});

// ─── POST /api/auth/facebook ────────────────────────────────────────────────

router.post('/facebook', async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'Access token required' });

    const { data } = await axios.get('https://graph.facebook.com/me', {
      params: { fields: 'id,email,name,picture', access_token: accessToken },
    });

    if (!data.email) return res.status(400).json({ error: 'No email from Facebook' });

    let user = await User.findOne({ email: data.email });
    if (!user) {
      const role = data.email === process.env.ADMIN_EMAIL ? 'admin' : 'user';
      user = await User.create({
        email: data.email,
        name: data.name || data.email.split('@')[0],
        profilePhoto: data.picture?.data?.url,
        role,
        provider: 'facebook',
        providerId: data.id,
        isEmailVerified: true,
        password: Math.random().toString(36), // Random password for OAuth users
      });
    }

    // Generate tokens
    const tokens = tokenResponse(user);
    
    // Store hashed refresh token and update lastLogin
    user.refreshToken = await hashToken(tokens.refreshToken);
    user.lastLogin = new Date();
    user.provider = 'facebook';
    user.providerId = data.id;
    await user.save();

    return res.status(200).json({
      ...tokens,
      error: null,
    });
  } catch (err) {
    console.error('Facebook login error:', err);
    return res.status(400).json({ error: err.message || 'Facebook login failed' });
  }
});


// ─── POST /api/auth/refresh ─────────────────────────────────────────────────
/**
 * Refresh access token using refresh token
 * Implements token rotation for security
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      );

      const user = await User.findById(decoded.id);
      if (!user || !user.refreshToken) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      // Verify hashed token matches
      const isValid = await verifyHashedToken(refreshToken, user.refreshToken);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      // Generate new token pair (token rotation)
      const tokens = tokenResponse(user);
      
      // Store new hashed refresh token
      user.refreshToken = await hashToken(tokens.refreshToken);
      user.lastLogin = new Date();
      await user.save();

      return res.status(200).json({
        ...tokens,
        error: null,
      });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Refresh token expired' });
      }
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
  } catch (err) {
    console.error('Token refresh error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/auth/logout ──────────────────────────────────────────────────
/**
 * Logout: Invalidate refresh token
 */
router.post('/logout', verifyAccessToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Clear refresh token
    user.refreshToken = null;
    await user.save();

    return res.status(200).json({ 
      message: 'Logged out successfully',
      error: null 
    });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/auth/profile/complete ────────────────────────────────────────
/**
 * Complete user profile (first-time setup)
 */
router.post('/profile/complete', verifyAccessToken, async (req, res) => {
  try {
    const { name, phone, gender, dob } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update profile
    user.name = name;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;
    user.profileCompleted = true;

    await user.save();

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        profileCompleted: user.profileCompleted,
      },
      error: null,
    });
  } catch (err) {
    console.error('Profile completion error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/auth/me ───────────────────────────────────────────────────────
/**
 * Get current authenticated user
 */
router.get('/me', verifyAccessToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        profilePhoto: user.profilePhoto,
        profileCompleted: user.profileCompleted,
        role: user.role,
        provider: user.provider,
        createdAt: user.createdAt,
      },
      error: null,
    });
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/auth/profile/update ─────────────────────────────────────────
/**
 * Update user profile
 */
router.patch('/profile/update', verifyAccessToken, async (req, res) => {
  try {
    const { name, phone, gender, dob } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone || undefined;
    if (gender !== undefined) user.gender = gender;
    if (dob !== undefined) user.dob = dob ? new Date(dob) : undefined;
    user.profileCompleted = true;

    await user.save();

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        profilePhoto: user.profilePhoto,
        profileCompleted: user.profileCompleted,
        role: user.role,
      },
      error: null,
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/auth/addresses ─────────────────────────────────────────────────
/**
 * Get user's saved addresses
 */
router.get('/addresses', verifyAccessToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ data: user.addresses || [], error: null });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/auth/addresses ────────────────────────────────────────────────
/**
 * Add a new address
 */
router.post('/addresses', verifyAccessToken, async (req, res) => {
  try {
    const { name, phone, line1, line2, city, state, pincode, country, isDefault } = req.body;
    if (!name || !line1 || !city || !state || !pincode)
      return res.status(400).json({ error: 'Name, address, city, state and pincode are required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.addresses) user.addresses = [];

    // If new address is default, unset all others
    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    // If this is the first address, make it default
    const makeDefault = isDefault || user.addresses.length === 0;

    user.addresses.push({ name, phone, line1, line2, city, state, pincode, country: country || 'India', isDefault: makeDefault });
    await user.save();

    return res.status(201).json({ data: user.addresses, error: null });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/auth/addresses/:id ───────────────────────────────────────────
/**
 * Update an address
 */
router.patch('/addresses/:id', verifyAccessToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const address = user.addresses?.id(req.params.id);
    if (!address) return res.status(404).json({ error: 'Address not found' });

    const { name, phone, line1, line2, city, state, pincode, country, isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    if (name !== undefined) address.name = name;
    if (phone !== undefined) address.phone = phone;
    if (line1 !== undefined) address.line1 = line1;
    if (line2 !== undefined) address.line2 = line2;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;
    if (country !== undefined) address.country = country;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();
    return res.status(200).json({ data: user.addresses, error: null });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/auth/addresses/:id ──────────────────────────────────────────
/**
 * Delete an address
 */
router.delete('/addresses/:id', verifyAccessToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const addr = user.addresses?.id(req.params.id);
    if (!addr) return res.status(404).json({ error: 'Address not found' });

    addr.deleteOne();
    // If we deleted the default, make first remaining one default
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    await user.save();

    return res.status(200).json({ data: user.addresses, error: null });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Export router as default, but also attach middleware for external use
router.verifyAccessToken = verifyAccessToken;
module.exports = router;
