import express from 'express';
import Matchmaking from '../models/Matchmaking.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/matchmaking/status
// @desc    Get current matchmaking status for user
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const entry = await Matchmaking.findOne({
      user: req.user._id,
      status: 'searching'
    });
    
    if (!entry) {
      return res.json({ inQueue: false });
    }
    
    res.json({
      inQueue: true,
      gameSlug: entry.gameSlug,
      rating: entry.rating,
      queuedAt: entry.queuedAt,
      waitTime: Date.now() - entry.queuedAt.getTime()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/matchmaking/join
// @desc    Join matchmaking queue
// @access  Private
router.post('/join', protect, async (req, res) => {
  try {
    const { gameSlug, socketId } = req.body;
    
    if (!gameSlug) {
      return res.status(400).json({ message: 'Game slug is required' });
    }
    
    if (!socketId) {
      return res.status(400).json({ message: 'Socket ID is required' });
    }
    
    // Check if already in queue
    const existing = await Matchmaking.findOne({
      user: req.user._id,
      status: 'searching'
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Already in matchmaking queue' });
    }
    
    // Get user's rating for this game
    const user = await User.findById(req.user._id);
    const gameRating = user.ratings?.get(gameSlug)?.rating || 1000;
    
    // Create queue entry
    const entry = await Matchmaking.create({
      user: req.user._id,
      gameSlug,
      socketId,
      rating: gameRating,
      status: 'searching'
    });
    
    res.status(201).json({
      message: 'Joined matchmaking queue',
      queueId: entry._id,
      rating: gameRating
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/matchmaking/leave
// @desc    Leave matchmaking queue
// @access  Private
router.delete('/leave', protect, async (req, res) => {
  try {
    const result = await Matchmaking.updateMany(
      { user: req.user._id, status: 'searching' },
      { status: 'cancelled' }
    );
    
    res.json({
      message: 'Left matchmaking queue',
      cancelled: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/matchmaking/stats
// @desc    Get queue statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = await Matchmaking.aggregate([
      { $match: { status: 'searching' } },
      { $group: { _id: '$gameSlug', count: { $sum: 1 } } }
    ]);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
