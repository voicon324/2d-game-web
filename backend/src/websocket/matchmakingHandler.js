import Matchmaking from '../models/Matchmaking.js';
import Match from '../models/Match.js';
import Game from '../models/Game.js';
import User from '../models/User.js';

// Active matchmaking intervals per game
const matchmakingLoops = new Map();

// ELO constants
const K_FACTOR = 32;
const INITIAL_RATING_RANGE = 200;
const RANGE_EXPANSION_RATE = 50; // Expand range by 50 every 10 seconds
const MATCH_CHECK_INTERVAL = 3000; // Check for matches every 3 seconds

/**
 * Calculate expected score based on ELO ratings
 */
function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate new ELO rating after a game
 * @param {number} rating - Current rating
 * @param {number} opponentRating - Opponent's rating
 * @param {number} score - 1 for win, 0 for loss, 0.5 for draw
 */
export function calculateNewRating(rating, opponentRating, score) {
  const expected = expectedScore(rating, opponentRating);
  return Math.round(rating + K_FACTOR * (score - expected));
}

/**
 * Initialize matchmaking WebSocket handlers
 */
export function initMatchmakingHandlers(io) {
  io.on('connection', (socket) => {
    // Join matchmaking queue
    socket.on('matchmaking:join', async (data) => {
      try {
        const { gameSlug, userId } = data;
        
        if (!gameSlug || !userId) {
          socket.emit('matchmaking:error', { message: 'Missing required data' });
          return;
        }

        // Get user and their rating
        const user = await User.findById(userId);
        if (!user) {
          socket.emit('matchmaking:error', { message: 'User not found' });
          return;
        }

        const gameRating = user.ratings?.get(gameSlug)?.rating || 1000;

        // Check if already in queue
        const existing = await Matchmaking.findOne({
          user: userId,
          status: 'searching'
        });

        if (existing) {
          socket.emit('matchmaking:error', { message: 'Already in queue' });
          return;
        }

        // Create queue entry
        const entry = await Matchmaking.create({
          user: userId,
          gameSlug,
          socketId: socket.id,
          rating: gameRating,
          status: 'searching'
        });

        // Join game-specific room for updates
        socket.join(`matchmaking:${gameSlug}`);

        socket.emit('matchmaking:joined', {
          queueId: entry._id,
          rating: gameRating,
          message: 'Joined matchmaking queue'
        });

        // Start matchmaking loop for this game if not already running
        startMatchmakingLoop(io, gameSlug);

      } catch (error) {
        console.error('Matchmaking join error:', error);
        socket.emit('matchmaking:error', { message: error.message });
      }
    });

    // Leave matchmaking queue
    socket.on('matchmaking:leave', async (data) => {
      try {
        const { userId } = data;
        
        await Matchmaking.updateMany(
          { user: userId, status: 'searching' },
          { status: 'cancelled' }
        );

        socket.emit('matchmaking:left', { message: 'Left queue' });

      } catch (error) {
        socket.emit('matchmaking:error', { message: error.message });
      }
    });

    // Handle disconnect - remove from queue
    socket.on('disconnect', async () => {
      try {
        await Matchmaking.updateMany(
          { socketId: socket.id, status: 'searching' },
          { status: 'cancelled' }
        );
      } catch (error) {
        console.error('Error removing from queue on disconnect:', error);
      }
    });
  });
}

/**
 * Start matchmaking loop for a specific game
 */
function startMatchmakingLoop(io, gameSlug) {
  if (matchmakingLoops.has(gameSlug)) {
    return; // Already running
  }

  const loopId = setInterval(async () => {
    try {
      await findMatches(io, gameSlug);
    } catch (error) {
      console.error(`Matchmaking error for ${gameSlug}:`, error);
    }
  }, MATCH_CHECK_INTERVAL);

  matchmakingLoops.set(gameSlug, loopId);
}

/**
 * Find and create matches for waiting players
 */
async function findMatches(io, gameSlug) {
  // Get all searching players sorted by queue time
  const queue = await Matchmaking.find({
    gameSlug,
    status: 'searching'
  }).sort({ queuedAt: 1 }).populate('user', 'username avatar');

  if (queue.length < 2) {
    return; // Need at least 2 players
  }

  const matched = new Set();

  for (let i = 0; i < queue.length; i++) {
    if (matched.has(queue[i]._id.toString())) continue;

    const player1 = queue[i];
    const waitTime = Date.now() - player1.queuedAt.getTime();
    
    // Expand rating range based on wait time
    const ratingRange = INITIAL_RATING_RANGE + 
      Math.floor(waitTime / 10000) * RANGE_EXPANSION_RATE;

    // Find best match for this player
    for (let j = i + 1; j < queue.length; j++) {
      if (matched.has(queue[j]._id.toString())) continue;

      const player2 = queue[j];
      const ratingDiff = Math.abs(player1.rating - player2.rating);

      if (ratingDiff <= ratingRange) {
        // Match found!
        matched.add(player1._id.toString());
        matched.add(player2._id.toString());

        await createMatchFromQueue(io, gameSlug, player1, player2);
        break;
      }
    }
  }
}

/**
 * Create a match from two queued players
 */
async function createMatchFromQueue(io, gameSlug, entry1, entry2) {
  try {
    // Get game
    const game = await Game.findOne({ slug: gameSlug });
    if (!game) return;

    // Generate room code
    let roomCode;
    let isUnique = false;
    while (!isUnique) {
      roomCode = Match.generateRoomCode();
      const existing = await Match.findOne({ roomCode });
      if (!existing) isUnique = true;
    }

    // Create match
    const match = await Match.create({
      game: game._id,
      roomCode,
      players: [
        { user: entry1.user._id, isReady: true },
        { user: entry2.user._id, isReady: true }
      ],
      status: 'waiting'
    });

    // Update queue entries
    await Matchmaking.updateMany(
      { _id: { $in: [entry1._id, entry2._id] } },
      { 
        status: 'matched',
        matchedAt: new Date(),
        matchRoomCode: roomCode
      }
    );

    // Notify both players
    const matchData = {
      roomCode,
      gameSlug,
      matchId: match._id,
      players: [
        { id: entry1.user._id, username: entry1.user.username, rating: entry1.rating },
        { id: entry2.user._id, username: entry2.user.username, rating: entry2.rating }
      ]
    };

    io.to(entry1.socketId).emit('matchmaking:found', matchData);
    io.to(entry2.socketId).emit('matchmaking:found', matchData);

    console.log(`Match created: ${entry1.user.username} vs ${entry2.user.username} (Room: ${roomCode})`);

  } catch (error) {
    console.error('Error creating match:', error);
  }
}

/**
 * Update ratings after a game ends
 */
export async function updateRatingsAfterGame(winnerId, loserId, gameSlug, isDraw = false) {
  try {
    const winner = await User.findById(winnerId);
    const loser = await User.findById(loserId);

    if (!winner || !loser) return;

    const winnerRating = winner.ratings?.get(gameSlug)?.rating || 1000;
    const loserRating = loser.ratings?.get(gameSlug)?.rating || 1000;

    let newWinnerRating, newLoserRating;
    
    if (isDraw) {
      newWinnerRating = calculateNewRating(winnerRating, loserRating, 0.5);
      newLoserRating = calculateNewRating(loserRating, winnerRating, 0.5);
    } else {
      newWinnerRating = calculateNewRating(winnerRating, loserRating, 1);
      newLoserRating = calculateNewRating(loserRating, winnerRating, 0);
    }

    // Update winner
    const winnerStats = winner.ratings?.get(gameSlug) || { rating: 1000, gamesPlayed: 0, wins: 0, losses: 0 };
    winnerStats.rating = newWinnerRating;
    winnerStats.gamesPlayed++;
    if (!isDraw) winnerStats.wins++;
    winner.ratings.set(gameSlug, winnerStats);
    await winner.save();

    // Update loser
    const loserStats = loser.ratings?.get(gameSlug) || { rating: 1000, gamesPlayed: 0, wins: 0, losses: 0 };
    loserStats.rating = newLoserRating;
    loserStats.gamesPlayed++;
    if (!isDraw) loserStats.losses++;
    loser.ratings.set(gameSlug, loserStats);
    await loser.save();

    console.log(`Ratings updated: ${winner.username} ${winnerRating} -> ${newWinnerRating}, ${loser.username} ${loserRating} -> ${newLoserRating}`);

  } catch (error) {
    console.error('Error updating ratings:', error);
  }
}

export default { initMatchmakingHandlers, updateRatingsAfterGame, calculateNewRating };
