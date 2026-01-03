import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/index.js';
import User from '../src/models/User.js';
import Game from '../src/models/Game.js';
import Tournament from '../src/models/Tournament.js';

describe('Tournaments API', () => {
  let token;
  let tournamentId;

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
    await Tournament.deleteMany({});

    const user = await User.create({
      username: 'tourneyuser',
      email: 'tourney@test.com',
      password: 'password123'
    });
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tourney@test.com', password: 'password123' });
    token = loginRes.body.token;

    const game = await Game.create({
      name: 'Test Game',
      slug: 'testgame',
      type: 'turn-based',
      isActive: true
    });

    const tournament = await Tournament.create({
      name: 'Test Championship',
      game: game._id,
      status: 'upcoming',
      prize: '$1000',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      createdBy: user._id,
      maxParticipants: 16  // Added required field
    });
    tournamentId = tournament._id;
  });

  describe('GET /api/tournaments', () => {
    test('should return list of tournaments', async () => {
      const res = await request(app).get('/api/tournaments');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Test Championship');
    });
  });

  describe('POST /api/tournaments/:id/join', () => {
    test('should allow user to join tournament', async () => {
      const res = await request(app)
        .post(`/api/tournaments/${tournamentId}/join`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.participants).toHaveLength(1);
      
      const updated = await Tournament.findById(tournamentId);
      expect(updated.participants).toHaveLength(1);
    });

    test('should prevent double joining', async () => {
      await request(app)
        .post(`/api/tournaments/${tournamentId}/join`)
        .set('Authorization', `Bearer ${token}`);
        
      const res = await request(app)
        .post(`/api/tournaments/${tournamentId}/join`)
        .set('Authorization', `Bearer ${token}`);
        
      expect(res.statusCode).toBe(400);
    });
  });
});
