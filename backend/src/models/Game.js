import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: null
  },
  type: {
    type: String,
    enum: ['turn-based', 'real-time'],
    required: true
  },
  minPlayers: {
    type: Number,
    default: 2,
    min: 1
  },
  maxPlayers: {
    type: Number,
    default: 2,
    min: 1
  },
  config: {
    live: { type: Boolean, default: false },
    timePerStep: { type: Number, default: 16 }, // ms per tick
    turnTimeout: { type: Number, default: 30000 }, // ms per turn (turn-based)
    boardWidth: { type: Number, default: 800 },
    boardHeight: { type: Number, default: 600 }
  },
  // The game script code (admin-written)
  scriptCode: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Game = mongoose.model('Game', gameSchema);
export default Game;
