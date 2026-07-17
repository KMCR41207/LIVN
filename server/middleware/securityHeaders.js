/**
 * Security Headers and CORS Middleware
 * Implements OWASP recommended security headers
 */

const cors = require('cors');

// CORS Configuration - Restrict to frontend domains only
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests from whitelisted origins
    const allowedOrigins = [
      'http://localhost:5173',   // Dev frontend
      'http://localhost:3000',   // Fallback dev port
      'http://127.0.0.1:5173',   // Localhost variants
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL || 'https://livaani.com', // Production
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS rejected origin: ${origin}`);
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'], // For pagination
  maxAge: 3600, // Cache preflight for 1 hour
};

/**
 * Apply CORS middleware
 */
const applyCors = cors(corsOptions);

/**
 * Apply security headers
 */
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  // Restrict where resources can be loaded from
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' https://connect.facebook.net https://apis.google.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://www.googleapis.com https://graph.facebook.com; " +
    "form-action 'self'; " +
    "base-uri 'self'; " +
    "frame-ancestors 'none';"
  );
  
  // Strict Transport Security (HTTPS only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};

module.exports = {
  applyCors,
  securityHeaders,
  corsOptions,
};
