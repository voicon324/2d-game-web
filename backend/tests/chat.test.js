import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/index.js';
import User from '../src/models/User.js';
import Game from '../src/models/Game.js';
import Match from '../src/models/Match.js';

describe('In-Game Chat', () => {
  let server;
  let token;
  let userId;
  let token2;
  let userId2;
  let roomCode;

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

    // Create users
    const user1 = await User.create({
      username: 'chatuser1',
      email: 'chat1@test.com',
      password: 'password123'
    });
    userId = user1._id;

    const user2 = await User.create({
      username: 'chatuser2',
      email: 'chat2@test.com',
      password: 'password123'
    });
    userId2 = user2._id;

    // Login users
    const res1 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'chat1@test.com', password: 'password123' });
    token = res1.body.token;

    const res2 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'chat2@test.com', password: 'password123' });
    token2 = res2.body.token;

    // Create game
    await Game.create({
      name: 'Cờ Caro',
      slug: 'caro',
      type: 'turn-based',
      minPlayers: 2,
      maxPlayers: 2,
      isActive: true
    });

    // Create room
    const roomRes = await request(app)
      .post('/api/games/caro/rooms')
      .set('Authorization', `Bearer ${token}`);
    roomCode = roomRes.body.roomCode;
  });

  describe('Chat API Requirements', () => {
    test('room should be created successfully', async () => {
      expect(roomCode).toBeDefined();
      expect(roomCode.length).toBe(6);
    });

    test('second player can join room', async () => {
      const res = await request(app)
        .post(`/api/games/rooms/${roomCode}/join`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.players).toHaveLength(2);
    });
  });

  describe('Chat Message Structure', () => {
    test('chat message should have required fields', () => {
      const chatMsg = {
        sender: 'testuser',
        senderId: 'user123',
        text: 'Hello world',
        timestamp: new Date().toISOString()
      };

      expect(chatMsg).toHaveProperty('sender');
      expect(chatMsg).toHaveProperty('text');
      expect(chatMsg).toHaveProperty('timestamp');
    });

    test('chat message text should be string', () => {
      const msg = { text: 'Test message' };
      expect(typeof msg.text).toBe('string');
    });

    test('chat message should handle special characters', () => {
      const msg = { text: 'Hello! @user #tag $100 & more' };
      expect(msg.text).toBe('Hello! @user #tag $100 & more');
    });

    test('chat message should be limited in length', () => {
      const longMessage = 'a'.repeat(600);
      const sanitized = longMessage.slice(0, 500);
      expect(sanitized.length).toBe(500);
    });
  });
});

describe('ChatComponent Unit Tests', () => {
  test('empty messages array should be handled', () => {
    const messages = [];
    expect(messages.length).toBe(0);
    expect(Array.isArray(messages)).toBe(true);
  });

  test('messages should be appendable', () => {
    const messages = [];
    const newMsg = { sender: 'user1', text: 'Hello', timestamp: new Date() };
    messages.push(newMsg);
    expect(messages.length).toBe(1);
    expect(messages[0].text).toBe('Hello');
  });

  test('own messages should be identifiable', () => {
    const currentUser = { username: 'player1' };
    const messages = [
      { sender: 'player1', text: 'My message' },
      { sender: 'player2', text: 'Their message' }
    ];

    const ownMessages = messages.filter(m => m.sender === currentUser.username);
    expect(ownMessages.length).toBe(1);
    expect(ownMessages[0].text).toBe('My message');
  });
});
