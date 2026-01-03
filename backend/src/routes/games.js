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

// @route   GET /api/games/:id/script (Admin only)
// @desc    Get game with script code for editing
// @access  Admin
router.get('/:id/script', protect, admin, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json({
      _id: game._id,
      name: game.name,
      slug: game.slug,
      type: game.type,
      config: game.config,
      scriptCode: game.scriptCode || ''
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/games/:id/script/validate (Admin only)
// @desc    Validate a script without saving
// @access  Admin
router.post('/:id/script/validate', protect, admin, async (req, res) => {
  try {
    const { scriptCode } = req.body;
    
    if (!scriptCode) {
      return res.json({ valid: false, error: 'Script code is required' });
    }
    
    // Check for dangerous patterns
    const dangerousPatterns = [
      { pattern: /require\s*\(/, message: 'require() is not allowed' },
      { pattern: /import\s+/, message: 'import statements are not allowed' },
      { pattern: /process\./, message: 'process object is not allowed' },
      { pattern: /global\./, message: 'global object is not allowed' },
      { pattern: /eval\s*\(/, message: 'eval() is not allowed' },
      { pattern: /Function\s*\(/, message: 'Function constructor is not allowed' },
      { pattern: /\.constructor/, message: '.constructor access is not allowed' },
      { pattern: /__proto__/, message: '__proto__ access is not allowed' }
    ];
    
    for (const { pattern, message } of dangerousPatterns) {
      if (pattern.test(scriptCode)) {
        return res.json({ valid: false, error: message });
      }
    }
    
    // Check if script defines a Game class
    if (!scriptCode.includes('class Game')) {
      return res.json({ valid: false, error: 'Script must define a Game class' });
    }
    
    if (!scriptCode.includes('extends BaseGame')) {
      return res.json({ valid: false, error: 'Game class must extend BaseGame' });
    }
    
    // Try basic syntax check
    try {
      new Function(scriptCode);
      res.json({ valid: true, message: 'Script syntax is valid!' });
    } catch (syntaxError) {
      res.json({ valid: false, error: `Syntax error: ${syntaxError.message}` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/games/:id/script (Admin only)
// @desc    Update game script code
// @access  Admin
router.put('/:id/script', protect, admin, async (req, res) => {
  try {
    const { scriptCode } = req.body;
    
    const game = await Game.findByIdAndUpdate(
      req.params.id,
      { scriptCode },
      { new: true }
    );
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    res.json({
      _id: game._id,
      name: game.name,
      scriptCode: game.scriptCode,
      message: 'Script saved successfully'
    });
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
