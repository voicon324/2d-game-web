import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/index.js';
import User from '../src/models/User.js';
import Game from '../src/models/Game.js';
import Matchmaking from '../src/models/Matchmaking.js';

describe('Matchmaking API', () => {
  let token;
  let userId;
  let gameId;

  beforeAll(async () => {
    const MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://admin:password123@localhost:27017/game2d_test?authSource=admin';
    await mongoose.connect(MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Game.deleteMany({});
    await Matchmaking.deleteMany({});

    const user = await User.create({
      username: 'matchmaker',
      email: 'match@test.com',
      password: 'password123'
    });
    userId = user._id;

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'match@test.com', password: 'password123' });
    token = res.body.token;

    const game = await Game.create({
      name: 'Cờ Caro',
      slug: 'caro',
      type: 'turn-based',
      minPlayers: 2,
      maxPlayers: 2,
      isActive: true
    });
    gameId = game._id;
  });

  describe('POST /api/matchmaking/join', () => {
    test('should join matchmaking queue', async () => {
      const res = await request(app)
        .post('/api/matchmaking/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ gameSlug: 'caro', socketId: 'test-socket-123' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('queueId');
      expect(res.body).toHaveProperty('rating');
      expect(res.body.message).toBe('Joined matchmaking queue');
    });

    test('should fail without auth', async () => {
      const res = await request(app)
        .post('/api/matchmaking/join')
        .send({ gameSlug: 'caro', socketId: 'test-socket' });

      expect(res.statusCode).toBe(401);
    });

    test('should fail without gameSlug', async () => {
      const res = await request(app)
        .post('/api/matchmaking/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ socketId: 'test-socket' });

      expect(res.statusCode).toBe(400);
    });

    test('should fail without socketId', async () => {
      const res = await request(app)
        .post('/api/matchmaking/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ gameSlug: 'caro' });

      expect(res.statusCode).toBe(400);
    });

    test('should prevent double queue', async () => {
      await request(app)
        .post('/api/matchmaking/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ gameSlug: 'caro', socketId: 'socket-1' });

      const res = await request(app)
        .post('/api/matchmaking/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ gameSlug: 'caro', socketId: 'socket-2' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Already in matchmaking queue');
    });
  });

  describe('DELETE /api/matchmaking/leave', () => {
    test('should leave matchmaking queue', async () => {
      await request(app)
        .post('/api/matchmaking/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ gameSlug: 'caro', socketId: 'test-socket' });

      const res = await request(app)
        .delete('/api/matchmaking/leave')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.cancelled).toBe(1);
    });

    test('should handle leaving when not in queue', async () => {
      const res = await request(app)
        .delete('/api/matchmaking/leave')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.cancelled).toBe(0);
    });
  });

  describe('GET /api/matchmaking/status', () => {
    test('should return not in queue when not queued', async () => {
      const res = await request(app)
        .get('/api/matchmaking/status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.inQueue).toBe(false);
    });

    test('should return queue status when queued', async () => {
      await request(app)
        .post('/api/matchmaking/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ gameSlug: 'caro', socketId: 'test-socket' });

      const res = await request(app)
        .get('/api/matchmaking/status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.inQueue).toBe(true);
      expect(res.body.gameSlug).toBe('caro');
      expect(res.body).toHaveProperty('rating');
      expect(res.body).toHaveProperty('queuedAt');
    });
  });

  describe('GET /api/matchmaking/stats', () => {
    test('should return queue stats', async () => {
      await request(app)
        .post('/api/matchmaking/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ gameSlug: 'caro', socketId: 'test-socket' });

      const res = await request(app)
        .get('/api/matchmaking/stats');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toContainEqual({ _id: 'caro', count: 1 });
    });
  });
});

describe('ELO Rating Calculation', () => {
  test('User ratings field should be a Map', async () => {
    const MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://admin:password123@localhost:27017/game2d_test?authSource=admin';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }

    await User.deleteMany({});
    const user = await User.create({
      username: 'elotest',
      email: 'elo@test.com',
      password: 'password123'
    });

    // Set rating for a game
    user.ratings.set('caro', { rating: 1200, gamesPlayed: 10, wins: 6, losses: 4 });
    await user.save();

    const found = await User.findById(user._id);
    expect(found.ratings.get('caro').rating).toBe(1200);
    expect(found.ratings.get('caro').wins).toBe(6);

    await mongoose.disconnect();
  });
});
