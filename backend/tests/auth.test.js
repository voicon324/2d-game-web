import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/index.js';
import User from '../src/models/User.js';

describe('Auth API', () => {
  beforeAll(async () => {
    // Connect to test database with required authentication
    // Note: Assuming 'admin' user has permissions on game2d_test or clusterAdmin
    const MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://admin:password123@localhost:27017/game2d_test?authSource=admin';
    await mongoose.connect(MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.username).toBe('testuser');
    });

    test('should fail if email already exists', async () => {
      await User.create({
        username: 'existing',
        email: 'test@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    test('should login with valid credentials (email)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    test('should login with valid credentials (username)', async () => {
      // Assuming we updated the backend to support username login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser', // Sending username in email field as supported
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    test('should fail with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
    });
  });
});
