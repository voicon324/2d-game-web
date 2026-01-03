import mongoose from 'mongoose';

/**
 * MatchmakingQueue - Stores players waiting for matchmaking
 */
const matchmakingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameSlug: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 1000 // Starting ELO
  },
  status: {
    type: String,
    enum: ['searching', 'matched', 'cancelled', 'expired'],
    default: 'searching'
  },
  socketId: {
    type: String,
    required: true
  },
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  matchRoomCode: {
    type: String,
    default: null
  },
  queuedAt: {
    type: Date,
    default: Date.now
  },
  matchedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient matchmaking queries
matchmakingSchema.index({ gameSlug: 1, status: 1, rating: 1 });
matchmakingSchema.index({ user: 1, status: 1 });

// Remove old queue entries after 5 minutes
matchmakingSchema.index({ queuedAt: 1 }, { expireAfterSeconds: 300 });

const Matchmaking = mongoose.model('Matchmaking', matchmakingSchema);
export default Matchmaking;
