import express from 'express';
import Replay from '../models/Replay.js';
import Match from '../models/Match.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/replays/match/:matchId
// @desc    Get replay for a specific match
// @access  Public
router.get('/match/:matchId', async (req, res) => {
  try {
    const replay = await Replay.findOne({ match: req.params.matchId })
      .populate('game', 'name slug type');
    
    if (!replay) {
      return res.status(404).json({ message: 'Replay not found' });
    }
    
    res.json(replay);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/replays/:id
// @desc    Get replay by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const replay = await Replay.findById(req.params.id)
      .populate('game', 'name slug type');
    
    if (!replay) {
      return res.status(404).json({ message: 'Replay not found' });
    }
    
    res.json(replay);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/replays/user/:userId
// @desc    Get replays for a user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const replays = await Replay.find({
      'players.id': req.params.userId
    })
    .select('match game players result duration createdAt gameSlug')
    .populate('game', 'name slug')
    .sort({ createdAt: -1 })
    .limit(20);
    
    res.json(replays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/replays/recent
// @desc    Get recent public replays
// @access  Public
router.get('/recent/:gameSlug?', async (req, res) => {
  try {
    const query = req.params.gameSlug 
      ? { gameSlug: req.params.gameSlug }
      : {};
    
    const replays = await Replay.find(query)
      .select('match game players result duration createdAt gameSlug')
      .populate('game', 'name slug')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(replays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
