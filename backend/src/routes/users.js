import express from 'express';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'username avatar isOnline stats')
      .populate('friendRequests.from', 'username avatar');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/me
// @desc    Update current user profile
// @access  Private
router.put('/me', protect, async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = await User.findById(req.user._id);
    
    if (username) user.username = username;
    if (avatar) user.avatar = avatar;
    
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/friends
// @desc    Get user's friends
// @access  Private
router.get('/friends', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'username avatar isOnline stats')
      .populate('friendRequests.from', 'username avatar');
    
    res.json({
      friends: user.friends,
      requests: user.friendRequests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users/friends/:username
// @desc    Send friend request
// @access  Private
router.post('/friends/:username', protect, async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot add yourself' });
    }
    
    // Check if already friends
    if (targetUser.friends.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already friends' });
    }
    
    // Check if request already sent
    const alreadySent = targetUser.friendRequests.some(
      r => r.from.toString() === req.user._id.toString()
    );
    if (alreadySent) {
      return res.status(400).json({ message: 'Request already sent' });
    }
    
    // Add request
    targetUser.friendRequests.push({ from: req.user._id });
    await targetUser.save();
    
    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/friends/:id/accept
// @desc    Accept friend request
// @access  Private
router.put('/friends/:id/accept', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const senderId = req.params.id;
    
    const requestIndex = user.friendRequests.findIndex(
      req => req.from.toString() === senderId
    );
    
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Add to friends list for both
    user.friends.push(senderId);
    user.friendRequests.splice(requestIndex, 1);
    await user.save();
    
    await User.findByIdAndUpdate(senderId, {
      $addToSet: { friends: user._id }
    });
    
    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/users/friends/:id
// @desc    Remove friend
// @access  Private
router.delete('/friends/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const friendId = req.params.id;
    
    user.friends = user.friends.filter(id => id.toString() !== friendId);
    await user.save();
    
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: user._id }
    });
    
    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/leaderboard
// @desc    Get leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const users = await User.find()
      .select('username avatar stats')
      .sort({ 'stats.gamesWon': -1 })
      .limit(parseInt(limit));
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/online
// @desc    Get online users
// @access  Private
router.get('/online', protect, async (req, res) => {
  try {
    const users = await User.find({ isOnline: true })
      .select('username avatar')
      .limit(100);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users (Admin only)
// @desc    Get all users
// @access  Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments();
    
    res.json({
      users,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
