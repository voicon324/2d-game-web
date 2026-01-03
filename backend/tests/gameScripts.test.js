import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/index.js';
import User from '../src/models/User.js';
import Game from '../src/models/Game.js';

describe('Game Script API (Admin)', () => {
  let adminToken;
  let userToken;
  let adminId;
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

    // Create admin user
    const admin = await User.create({
      username: 'adminuser',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    adminId = admin._id;

    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminRes.body.token;

    // Create regular user
    await User.create({
      username: 'normaluser',
      email: 'user@test.com',
      password: 'password123',
      role: 'user'
    });

    const userRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password123' });
    userToken = userRes.body.token;

    // Create game with script
    const game = await Game.create({
      name: 'Test Game',
      slug: 'testgame',
      type: 'turn-based',
      minPlayers: 2,
      maxPlayers: 2,
      isActive: true,
      scriptCode: '// Initial script\nclass Game extends BaseGame { load() {} }'
    });
    gameId = game._id;
  });

  describe('GET /api/games/:id/script', () => {
    test('should return game script for admin', async () => {
      const res = await request(app)
        .get(`/api/games/${gameId}/script`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Test Game');
      expect(res.body.scriptCode).toContain('class Game extends BaseGame');
    });

    test('should deny access to regular user', async () => {
      const res = await request(app)
        .get(`/api/games/${gameId}/script`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    test('should return 404 for non-existent game', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/games/${fakeId}/script`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/games/:id/script/validate', () => {
    test('should validate correct script', async () => {
      const res = await request(app)
        .post(`/api/games/${gameId}/script/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          scriptCode: `
            class Game extends BaseGame {
              load(config) { this.state = {}; }
              handleAction(action, id) { return true; }
            }
          `
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.valid).toBe(true);
    });

    test('should reject script without Game class', async () => {
      const res = await request(app)
        .post(`/api/games/${gameId}/script/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ scriptCode: 'const x = 5;' });

      expect(res.statusCode).toBe(200);
      expect(res.body.valid).toBe(false);
      expect(res.body.error).toContain('Game class');
    });

    test('should reject script not extending BaseGame', async () => {
      const res = await request(app)
        .post(`/api/games/${gameId}/script/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ scriptCode: 'class Game { load() {} }' });

      expect(res.statusCode).toBe(200);
      expect(res.body.valid).toBe(false);
      expect(res.body.error).toContain('extend BaseGame');
    });

    test('should reject dangerous patterns - require', async () => {
      const res = await request(app)
        .post(`/api/games/${gameId}/script/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ scriptCode: 'const fs = require("fs"); class Game extends BaseGame {}' });

      expect(res.statusCode).toBe(200);
      expect(res.body.valid).toBe(false);
      expect(res.body.error).toContain('require');
    });

    test('should reject dangerous patterns - eval', async () => {
      const res = await request(app)
        .post(`/api/games/${gameId}/script/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ scriptCode: 'eval("bad"); class Game extends BaseGame {}' });

      expect(res.statusCode).toBe(200);
      expect(res.body.valid).toBe(false);
      expect(res.body.error).toContain('eval');
    });

    test('should reject dangerous patterns - process', async () => {
      const res = await request(app)
        .post(`/api/games/${gameId}/script/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ scriptCode: 'process.exit(); class Game extends BaseGame {}' });

      expect(res.statusCode).toBe(200);
      expect(res.body.valid).toBe(false);
      expect(res.body.error).toContain('process');
    });

    test('should reject script with syntax errors', async () => {
      const res = await request(app)
        .post(`/api/games/${gameId}/script/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ scriptCode: 'class Game extends BaseGame { invalid syntax here {{{' });

      expect(res.statusCode).toBe(200);
      expect(res.body.valid).toBe(false);
      expect(res.body.error).toContain('Syntax error');
    });
  });

  describe('PUT /api/games/:id/script', () => {
    test('should update game script for admin', async () => {
      const newScript = 'class Game extends BaseGame { load() { this.state = { updated: true }; } }';
      
      const res = await request(app)
        .put(`/api/games/${gameId}/script`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ scriptCode: newScript });

      expect(res.statusCode).toBe(200);
      expect(res.body.scriptCode).toBe(newScript);
      expect(res.body.message).toBe('Script saved successfully');

      // Verify it was saved
      const check = await Game.findById(gameId);
      expect(check.scriptCode).toBe(newScript);
    });

    test('should deny access to regular user', async () => {
      const res = await request(app)
        .put(`/api/games/${gameId}/script`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ scriptCode: 'new code' });

      expect(res.statusCode).toBe(403);
    });
  });
});
