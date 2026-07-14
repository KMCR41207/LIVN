/**
 * Request Logger Middleware
 * Logs all incoming requests with method, URL, and timestamp
 */

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.get('user-agent');

  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);

  next();
};

module.exports = logger;
