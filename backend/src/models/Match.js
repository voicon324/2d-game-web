import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  roomCode: {
    type: String,
    required: true,
    unique: true
  },
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    socketId: String,
    joinedAt: { type: Date, default: Date.now },
    isReady: { type: Boolean, default: false }
  }],
  spectators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    socketId: String
  }],
  status: {
    type: String,
    enum: ['waiting', 'playing', 'finished', 'abandoned'],
    default: 'waiting'
  },
  currentTurn: {
    type: Number,
    default: 0
  },
  gameState: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  result: {
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    isDraw: { type: Boolean, default: false },
    reason: { type: String, default: '' }
  },
  startedAt: Date,
  finishedAt: Date
}, {
  timestamps: true
});

// Generate unique room code
matchSchema.statics.generateRoomCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const Match = mongoose.model('Match', matchSchema);
export default Match;
