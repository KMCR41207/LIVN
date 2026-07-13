const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const fc = require('fast-check');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const analyticsRoutes = require('../routes/analytics');
const { connectTestDB, disconnectTestDB } = require('./helpers/db');

let app;

const createToken = (role) => {
  return jwt.sign({ userId: 'test-user', role }, process.env.JWT_SECRET || 'test-secret');
};

beforeAll(async () => {
  await connectTestDB();
  
  app = express();
  app.use(express.json());
  app.use('/api/analytics', analyticsRoutes);
});

afterAll(async () => {
  await disconnectTestDB();
});

afterEach(async () => {
  await AnalyticsEvent.deleteMany({});
});

describe('Analytics Module - Property Tests', () => {
  // Feature: backend-cms-apis, Property 8: Valid analytics event is persisted
  describe('Property 8: Valid analytics event is persisted', () => {
    test('should create analytics event without auth', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.option(fc.string()),
          async (event, page) => {
            const res = await request(app)
              .post('/api/analytics/events')
              .send({ event, page });
            
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            
            // Verify it was persisted
            const count = await AnalyticsEvent.countDocuments({ event });
            expect(count).toBe(1);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Feature: backend-cms-apis, Property 11: Analytics event rejection for missing event name
  describe('Property 11: Analytics event rejection for missing event name', () => {
    test('should reject with empty event', async () => {
      const res = await request(app)
        .post('/api/analytics/events')
        .send({ event: '', page: 'homepage' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBeTruthy();
      
      const count = await AnalyticsEvent.countDocuments({});
      expect(count).toBe(0);
    });

    test('should reject with whitespace-only event', async () => {
      const res = await request(app)
        .post('/api/analytics/events')
        .send({ event: '   ', page: 'homepage' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBeTruthy();
    });

    test('should reject with missing event', async () => {
      const res = await request(app)
        .post('/api/analytics/events')
        .send({ page: 'homepage' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBeTruthy();
    });
  });

  // Feature: backend-cms-apis, Property 9: Analytics aggregation report counts are consistent
  describe('Property 9: Analytics aggregation report counts are consistent', () => {
    test('should return consistent counts for aggregated events', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }),
          async (eventNames) => {
            // Insert events
            for (const name of eventNames) {
              await AnalyticsEvent.create({ event: name });
            }
            
            // Count per event name
            const expectedCounts = {};
            eventNames.forEach(name => {
              expectedCounts[name] = (expectedCounts[name] || 0) + 1;
            });

            // Query report
            const adminToken = createToken('admin');
            const res = await request(app)
              .get('/api/analytics/report')
              .set('Authorization', `Bearer ${adminToken}`)
              .send();
            
            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
            
            // Build actual counts
            const actualCounts = {};
            res.body.data.forEach(row => {
              actualCounts[row.event] = row.count;
            });
            
            // Verify counts match
            Object.entries(expectedCounts).forEach(([event, expected]) => {
              expect(actualCounts[event]).toBe(expected);
            });
            
            // Verify total count
            const totalActual = res.body.data.reduce((sum, row) => sum + row.count, 0);
            const totalExpected = eventNames.length;
            expect(totalActual).toBe(totalExpected);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  // Feature: backend-cms-apis, Property 10: Analytics report date filtering excludes out-of-range events
  describe('Property 10: Analytics report date filtering excludes out-of-range events', () => {
    test('should filter by startDate and endDate correctly', async () => {
      const adminToken = createToken('admin');
      
      // Create events at different timestamps
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      
      // Insert events with specific timestamps
      await AnalyticsEvent.create({ event: 'old_event', createdAt: threeDaysAgo });
      await AnalyticsEvent.create({ event: 'recent_event', createdAt: dayAgo });
      await AnalyticsEvent.create({ event: 'today_event', createdAt: now });
      
      // Query with date range
      const res = await request(app)
        .get('/api/analytics/report')
        .query({ startDate: dayAgo.toISOString(), endDate: twoDaysFromNow.toISOString() })
        .set('Authorization', `Bearer ${adminToken}`)
        .send();
      
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      
      const eventNames = res.body.data.map(row => row.event);
      expect(eventNames).toContain('recent_event');
      expect(eventNames).toContain('today_event');
      expect(eventNames).not.toContain('old_event');
    });
  });
});

describe('Analytics Module - Integration Tests', () => {
  describe('Authentication wiring', () => {
    test('POST /api/analytics/events with no token should return 201 (public)', async () => {
      const res = await request(app)
        .post('/api/analytics/events')
        .send({ event: 'page_view' });
      
      expect(res.status).toBe(201);
    });

    test('GET /api/analytics/report with no token should return 401', async () => {
      const res = await request(app)
        .get('/api/analytics/report')
        .send();
      
      expect(res.status).toBe(401);
    });

    test('GET /api/analytics/report with non-admin token should return 403', async () => {
      const userToken = createToken('user');
      
      const res = await request(app)
        .get('/api/analytics/report')
        .set('Authorization', `Bearer ${userToken}`)
        .send();
      
      expect(res.status).toBe(403);
    });
  });

  describe('Report data structure', () => {
    test('should return report with correct structure', async () => {
      await AnalyticsEvent.create({ event: 'page_view' });
      await AnalyticsEvent.create({ event: 'add_to_cart' });
      await AnalyticsEvent.create({ event: 'page_view' });
      
      const adminToken = createToken('admin');
      const res = await request(app)
        .get('/api/analytics/report')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();
      
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(2);
      
      // Check structure of each row
      res.body.data.forEach(row => {
        expect(row).toHaveProperty('event');
        expect(row).toHaveProperty('count');
        expect(typeof row.event).toBe('string');
        expect(typeof row.count).toBe('number');
      });
    });

    test('should sort by count descending', async () => {
      await AnalyticsEvent.create({ event: 'page_view' });
      await AnalyticsEvent.create({ event: 'page_view' });
      await AnalyticsEvent.create({ event: 'page_view' });
      await AnalyticsEvent.create({ event: 'add_to_cart' });

      const adminToken = createToken('admin');
      const res = await request(app)
        .get('/api/analytics/report')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();
      
      expect(res.status).toBe(200);
      expect(res.body.data[0].event).toBe('page_view');
      expect(res.body.data[0].count).toBe(3);
      expect(res.body.data[1].event).toBe('add_to_cart');
      expect(res.body.data[1].count).toBe(1);
    });
  });
});
