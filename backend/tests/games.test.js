import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/index.js';
import User from '../src/models/User.js';
import Game from '../src/models/Game.js';
import Match from '../src/models/Match.js';

describe('Games API', () => {
  let token;
  let userId;

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
    await Match.deleteMany({});

    const user = await User.create({
      username: 'gamertest',
      email: 'gamer@test.com',
      password: 'password123'
    });
    userId = user._id;

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'gamer@test.com', password: 'password123' });
    token = res.body.token;

    await Game.create({
      name: 'Cờ Caro',
      slug: 'caro',
      type: 'turn-based',
      minPlayers: 2,
      maxPlayers: 2,
      config: { boardSize: 15 },
      isActive: true
    });
  });

  describe('GET /api/games', () => {
    test('should return list of games', async () => {
      const res = await request(app).get('/api/games');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].slug).toBe('caro');
    });
  });

  describe('POST /api/games/:slug/rooms', () => {
    test('should create a new room', async () => {
      const res = await request(app)
        .post('/api/games/caro/rooms')
        .set('Authorization', `Bearer ${token}`);
        
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('roomCode');
      expect(res.body.game.slug).toBe('caro');
      expect(res.body.players).toHaveLength(1);
      // Fixed: check populated user object structure
      expect(res.body.players[0].user._id.toString()).toBe(userId.toString());
    });

    test('should fail without auth', async () => {
      const res = await request(app)
        .post('/api/games/caro/rooms');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/games/rooms/:roomCode/join', () => {
    let roomCode;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/games/caro/rooms')
        .set('Authorization', `Bearer ${token}`);
      roomCode = res.body.roomCode;
      
      await User.create({
        username: 'player2',
        email: 'p2@test.com',
        password: 'password123'
      });
    });

    test('should allow second player to join', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'p2@test.com', password: 'password123' });
      const p2Token = loginRes.body.token;

      // Fixed: correct endpoint path uses :code not :roomCode
      const res = await request(app)
        .post(`/api/games/rooms/${roomCode}/join`)
        .set('Authorization', `Bearer ${p2Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.players).toHaveLength(2);
    });

    test('should prevent joining if already in room', async () => {
      const res = await request(app)
        .post(`/api/games/rooms/${roomCode}/join`)
        .set('Authorization', `Bearer ${token}`);
        
      expect(res.statusCode).toBe(400);
    });
  });
});
