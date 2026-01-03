import mongoose from 'mongoose';

/**
 * Replay - Stores recorded game actions for playback
 */
const replaySchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
    unique: true
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  players: [{
    id: String,
    username: String,
    avatar: String
  }],
  initialState: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  actions: [{
    playerId: String,
    action: mongoose.Schema.Types.Mixed,
    timestamp: Number, // ms from game start
    resultState: mongoose.Schema.Types.Mixed
  }],
  result: {
    winnerId: String,
    reason: String,
    isDraw: { type: Boolean, default: false }
  },
  duration: {
    type: Number, // total game duration in ms
    default: 0
  },
  gameSlug: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries (match already indexed via unique: true)
replaySchema.index({ 'players.id': 1 });
replaySchema.index({ gameSlug: 1, createdAt: -1 });

const Replay = mongoose.model('Replay', replaySchema);
export default Replay;
