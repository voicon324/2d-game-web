import express from 'express';
import Game from '../models/Game.js';
import Match from '../models/Match.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/games
// @desc    Get all active games
// @access  Public
router.get('/', async (req, res) => {
  try {
    const games = await Game.find({ isActive: true })
      .select('-scriptCode')
      .sort({ name: 1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/games/:slug
// @desc    Get game by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const game = await Game.findOne({ slug: req.params.slug, isActive: true })
      .select('-scriptCode');
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/games (Admin only)
// @desc    Create a new game
// @access  Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, slug, description, type, minPlayers, maxPlayers, config, scriptCode } = req.body;
    
    const game = await Game.create({
      name,
      slug,
      description,
      type,
      minPlayers,
      maxPlayers,
      config,
      scriptCode,
      createdBy: req.user._id
    });
    
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/games/:id (Admin only)
// @desc    Update a game
// @access  Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/games/:slug/rooms
// @desc    Get active rooms for a game
// @access  Public
router.get('/:slug/rooms', async (req, res) => {
  try {
    const game = await Game.findOne({ slug: req.params.slug });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    const rooms = await Match.find({ 
      game: game._id, 
      status: 'waiting' 
    })
    .populate('players.user', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/games/:slug/rooms
// @desc    Create a new room
// @access  Private
router.post('/:slug/rooms', protect, async (req, res) => {
  try {
    const game = await Game.findOne({ slug: req.params.slug });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // Generate unique room code
    let roomCode;
    let isUnique = false;
    while (!isUnique) {
      roomCode = Match.generateRoomCode();
      const existing = await Match.findOne({ roomCode });
      if (!existing) isUnique = true;
    }
    
    const match = await Match.create({
      game: game._id,
      roomCode,
      players: [{
        user: req.user._id,
        isReady: false
      }],
      status: 'waiting'
    });
    
    await match.populate('players.user', 'username avatar');
    await match.populate('game', 'name slug type config');
    
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/games/rooms/:code/join
// @desc    Join a room
// @access  Private
router.post('/rooms/:code/join', protect, async (req, res) => {
  try {
    const match = await Match.findOne({ roomCode: req.params.code })
      .populate('game');
    
    if (!match) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    if (match.status !== 'waiting') {
      return res.status(400).json({ message: 'Game already started' });
    }
    
    if (match.players.length >= match.game.maxPlayers) {
      return res.status(400).json({ message: 'Room is full' });
    }
    
    // Check if already in room
    const alreadyJoined = match.players.some(
      p => p.user.toString() === req.user._id.toString()
    );
    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already in room' });
    }
    
    match.players.push({
      user: req.user._id,
      isReady: false
    });
    
    await match.save();
    await match.populate('players.user', 'username avatar');
    
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
