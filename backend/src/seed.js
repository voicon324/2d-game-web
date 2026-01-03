import 'dotenv/config';
import mongoose from 'mongoose';
import Game from './models/Game.js';
import User from './models/User.js';
import Match from './models/Match.js';
import Tournament from './models/Tournament.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/game2d?authSource=admin';

const games = [
  {
    name: 'Cờ Caro',
    slug: 'caro',
    description: 'Trò chơi Caro (Gomoku) - Đặt 5 quân liên tiếp để thắng!',
    type: 'turn-based',
    minPlayers: 2,
    maxPlayers: 2,
    thumbnail: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400&q=80',
    config: {
      live: false,
      turnTimeout: 30000,
      boardSize: 15,
      winLength: 5,
      boardWidth: 640,
      boardHeight: 640
    }
  },
  {
    name: 'Tank Battle',
    slug: 'tank',
    description: 'Trò chơi bắn xe tăng realtime - Tiêu diệt đối thủ để chiến thắng!',
    type: 'real-time',
    minPlayers: 2,
    maxPlayers: 2,
    config: {
      live: true,
      timePerStep: 16,
      boardWidth: 800,
      boardHeight: 600
    }
  },
  {
    name: 'Tic Tac Toe',
    slug: 'tictactoe',
    description: 'Cờ Caro mini 3x3 - Dành cho người thích sự nhanh gọn!',
    type: 'turn-based',
    minPlayers: 2,
    maxPlayers: 2,
    thumbnail: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=400&q=80',
    config: {
      live: false,
      turnTimeout: 15000,
      boardSize: 3,
      winLength: 3
    }
  },
  {
    name: 'Connect 4',
    slug: 'connect4',
    description: 'Xếp 4 quân liên tiếp theo chiều dọc, ngang hoặc chéo. Có yếu tố trọng lực!',
    type: 'turn-based',
    minPlayers: 2,
    maxPlayers: 2,
    thumbnail: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&q=80',
    config: {
      live: false,
      turnTimeout: 30000,
      rows: 6,
      cols: 7,
      winLength: 4
    }
  },
  {
    name: 'Candy Rush',
    slug: 'match3',
    description: 'Xếp 3 viên kẹo cùng màu để ghi điểm! Ai nhiều điểm hơn sẽ thắng.',
    type: 'turn-based', // Or real-time? Plan says turn-based but commonly solo/versus. BaseGame supports turn.
    minPlayers: 2,
    maxPlayers: 2,
    thumbnail: 'https://images.unsplash.com/photo-1582226625376-b5a48643e41c?w=400&q=80',
    config: {
      live: false,
      turnTimeout: 60000,
      size: 8
    }
  },
  {
    name: 'Memory Chess',
    slug: 'memory',
    description: 'Lật hình tìm cặp giống nhau. Kiểm tra trí nhớ của bạn!',
    type: 'turn-based',
    minPlayers: 2,
    maxPlayers: 2,
    thumbnail: 'https://images.unsplash.com/photo-1630948958742-5f69be398b72?w=400&q=80',
    config: {
      live: false,
      turnTimeout: 20000,
      boardSize: 6
    }
  },
  {
    name: 'Free Drawing',
    slug: 'drawing',
    description: 'Vẽ tự do cùng bạn bè! Sáng tạo không giới hạn.',
    type: 'real-time',
    minPlayers: 1, // Can play alone
    maxPlayers: 10,
    thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80',
    config: {
      live: true,
      boardSize: 32
    }
  },
  {
    name: 'Snake',
    slug: 'snake',
    description: 'Rắn săn mồi cổ điển! Ăn mồi để lớn lên, tránh đâm vào đuôi.',
    type: 'real-time',
    minPlayers: 1,
    maxPlayers: 4,
    thumbnail: 'https://images.unsplash.com/photo-1628277613967-6ab58cf56736?w=400&q=80',
    config: {
      live: true,
      timePerStep: 150,
      boardSize: 20
    }
  }
];

const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@game2d.com',
    password: 'admin123',
    role: 'admin',
    stats: { gamesPlayed: 100, gamesWon: 80, gamesLost: 10, gamesDraw: 10 }
  },
  {
    username: 'MagnusC',
    email: 'magnus@chess.com',
    password: 'password123',
    stats: { gamesPlayed: 1000, gamesWon: 900, gamesLost: 50, gamesDraw: 50 }
  },
  {
    username: 'HikaruN',
    email: 'hikaru@chess.com',
    password: 'password123',
    stats: { gamesPlayed: 950, gamesWon: 850, gamesLost: 60, gamesDraw: 40 }
  },
  {
    username: 'GamerPro',
    email: 'gamer@test.com',
    password: 'password123',
    stats: { gamesPlayed: 50, gamesWon: 25, gamesLost: 25, gamesDraw: 0 }
  },
  {
    username: 'Newbie123',
    email: 'newbie@test.com',
    password: 'password123',
    stats: { gamesPlayed: 5, gamesWon: 1, gamesLost: 4, gamesDraw: 0 }
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // Clear existing data? optional, lets iterate differently
    
    // Create Users
    console.log('Seeding users...');
    // --- Helper Functions ---
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const generateRandomUser = (i) => ({
      username: `user_${i}_${randomInt(1000, 9999)}`,
      email: `user${i}@example.com`,
      password: 'password123',
      role: 'user',
      stats: {
        gamesPlayed: randomInt(10, 200),
        gamesWon: randomInt(0, 100),
        gamesLost: randomInt(0, 50),
        gamesDraw: randomInt(0, 20)
      }
    });

    // --- Create Users ---
    console.log('Seeding users...');
    const createdUsers = [];
    
    // Core users
    for (const userData of sampleUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
        console.log(`Created core user: ${user.username}`);
      }
      createdUsers.push(user);
    }
    
    // Random users
    const TARGET_USER_COUNT = 25;
    for (let i = 1; i <= TARGET_USER_COUNT; i++) {
        const fakeUser = generateRandomUser(i);
        // unique email check
        let user = await User.findOne({ email: fakeUser.email });
        if (!user) {
            user = await User.create(fakeUser);
            // console.log(`Created random user: ${user.username}`);
        }
        createdUsers.push(user);
    }
    console.log(`Total users available: ${createdUsers.length}`);

    // --- Create Friendships ---
    console.log('Seeding friendships...');
    const admin = createdUsers[0];
    for (let i = 1; i < 10; i++) { // Admin befriends first 10 people
        const friend = createdUsers[i];
        if (friend && !admin.friends.includes(friend._id)) {
            admin.friends.push(friend._id);
            friend.friends.push(admin._id);
            await friend.save();
        }
    }
    await admin.save();
    console.log(`Admin now has ${admin.friends.length} friends`);


    // --- Create Games ---
    console.log('Seeding games...');
    const createdGames = [];
    for (const gameData of games) {
      let game = await Game.findOne({ slug: gameData.slug });
      if (!game) {
        game = await Game.create({
          ...gameData,
          createdBy: createdUsers[0]._id
        });
        console.log(`Created game: ${game.name}`);
      } else {
        game.config = gameData.config;
        game.thumbnail = gameData.thumbnail;
        await game.save();
      }
      createdGames.push(game);
    }
    
    // --- Create Tournaments ---
    console.log('Seeding tournaments...');
    const caroGame = createdGames.find(g => g.slug === 'caro');
    const tankGame = createdGames.find(g => g.slug === 'tank');

    if (caroGame) {
      // 1. Active Tournament
      const activeTourney = {
          name: 'Grand Winter Championship',
          game: caroGame._id,
          status: 'active',
          prize: '$5,000',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdBy: admin._id,
          participants: createdUsers.slice(1, 16).map(u => ({ user: u._id, joinedAt: new Date() }))
      };
      
      // 2. Upcoming Tournament
      const upcomingTourney = {
          name: 'Spring Blitz 2026',
          game: caroGame._id,
          status: 'upcoming',
          prize: '$1,000',
          startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          createdBy: admin._id,
          participants: createdUsers.slice(5, 10).map(u => ({ user: u._id }))
      };

      // 3. Completed Tournament
      const completedTourney = {
          name: 'Alpha Tester Cup',
          game: caroGame._id,
          status: 'completed',
          prize: '$50',
          startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          createdBy: admin._id,
          winner: createdUsers[1]._id,
          participants: createdUsers.slice(1, 8).map(u => ({ user: u._id }))
      };

      const tournaments = [activeTourney, upcomingTourney, completedTourney];
      
      for (const tData of tournaments) {
        const existing = await Tournament.findOne({ name: tData.name });
        if (!existing) {
          await Tournament.create(tData);
          console.log(`Created tournament: ${tData.name}`);
        }
      }
    }

    // --- Create Matches ---
    console.log('Seeding matches...');
    // 1. Live Match (for Spectate)
    if (caroGame && createdUsers.length > 2) {
       const p1 = createdUsers[1];
       const p2 = createdUsers[2];
       
       const liveMatch = await Match.findOne({ status: 'playing', 'players.user': p1._id });
       if (!liveMatch) {
         await Match.create({
           game: caroGame._id,
           roomCode: 'LIVE01',
           players: [
             { user: p1._id, isReady: true },
             { user: p2._id, isReady: true }
           ],
           status: 'playing',
           startedAt: new Date(),
           currentTurn: 5
         });
         console.log('Created live match: LIVE01');
       }
    }

    // 2. Recent History (for Profile/Replays)
    // Create 10 completed matches for random users
    const recentMatchesCount = await Match.countDocuments({ status: 'finished' });
    if (recentMatchesCount < 10 && caroGame) {
        for(let i=0; i<10; i++) {
            const playerA = randomItem(createdUsers);
            const playerB = randomItem(createdUsers);
            if (playerA === playerB) continue;

            await Match.create({
                game: caroGame._id,
                roomCode: `HIST${i}`,
                players: [
                    { user: playerA._id, isReady: true },
                    { user: playerB._id, isReady: true }
                ],
                status: 'finished',
                startedAt: new Date(Date.now() - 1000000 * (i+1)),
                endedAt: new Date(Date.now() - 900000 * (i+1)),
                result: {
                    winner: playerA._id,
                    reason: '5 in a row'
                }
            });
        }
        console.log('Created 10+ historical matches');
    }


    console.log('\n✅ Seed completed!');
    
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
