import express from 'express';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ 
        message: userExists.email === email 
          ? 'Email already registered' 
          : 'Username already taken' 
      });
    }
    
    // Create user
    const user = await User.create({ username, email, password });
    
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists by email OR username
    // The frontend sends 'email' field but it could be username
    const user = await User.findOne({ 
      $or: [
        { email: email }, 
        { username: email }
      ] 
    });
    
    if (user && (await user.comparePassword(password))) {
      // Update online status
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();
      
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        stats: user.stats,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid username/email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/google
// @desc    Login/Register with Google
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { sub: googleId, email, name, picture } = ticket.getPayload();
    
    // Find user by googleId or email
    let user = await User.findOne({ 
      $or: [{ googleId }, { email }] 
    });
    
    if (user) {
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        username: name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
        email,
        googleId,
        avatar: picture,
        isOnline: true,
        lastSeen: new Date()
      });
    }
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      stats: user.stats,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/facebook
// @desc    Login/Register with Facebook
// @access  Public
router.post('/facebook', async (req, res) => {
  try {
    const { accessToken, userID } = req.body;
    
    // Verify token with Facebook Graph API
    const response = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
    const { id: facebookId, name, email, picture } = response.data;
    
    if (facebookId !== userID) {
      return res.status(401).json({ message: 'Invalid Facebook user ID' });
    }
    
    // Find user by facebookId or email
    let user = await User.findOne({ 
      $or: [{ facebookId }, { email }] 
    });
    
    if (user) {
      if (!user.facebookId) user.facebookId = facebookId;
      if (!user.avatar && picture?.data?.url) user.avatar = picture.data.url;
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        username: name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
        email: email || `${facebookId}@facebook.com`,
        facebookId,
        avatar: picture?.data?.url,
        isOnline: true,
        lastSeen: new Date()
      });
    }
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      stats: user.stats,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Public
router.post('/logout', async (req, res) => {
  try {
    const { userId } = req.body;
    if (userId) {
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
