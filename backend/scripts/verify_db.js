import 'dotenv/config';
import mongoose from 'mongoose';
import Game from '../src/models/Game.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/game2d?authSource=admin';

async function verify() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const games = await Game.find({});
    console.log('Games found:', games.length);
    games.forEach(g => {
        console.log(`- [${g.slug}] ${g.name} (ID: ${g._id}, Active: ${g.isActive})`);
    });
    
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

verify();
