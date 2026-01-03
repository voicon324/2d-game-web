import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/index.js';
import User from '../src/models/User.js';
import Game from '../src/models/Game.js';
import Match from '../src/models/Match.js';
import Replay from '../src/models/Replay.js';

describe('Replays API', () => {
  let token;
  let userId;
  let gameId;
  let matchId;
  let replayId;

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
    await Replay.deleteMany({});

    const user = await User.create({
      username: 'replaytest',
      email: 'replay@test.com',
      password: 'password123'
    });
    userId = user._id;

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'replay@test.com', password: 'password123' });
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

    const match = await Match.create({
      game: gameId,
      roomCode: 'TEST01',
      players: [{ user: userId }],
      status: 'finished'
    });
    matchId = match._id;

    const replay = await Replay.create({
      match: matchId,
      game: gameId,
      gameSlug: 'caro',
      players: [{
        id: userId.toString(),
        username: 'replaytest',
        avatar: null
      }],
      initialState: { board: [] },
      actions: [
        { playerId: userId.toString(), action: { type: 'PLACE', x: 7, y: 7 }, timestamp: 1000, resultState: { board: [[7, 7]] } },
        { playerId: userId.toString(), action: { type: 'PLACE', x: 7, y: 8 }, timestamp: 2500, resultState: { board: [[7, 7], [7, 8]] } }
      ],
      result: { winnerId: userId.toString(), reason: 'Five in a row', isDraw: false },
      duration: 30000
    });
    replayId = replay._id;
  });

  describe('GET /api/replays/match/:matchId', () => {
    test('should get replay by match ID', async () => {
      const res = await request(app)
        .get(`/api/replays/match/${matchId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.match.toString()).toBe(matchId.toString());
      expect(res.body.gameSlug).toBe('caro');
      expect(res.body.players).toHaveLength(1);
      expect(res.body.actions).toHaveLength(2);
      expect(res.body.duration).toBe(30000);
    });

    test('should return 404 for non-existent match', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/replays/match/${fakeId}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/replays/:id', () => {
    test('should get replay by ID', async () => {
      const res = await request(app)
        .get(`/api/replays/${replayId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body._id.toString()).toBe(replayId.toString());
      expect(res.body.initialState).toEqual({ board: [] });
    });

    test('should return 404 for non-existent replay', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/replays/${fakeId}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/replays/user/:userId', () => {
    test('should get replays for a user', async () => {
      const res = await request(app)
        .get(`/api/replays/user/${userId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].gameSlug).toBe('caro');
    });

    test('should return empty array for user with no replays', async () => {
      const newUser = await User.create({
        username: 'noreplays',
        email: 'no@replays.com',
        password: 'password123'
      });

      const res = await request(app)
        .get(`/api/replays/user/${newUser._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });
});

describe('Replay Model', () => {
  test('should store actions with timestamps', async () => {
    const MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://admin:password123@localhost:27017/game2d_test?authSource=admin';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }

    const replay = await Replay.create({
      match: new mongoose.Types.ObjectId(),
      game: new mongoose.Types.ObjectId(),
      gameSlug: 'tictactoe',
      players: [{ id: 'p1', username: 'Player1' }],
      initialState: { grid: Array(9).fill(null) },
      actions: [
        { playerId: 'p1', action: { index: 4 }, timestamp: 500, resultState: { grid: [null, null, null, null, 'X'] } }
      ],
      duration: 15000
    });

    expect(replay.actions[0].timestamp).toBe(500);
    expect(replay.actions[0].resultState.grid[4]).toBe('X');

    await mongoose.disconnect();
  });
});
