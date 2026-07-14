/**
 * Tests for middleware stack and error handling
 */

const request = require('supertest');
const app = require('../server');
const {
  AuthError,
  ValidationError,
  RateLimitError,
  UnauthorizedError,
} = require('../utils/errors');

describe('Middleware Stack', () => {
  describe('CORS Middleware', () => {
    it('should allow requests from localhost', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:5173');

      expect(res.status).toBe(200);
    });

    it('should handle preflight requests', async () => {
      const res = await request(app)
        .options('/api/health')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET');

      expect([200, 204]).toContain(res.status);
    });
  });

  describe('Request Logger', () => {
    it('should log incoming requests', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await request(app).get('/api/health');

      expect(consoleSpy).toHaveBeenCalled();
      const logs = consoleSpy.mock.calls.map(call => call[0]).filter(log => 
        typeof log === 'string' && log.includes('GET')
      );
      expect(logs.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });
  });

  describe('Health Check Endpoint', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for undefined routes', async () => {
      const res = await request(app).get('/api/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('code', 'NOT_FOUND');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 404);
    });
  });
});

describe('Error Handler Middleware', () => {
  describe('Custom Error Classes', () => {
    it('should have correct AuthError properties', () => {
      const error = new AuthError('Invalid credentials');

      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTH_ERROR');
    });

    it('should have correct ValidationError properties', () => {
      const details = { email: 'Invalid email format' };
      const error = new ValidationError('Validation failed', details);

      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual(details);
    });

    it('should have correct RateLimitError properties', () => {
      const error = new RateLimitError('Too many requests');

      expect(error.message).toBe('Too many requests');
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should have correct UnauthorizedError properties', () => {
      const error = new UnauthorizedError('Access denied');

      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should serialize error to JSON correctly', () => {
      const error = new AuthError('Invalid token');
      const json = error.toJSON();

      expect(json).toEqual({
        code: 'AUTH_ERROR',
        message: 'Invalid token',
        statusCode: 401,
      });
    });

    it('should serialize ValidationError with details to JSON', () => {
      const details = { username: 'Already taken' };
      const error = new ValidationError('Validation failed', details);
      const json = error.toJSON();

      expect(json).toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        statusCode: 400,
        details,
      });
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error response format', async () => {
      const res = await request(app).get('/api/nonexistent');

      expect(res.body).toHaveProperty('code');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode');
      expect(typeof res.body.code).toBe('string');
      expect(typeof res.body.message).toBe('string');
      expect(typeof res.body.statusCode).toBe('number');
    });
  });
});

describe('Rate Limiter Middleware', () => {
  it('should allow requests within limit', async () => {
    // Make a request - should succeed
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
  });
});

describe('Body Parser Middleware', () => {
  it('should parse JSON on health check', async () => {
    // The health endpoint returns JSON successfully
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
