import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/index.js';
import User from '../src/models/User.js';
import Game from '../src/models/Game.js';
import Match from '../src/models/Match.js';

describe('Matches API', () => {
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
    await Match.deleteMany({});
    await Game.deleteMany({});
    await User.deleteMany({});

    const game = await Game.create({
      name: 'Match Test Game',
      slug: 'matchgame',
      type: 'turn-based',
      isActive: true
    });
    gameId = game._id;

    // Create a live match
    await Match.create({
      game: gameId,
      roomCode: 'LIVE123',
      status: 'playing',
      players: []
    });

    // Create a finished match
    await Match.create({
      game: gameId,
      roomCode: 'HIST123',
      status: 'finished',
      players: []
    });
  });

  describe('GET /api/matches/live', () => {
    test('should return only playing matches', async () => {
      const res = await request(app).get('/api/matches/live');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].status).toBe('playing');
      expect(res.body.some(m => m.status === 'finished')).toBe(false);
    });
  });
});
