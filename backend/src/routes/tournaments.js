import express from 'express';
import Tournament from '../models/Tournament.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/tournaments
// @desc    Get all tournaments
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status.toLowerCase();
    }
    
    const tournaments = await Tournament.find(filter)
      .populate('game', 'name slug')
      .populate('winner', 'username avatar')
      .sort({ startDate: -1 });
    
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/tournaments/:id
// @desc    Get tournament by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('game', 'name slug')
      .populate('participants.user', 'username avatar')
      .populate('winner', 'username avatar');
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tournaments/:id/join
// @desc    Join a tournament
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    if (tournament.status === 'completed') {
      return res.status(400).json({ message: 'Tournament has ended' });
    }
    
    if (tournament.participants.length >= tournament.maxParticipants) {
      return res.status(400).json({ message: 'Tournament is full' });
    }
    
    // Check if already joined
    const alreadyJoined = tournament.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );
    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already joined' });
    }
    
    tournament.participants.push({ user: req.user._id });
    await tournament.save();
    
    await tournament.populate('participants.user', 'username avatar');
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tournaments (Admin only)
// @desc    Create a tournament
// @access  Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, game, description, prize, maxParticipants, startDate, endDate } = req.body;
    
    const tournament = await Tournament.create({
      name,
      game,
      description,
      prize,
      maxParticipants,
      startDate,
      endDate,
      createdBy: req.user._id
    });
    
    res.status(201).json(tournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
