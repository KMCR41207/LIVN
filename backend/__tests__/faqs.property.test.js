const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const fc = require('fast-check');
const Faq = require('../models/Faq');
const faqRoutes = require('../routes/faqs');
const { connectTestDB, disconnectTestDB } = require('./helpers/db');

let app;

// Create admin and user tokens for testing
const createToken = (role) => {
  return jwt.sign({ userId: 'test-user', role }, process.env.JWT_SECRET || 'test-secret');
};

beforeAll(async () => {
  await connectTestDB();
  
  // Setup Express app for testing
  app = express();
  app.use(express.json());
  app.use('/api/faqs', faqRoutes);
});

afterAll(async () => {
  await disconnectTestDB();
});

afterEach(async () => {
  await Faq.deleteMany({});
});

describe('FAQ Module - Property Tests', () => {
  // Feature: backend-cms-apis, Property 1: Valid FAQ creation round-trip
  describe('Property 1: Valid FAQ creation round-trip', () => {
    test('should create and retrieve FAQ with matching fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          async (question, answer) => {
            const adminToken = createToken('admin');
            
            // POST to create
            const createRes = await request(app)
              .post('/api/faqs')
              .set('Authorization', `Bearer ${adminToken}`)
              .send({ question, answer });
            
            expect(createRes.status).toBe(201);
            expect(createRes.body.data).toBeDefined();
            const createdId = createRes.body.data._id;
            
            // GET by id
            const getRes = await request(app)
              .get(`/api/faqs/${createdId}`)
              .send();
            
            expect(getRes.status).toBe(200);
            expect(getRes.body.data.question).toBe(question);
            expect(getRes.body.data.answer).toBe(answer);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  // Feature: backend-cms-apis, Property 2: Invalid FAQ creation is rejected
  describe('Property 2: Invalid FAQ creation is rejected', () => {
    test('should reject FAQ with empty question', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          async (answer) => {
            const adminToken = createToken('admin');
            
            const res = await request(app)
              .post('/api/faqs')
              .set('Authorization', `Bearer ${adminToken}`)
              .send({ question: '', answer });
            
            expect(res.status).toBe(400);
            expect(res.body.error).toBeTruthy();
            
            // Verify no document was created
            const count = await Faq.countDocuments({});
            expect(count).toBe(0);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('should reject FAQ with empty answer', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          async (question) => {
            const adminToken = createToken('admin');
            
            const res = await request(app)
              .post('/api/faqs')
              .set('Authorization', `Bearer ${adminToken}`)
              .send({ question, answer: '' });
            
            expect(res.status).toBe(400);
            expect(res.body.error).toBeTruthy();
            
            // Verify no document was created
            const count = await Faq.countDocuments({});
            expect(count).toBe(0);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // Feature: backend-cms-apis, Property 3: FAQ update is reflected in the response
  describe('Property 3: FAQ update is reflected in the response', () => {
    test('should update FAQ and reflect changes', async () => {
      const adminToken = createToken('admin');
      
      // Create initial FAQ
      const initial = await Faq.create({
        question: 'Original question',
        answer: 'Original answer',
        order: 1,
      });

      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.record({
              question: fc.string({ minLength: 1 }),
            }),
            fc.record({
              answer: fc.string({ minLength: 1 }),
            }),
            fc.record({
              order: fc.integer(),
            })
          ),
          async (updatePayload) => {
            const res = await request(app)
              .put(`/api/faqs/${initial._id}`)
              .set('Authorization', `Bearer ${adminToken}`)
              .send(updatePayload);
            
            expect(res.status).toBe(200);
            
            // Check updated fields match
            Object.entries(updatePayload).forEach(([key, value]) => {
              expect(res.body.data[key]).toBe(value);
            });
            
            // Check unchanged fields retain prior values
            if (!updatePayload.question) {
              expect(res.body.data.question).toBe(initial.question);
            }
            if (!updatePayload.answer) {
              expect(res.body.data.answer).toBe(initial.answer);
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // Feature: backend-cms-apis, Property 4: FAQ deletion removes the document
  describe('Property 4: FAQ deletion removes the document', () => {
    test('should delete FAQ and return 404 on subsequent GET', async () => {
      const adminToken = createToken('admin');
      
      // Create FAQ
      const faq = await Faq.create({
        question: 'Test question',
        answer: 'Test answer',
      });

      // DELETE
      const deleteRes = await request(app)
        .delete(`/api/faqs/${faq._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();
      
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.deleted).toBe(true);
      
      // GET should return 404
      const getRes = await request(app)
        .get(`/api/faqs/${faq._id}`)
        .send();
      
      expect(getRes.status).toBe(404);
    });
  });
});

describe('FAQ Module - Integration Tests', () => {
  describe('Authentication wiring', () => {
    test('POST /api/faqs with no token should return 401', async () => {
      const res = await request(app)
        .post('/api/faqs')
        .send({ question: 'Q', answer: 'A' });
      
      expect(res.status).toBe(401);
    });

    test('POST /api/faqs with non-admin token should return 403', async () => {
      const userToken = createToken('user');
      
      const res = await request(app)
        .post('/api/faqs')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ question: 'Q', answer: 'A' });
      
      expect(res.status).toBe(403);
    });

    test('GET /api/faqs should return 200 without token', async () => {
      const res = await request(app)
        .get('/api/faqs')
        .send();
      
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('Sort order', () => {
    test('should return FAQs sorted by order ascending, then createdAt descending', async () => {
      const faq1 = await Faq.create({ question: 'Q1', answer: 'A1', order: 2 });
      await new Promise(resolve => setTimeout(resolve, 10));
      const faq2 = await Faq.create({ question: 'Q2', answer: 'A2', order: 1 });
      await new Promise(resolve => setTimeout(resolve, 10));
      const faq3 = await Faq.create({ question: 'Q3', answer: 'A3', order: 1 });

      const res = await request(app).get('/api/faqs');
      
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
      // faq3 should be first (order 1, more recent)
      expect(res.body.data[0]._id.toString()).toBe(faq3._id.toString());
      // faq2 should be second (order 1, less recent)
      expect(res.body.data[1]._id.toString()).toBe(faq2._id.toString());
      // faq1 should be third (order 2)
      expect(res.body.data[2]._id.toString()).toBe(faq1._id.toString());
    });
  });

  describe('404 for nonexistent ids', () => {
    test('GET /:id with nonexistent id should return 404', async () => {
      const res = await request(app).get('/api/faqs/507f1f77bcf86cd799439011');
      expect(res.status).toBe(404);
    });

    test('PUT /:id with nonexistent id should return 404', async () => {
      const adminToken = createToken('admin');
      const res = await request(app)
        .put('/api/faqs/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ question: 'Updated' });
      
      expect(res.status).toBe(404);
    });

    test('DELETE /:id with nonexistent id should return 404', async () => {
      const adminToken = createToken('admin');
      const res = await request(app)
        .delete('/api/faqs/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();
      
      expect(res.status).toBe(404);
    });
  });
});
