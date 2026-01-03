import express from 'express';
import Match from '../models/Match.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/matches/live
// @desc    Get all currently playing matches (for spectate)
// @access  Public
router.get('/live', async (req, res) => {
  try {
    const matches = await Match.find({ status: 'playing' })
      .populate('game', 'name slug type')
      .populate('players.user', 'username avatar stats')
      .populate('spectators.user', 'username')
      .sort({ startedAt: -1 })
      .limit(20);
    
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/matches/recent
// @desc    Get recent finished matches
// @access  Public
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const matches = await Match.find({ status: 'finished' })
      .populate('game', 'name slug')
      .populate('players.user', 'username avatar')
      .populate('result.winner', 'username')
      .sort({ finishedAt: -1 })
      .limit(parseInt(limit));
    
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/matches/:roomCode
// @desc    Get match by room code
// @access  Public
router.get('/:roomCode', async (req, res) => {
  try {
    const match = await Match.findOne({ roomCode: req.params.roomCode })
      .populate('game', 'name slug type config')
      .populate('players.user', 'username avatar')
      .populate('spectators.user', 'username');
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
