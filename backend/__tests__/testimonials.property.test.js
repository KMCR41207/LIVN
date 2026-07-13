const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const fc = require('fast-check');
const Testimonial = require('../models/Testimonial');
const testimonialRoutes = require('../routes/testimonials');
const { connectTestDB, disconnectTestDB } = require('./helpers/db');

let app;

const createToken = (role) => {
  return jwt.sign({ userId: 'test-user', role }, process.env.JWT_SECRET || 'test-secret');
};

beforeAll(async () => {
  await connectTestDB();
  
  app = express();
  app.use(express.json());
  app.use('/api/testimonials', testimonialRoutes);
});

afterAll(async () => {
  await disconnectTestDB();
});

afterEach(async () => {
  await Testimonial.deleteMany({});
});

describe('Testimonial Module - Property Tests', () => {
  // Feature: backend-cms-apis, Property 1: Valid Testimonial creation round-trip
  describe('Property 1: Valid Testimonial creation round-trip', () => {
    test('should create and retrieve Testimonial with matching fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.integer({ min: 1, max: 5 }),
          async (author, content, rating) => {
            const adminToken = createToken('admin');
            
            // POST to create
            const createRes = await request(app)
              .post('/api/testimonials')
              .set('Authorization', `Bearer ${adminToken}`)
              .send({ author, content, rating });
            
            expect(createRes.status).toBe(201);
            expect(createRes.body.data).toBeDefined();
            const createdId = createRes.body.data._id;
            
            // GET by id
            const getRes = await request(app)
              .get(`/api/testimonials/${createdId}`)
              .send();
            
            expect(getRes.status).toBe(200);
            expect(getRes.body.data.author).toBe(author);
            expect(getRes.body.data.content).toBe(content);
            expect(getRes.body.data.rating).toBe(rating);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  // Feature: backend-cms-apis, Property 2: Invalid Testimonial creation is rejected
  describe('Property 2: Invalid Testimonial creation is rejected', () => {
    test('should reject with empty author', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.integer({ min: 1, max: 5 }),
          async (content, rating) => {
            const adminToken = createToken('admin');
            
            const res = await request(app)
              .post('/api/testimonials')
              .set('Authorization', `Bearer ${adminToken}`)
              .send({ author: '', content, rating });
            
            expect(res.status).toBe(400);
            expect(res.body.error).toBeTruthy();
            
            const count = await Testimonial.countDocuments({});
            expect(count).toBe(0);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('should reject with empty content', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.integer({ min: 1, max: 5 }),
          async (author, rating) => {
            const adminToken = createToken('admin');
            
            const res = await request(app)
              .post('/api/testimonials')
              .set('Authorization', `Bearer ${adminToken}`)
              .send({ author, content: '', rating });
            
            expect(res.status).toBe(400);
            expect(res.body.error).toBeTruthy();
            
            const count = await Testimonial.countDocuments({});
            expect(count).toBe(0);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('should reject with rating < 1', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          async (author, content) => {
            const adminToken = createToken('admin');
            
            const res = await request(app)
              .post('/api/testimonials')
              .set('Authorization', `Bearer ${adminToken}`)
              .send({ author, content, rating: 0 });
            
            expect(res.status).toBe(400);
            expect(res.body.error).toBeTruthy();
          }
        ),
        { numRuns: 20 }
      );
    });

    test('should reject with rating > 5', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          async (author, content) => {
            const adminToken = createToken('admin');
            
            const res = await request(app)
              .post('/api/testimonials')
              .set('Authorization', `Bearer ${adminToken}`)
              .send({ author, content, rating: 6 });
            
            expect(res.status).toBe(400);
            expect(res.body.error).toBeTruthy();
          }
        ),
        { numRuns: 20 }
      );
    });

    test('should reject with missing rating', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          async (author, content) => {
            const adminToken = createToken('admin');
            
            const res = await request(app)
              .post('/api/testimonials')
              .set('Authorization', `Bearer ${adminToken}`)
              .send({ author, content });
            
            expect(res.status).toBe(400);
            expect(res.body.error).toBeTruthy();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // Feature: backend-cms-apis, Property 3: Testimonial update is reflected in the response
  describe('Property 3: Testimonial update is reflected in the response', () => {
    test('should update Testimonial and reflect changes', async () => {
      const adminToken = createToken('admin');
      
      const initial = await Testimonial.create({
        author: 'Original Author',
        content: 'Original content',
        rating: 4,
      });

      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.record({
              author: fc.string({ minLength: 1 }),
            }),
            fc.record({
              content: fc.string({ minLength: 1 }),
            }),
            fc.record({
              rating: fc.integer({ min: 1, max: 5 }),
            })
          ),
          async (updatePayload) => {
            const res = await request(app)
              .put(`/api/testimonials/${initial._id}`)
              .set('Authorization', `Bearer ${adminToken}`)
              .send(updatePayload);
            
            expect(res.status).toBe(200);
            
            Object.entries(updatePayload).forEach(([key, value]) => {
              expect(res.body.data[key]).toBe(value);
            });
            
            if (!updatePayload.author) {
              expect(res.body.data.author).toBe(initial.author);
            }
            if (!updatePayload.content) {
              expect(res.body.data.content).toBe(initial.content);
            }
            if (!updatePayload.rating) {
              expect(res.body.data.rating).toBe(initial.rating);
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // Feature: backend-cms-apis, Property 4: Testimonial deletion removes the document
  describe('Property 4: Testimonial deletion removes the document', () => {
    test('should delete Testimonial and return 404 on subsequent GET', async () => {
      const adminToken = createToken('admin');
      
      const testimonial = await Testimonial.create({
        author: 'Test Author',
        content: 'Test content',
        rating: 5,
      });

      const deleteRes = await request(app)
        .delete(`/api/testimonials/${testimonial._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();
      
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.deleted).toBe(true);
      
      const getRes = await request(app)
        .get(`/api/testimonials/${testimonial._id}`)
        .send();
      
      expect(getRes.status).toBe(404);
    });
  });
});

describe('Testimonial Module - Integration Tests', () => {
  describe('Authentication wiring', () => {
    test('POST /api/testimonials with no token should return 401', async () => {
      const res = await request(app)
        .post('/api/testimonials')
        .send({ author: 'A', content: 'C', rating: 5 });
      
      expect(res.status).toBe(401);
    });

    test('POST /api/testimonials with non-admin token should return 403', async () => {
      const userToken = createToken('user');
      
      const res = await request(app)
        .post('/api/testimonials')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ author: 'A', content: 'C', rating: 5 });
      
      expect(res.status).toBe(403);
    });

    test('GET /api/testimonials should return 200 without token', async () => {
      const res = await request(app)
        .get('/api/testimonials')
        .send();
      
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('Sort order', () => {
    test('should return Testimonials sorted by createdAt descending', async () => {
      const t1 = await Testimonial.create({ author: 'A1', content: 'C1', rating: 4 });
      await new Promise(resolve => setTimeout(resolve, 10));
      const t2 = await Testimonial.create({ author: 'A2', content: 'C2', rating: 5 });

      const res = await request(app).get('/api/testimonials');
      
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]._id.toString()).toBe(t2._id.toString());
      expect(res.body.data[1]._id.toString()).toBe(t1._id.toString());
    });
  });

  describe('404 for nonexistent ids', () => {
    test('GET /:id with nonexistent id should return 404', async () => {
      const res = await request(app).get('/api/testimonials/507f1f77bcf86cd799439011');
      expect(res.status).toBe(404);
    });

    test('PUT /:id with nonexistent id should return 404', async () => {
      const adminToken = createToken('admin');
      const res = await request(app)
        .put('/api/testimonials/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ author: 'Updated' });
      
      expect(res.status).toBe(404);
    });

    test('DELETE /:id with nonexistent id should return 404', async () => {
      const adminToken = createToken('admin');
      const res = await request(app)
        .delete('/api/testimonials/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();
      
      expect(res.status).toBe(404);
    });
  });
});
