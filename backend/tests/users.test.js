import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/index.js';
import User from '../src/models/User.js';

describe('Users API', () => {
  let token;
  let userId;
  let friendId;

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
    
    // Create Users
    const user = await User.create({
      username: 'mainuser',
      email: 'main@test.com',
      password: 'password123',
      stats: { gamesWon: 10 }
    });
    userId = user._id;

    const friend = await User.create({
      username: 'frienduser',
      email: 'friend@test.com',
      password: 'password123',
      stats: { gamesWon: 5 }
    });
    friendId = friend._id;

    await User.create({
      username: 'topuser',
      email: 'top@test.com',
      password: 'password123',
      stats: { gamesWon: 100 }
    });

    // Login Main User
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'main@test.com', password: 'password123' });
    token = res.body.token;
  });

  describe('GET /api/users/leaderboard', () => {
    test('should return users sorted by wins', async () => {
      const res = await request(app).get('/api/users/leaderboard');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(3);
      expect(res.body[0].username).toBe('topuser');
      expect(res.body[1].username).toBe('mainuser');
    });
  });

  describe('GET /api/users/me', () => {
    test('should return current user profile', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('mainuser');
    });
  });

  describe('Friend Management', () => {
    test('should send friend request', async () => {
      const friendUser = await User.findById(friendId);
      const res = await request(app)
        .post(`/api/users/friends/${friendUser.username}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      
      // Verify db state
      const friend = await User.findById(friendId);
      expect(friend.friendRequests).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ from: userId })
        ])
      );
    });
  });
});
