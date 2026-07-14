/**
 * Rate Limiter Middleware
 * Implements different rate limits for different endpoint types
 */

const { RateLimitError } = require('../utils/errors');

/**
 * In-memory store for tracking requests
 * In production, use Redis or similar
 */
const requestStore = new Map();

/**
 * Check if request exceeds rate limit
 * @param {string} key - Unique identifier (IP or user ID)
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - true if within limit, false if exceeded
 */
function isWithinLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  const userRequests = requestStore.get(key) || [];

  // Remove old requests outside the window
  const recentRequests = userRequests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return false;
  }

  // Add current request
  recentRequests.push(now);
  requestStore.set(key, recentRequests);

  return true;
}

/**
 * Generic rate limiter factory
 * @param {number} maxRequests - Maximum requests
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} - Express middleware
 */
function createRateLimiter(maxRequests, windowMs) {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const isLimit = isWithinLimit(key, maxRequests, windowMs);

    if (!isLimit) {
      return next(new RateLimitError('Too many requests. Please try again later.'));
    }

    next();
  };
}

/**
 * Rate limiter for authentication endpoints
 * 10 requests per minute
 */
const authLimiter = createRateLimiter(10, 60 * 1000);

/**
 * Rate limiter for password reset endpoints
 * 3 requests per hour
 */
const passwordResetLimiter = createRateLimiter(3, 60 * 60 * 1000);

/**
 * Rate limiter for OTP send endpoints
 * 3 requests per hour
 */
const otpSendLimiter = createRateLimiter(3, 60 * 60 * 1000);

/**
 * General rate limiter for other endpoints
 * 1000 requests per minute (high for testing, reduced in production)
 */
const generalLimiter = createRateLimiter(1000, 60 * 1000);

module.exports = {
  authLimiter,
  passwordResetLimiter,
  otpSendLimiter,
  generalLimiter,
  createRateLimiter,
};

