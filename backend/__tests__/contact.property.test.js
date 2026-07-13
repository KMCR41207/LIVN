const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const fc = require('fast-check');
const ContactMessage = require('../models/ContactMessage');
const contactRoutes = require('../routes/contact');
const { connectTestDB, disconnectTestDB } = require('./helpers/db');

let app;

const createToken = (role) => {
  return jwt.sign({ userId: 'test-user', role }, process.env.JWT_SECRET || 'test-secret');
};

beforeAll(async () => {
  await connectTestDB();
  
  app = express();
  app.use(express.json());
  app.use('/api/contact', contactRoutes);
});

afterAll(async () => {
  await disconnectTestDB();
});

afterEach(async () => {
  await ContactMessage.deleteMany({});
});

describe('Contact Message Module - Property Tests', () => {
  // Feature: backend-cms-apis, Property 5: Valid contact message submission
  describe('Property 5: Valid contact message submission', () => {
    test('should create contact message without auth and appear in admin listing', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.emailAddress(),
          fc.string({ minLength: 1 }),
          async (name, email, message) => {
            // POST without auth
            const createRes = await request(app)
              .post('/api/contact')
              .send({ name, email, message });
            
            expect(createRes.status).toBe(201);
            expect(createRes.body.success).toBe(true);
            
            // Admin GET should list it
            const adminToken = createToken('admin');
            const listRes = await request(app)
              .get('/api/contact')
              .set('Authorization', `Bearer ${adminToken}`)
              .send();
            
            expect(listRes.status).toBe(200);
            expect(listRes.body.data).toHaveLength(1);
            expect(listRes.body.data[0].name).toBe(name);
            expect(listRes.body.data[0].email).toBe(email.toLowerCase());
            expect(listRes.body.data[0].message).toBe(message);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Feature: backend-cms-apis, Property 6: Invalid contact message is rejected
  describe('Property 6: Invalid contact message is rejected', () => {
    test('should reject with empty name', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 1 }),
          async (email, message) => {
            const res = await request(app)
              .post('/api/contact')
              .send({ name: '', email, message });
            
            expect(res.status).toBe(400);
            expect(res.body.error).toBeTruthy();
            
            const count = await ContactMessage.countDocuments({});
            expect(count).toBe(0);
          }
        ),
        { numRuns: 30 }
      );
    });

    test('should reject with empty message', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.emailAddress(),
          async (name, email) => {
            const res = await request(app)
              .post('/api/contact')
              .send({ name, email, message: '' });
            
            expect(res.status).toBe(400);
            expect(res.body.error).toBeTruthy();
            
            const count = await ContactMessage.countDocuments({});
            expect(count).toBe(0);
          }
        ),
        { numRuns: 30 }
      );
    });

    test('should reject with invalid email format', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }).filter(s => !s.includes('@')),
          fc.string({ minLength: 1 }),
          async (name, invalidEmail, message) => {
            const res = await request(app)
              .post('/api/contact')
              .send({ name, email: invalidEmail, message });
            
            expect(res.status).toBe(400);
            expect(res.body.error).toBeTruthy();
          }
        ),
        { numRuns: 30 }
      );
    });

    test('should reject with empty email', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          async (name, message) => {
            const res = await request(app)
              .post('/api/contact')
              .send({ name, email: '', message });
            
            expect(res.status).toBe(400);
            expect(res.body.error).toBeTruthy();
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  // Feature: backend-cms-apis, Property 7: Contact message deletion removes the message from the listing
  describe('Property 7: Contact message deletion removes the message from the listing', () => {
    test('should delete contact message and not appear in admin listing', async () => {
      const adminToken = createToken('admin');
      
      // Create message
      const message = await ContactMessage.create({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
      });

      // Admin DELETE
      const deleteRes = await request(app)
        .delete(`/api/contact/${message._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();
      
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.deleted).toBe(true);
      
      // Admin GET should not list it
      const listRes = await request(app)
        .get('/api/contact')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();
      
      expect(listRes.status).toBe(200);
      expect(listRes.body.data).toHaveLength(0);
    });
  });
});

describe('Contact Message Module - Integration Tests', () => {
  describe('Authentication wiring', () => {
    test('GET /api/contact with no token should return 401', async () => {
      const res = await request(app)
        .get('/api/contact')
        .send();
      
      expect(res.status).toBe(401);
    });

    test('GET /api/contact with non-admin token should return 403', async () => {
      const userToken = createToken('user');
      
      const res = await request(app)
        .get('/api/contact')
        .set('Authorization', `Bearer ${userToken}`)
        .send();
      
      expect(res.status).toBe(403);
    });

    test('DELETE /api/contact/:id with no token should return 401', async () => {
      const msg = await ContactMessage.create({
        name: 'Test',
        email: 'test@example.com',
        message: 'Test',
      });
      
      const res = await request(app)
        .delete(`/api/contact/${msg._id}`)
        .send();
      
      expect(res.status).toBe(401);
    });

    test('DELETE /api/contact/:id with non-admin token should return 403', async () => {
      const userToken = createToken('user');
      const msg = await ContactMessage.create({
        name: 'Test',
        email: 'test@example.com',
        message: 'Test',
      });
      
      const res = await request(app)
        .delete(`/api/contact/${msg._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send();
      
      expect(res.status).toBe(403);
    });

    test('POST /api/contact with no token should return 201 (public)', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'Test', email: 'test@example.com', message: 'Test' });
      
      expect(res.status).toBe(201);
    });
  });

  describe('404 for nonexistent ids', () => {
    test('DELETE /:id with nonexistent id should return 404', async () => {
      const adminToken = createToken('admin');
      const res = await request(app)
        .delete('/api/contact/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();
      
      expect(res.status).toBe(404);
    });
  });

  describe('Sort order', () => {
    test('should return messages sorted by createdAt descending', async () => {
      const m1 = await ContactMessage.create({ name: 'User1', email: 'user1@example.com', message: 'Msg1' });
      await new Promise(resolve => setTimeout(resolve, 10));
      const m2 = await ContactMessage.create({ name: 'User2', email: 'user2@example.com', message: 'Msg2' });

      const adminToken = createToken('admin');
      const res = await request(app)
        .get('/api/contact')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();
      
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]._id.toString()).toBe(m2._id.toString());
      expect(res.body.data[1]._id.toString()).toBe(m1._id.toString());
    });
  });
});
