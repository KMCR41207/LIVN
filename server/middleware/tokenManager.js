/**
 * Secure Token Management
 * Handles HTTP-only cookies and token validation
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Set secure HTTP-only cookies for tokens
 * @param {Response} res - Express response object
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 */
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Access token cookie (15 minutes)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,           // Cannot be accessed by JavaScript (XSS protection)
    secure: isProduction,     // HTTPS only in production
    sameSite: 'strict',       // CSRF protection - only send with same-origin requests
    maxAge: 15 * 60 * 1000,   // 15 minutes
    path: '/',
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
  });
  
  // Refresh token cookie (7 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
  });
};

/**
 * Clear token cookies on logout
 * @param {Response} res - Express response object
 */
const clearTokenCookies = (res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
};

/**
 * Extract token from cookies or Authorization header
 * @param {Request} req - Express request object
 * @returns {string|null} - JWT token or null
 */
const extractToken = (req) => {
  // Try HTTP-only cookie first (preferred)
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }
  
  // Fallback to Authorization header (for clients that don't support cookies)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  return null;
};

/**
 * Hash a token before storing in database
 * @param {string} token - Token to hash
 * @returns {Promise<string>} - Hashed token
 */
const hashToken = async (token) => {
  return bcrypt.hash(token, 10);
};

/**
 * Verify a token matches its hash
 * @param {string} token - Token to verify
 * @param {string} hash - Hash to compare against
 * @returns {Promise<boolean>} - True if matches
 */
const verifyHashedToken = (token, hash) => {
  return bcrypt.compare(token, hash);
};

/**
 * Verify JWT token signature and expiration
 * @param {string} token - JWT token
 * @param {string} secret - Secret key
 * @returns {Object|null} - Decoded token or null if invalid
 */
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    console.warn(`Token verification failed: ${err.message}`);
    return null;
  }
};

/**
 * Create safe user response (no tokens in body)
 * @param {Object} user - User document
 * @returns {Object} - User data to send in response
 */
const createSafeUserResponse = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name || undefined,
  role: user.role || 'user',
  profileCompleted: user.profileCompleted || false,
  provider: user.provider || 'email',
});

module.exports = {
  setTokenCookies,
  clearTokenCookies,
  extractToken,
  hashToken,
  verifyHashedToken,
  verifyToken,
  createSafeUserResponse,
};
