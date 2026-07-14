/**
 * Custom Error Classes for centralized error handling
 * All errors inherit from Error class and follow consistent format
 */

/**
 * Base custom error class
 */
class CustomError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Authentication errors - thrown when auth fails
 */
class AuthError extends CustomError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTH_ERROR');
  }
}

/**
 * Validation errors - thrown when input validation fails
 */
class ValidationError extends CustomError {
  constructor(message = 'Validation failed', details = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      details: this.details,
    };
  }
}

/**
 * Rate limit errors - thrown when rate limit exceeded
 */
class RateLimitError extends CustomError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * Unauthorized errors - thrown when user lacks permissions
 */
class UnauthorizedError extends CustomError {
  constructor(message = 'Unauthorized') {
    super(message, 403, 'UNAUTHORIZED');
  }
}

/**
 * Not found errors - thrown when resource not found
 */
class NotFoundError extends CustomError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Server errors - thrown for internal server errors
 */
class ServerError extends CustomError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'SERVER_ERROR');
  }
}

module.exports = {
  CustomError,
  AuthError,
  ValidationError,
  RateLimitError,
  UnauthorizedError,
  NotFoundError,
  ServerError,
};
