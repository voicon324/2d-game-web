import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Game from '../src/models/Game.js';
import Match from '../src/models/Match.js';

describe('Model Validation', () => {
  
  describe('User Model', () => {
    test('should be invalid if required fields are missing', () => {
      const user = new User({});
      const err = user.validateSync();
      expect(err.errors.username).toBeDefined();
      expect(err.errors.email).toBeDefined();
    });

    test('should validate correct user', () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      const err = user.validateSync();
      expect(err).toBeUndefined();
    });
  });

  describe('Game Model', () => {
    test('should be invalid if required fields are missing', () => {
      const game = new Game({});
      const err = game.validateSync();
      expect(err.errors.name).toBeDefined();
      expect(err.errors.slug).toBeDefined();
    });

    test('should validate correct game', () => {
      const game = new Game({
        name: 'Test Game',
        slug: 'test-game',
        type: 'turn-based',
        minPlayers: 2,
        maxPlayers: 2
      });
      const err = game.validateSync();
      expect(err).toBeUndefined();
    });
  });

  describe('Match Model', () => {
    test('generateRoomCode should return 6 char string', () => {
      const code = Match.generateRoomCode();
      expect(code).toHaveLength(6);
      expect(typeof code).toBe('string');
    });
  });
});
