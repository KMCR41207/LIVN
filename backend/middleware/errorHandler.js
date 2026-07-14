/**
 * Centralized Error Handler Middleware
 * Catches all synchronous and async errors
 * Returns consistent error response format
 */

const {
  CustomError,
  AuthError,
  ValidationError,
  RateLimitError,
  UnauthorizedError,
  NotFoundError,
  ServerError,
} = require('../utils/errors');

/**
 * Error handler middleware - must be last middleware
 * Catches all errors and returns consistent response
 */
const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const path = req.path;
  const method = req.method;

  // Handle custom errors
  if (err instanceof CustomError) {
    console.error(`[${timestamp}] ${method} ${path} - ${err.code}: ${err.message}`);
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle MongoDB validation errors
  if (err.name === 'ValidationError') {
    const details = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});

    const validationError = new ValidationError('Validation failed', details);
    console.error(`[${timestamp}] ${method} ${path} - Validation Error:`, details);
    return res.status(validationError.statusCode).json(validationError.toJSON());
  }

  // Handle MongoDB cast errors
  if (err.name === 'CastError') {
    const validationError = new ValidationError('Invalid ID format');
    console.error(`[${timestamp}] ${method} ${path} - Cast Error: ${err.message}`);
    return res.status(validationError.statusCode).json(validationError.toJSON());
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const validationError = new ValidationError(
      `Duplicate entry`,
      { [field]: `${field} already exists` }
    );
    console.error(`[${timestamp}] ${method} ${path} - Duplicate Key Error:`, field);
    return res.status(validationError.statusCode).json(validationError.toJSON());
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const authError = new AuthError('Invalid token');
    console.error(`[${timestamp}] ${method} ${path} - JWT Error: ${err.message}`);
    return res.status(authError.statusCode).json(authError.toJSON());
  }

  if (err.name === 'TokenExpiredError') {
    const authError = new AuthError('Token expired');
    console.error(`[${timestamp}] ${method} ${path} - Token Expired`);
    return res.status(authError.statusCode).json(authError.toJSON());
  }

  // Log unexpected errors
  console.error(`[${timestamp}] ${method} ${path} - Unexpected Error:`, err);

  // Return generic server error
  const serverError = new ServerError('Internal server error');
  return res.status(serverError.statusCode).json(serverError.toJSON());
};

/**
 * Async error wrapper for route handlers
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler,
};
