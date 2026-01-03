import Match from '../models/Match.js';
import Game from '../models/Game.js';
import User from '../models/User.js';
import Replay from '../models/Replay.js';
import GameLoop from '../engine/GameLoop.js';
import CaroGame from '../games/CaroGame.js';
import TankGame from '../games/TankGame.js';
import TicTacToe from '../games/TicTacToe.js';
import Connect4 from '../games/Connect4.js';
import Match3 from '../games/Match3.js';
import Memory from '../games/Memory.js';
import Drawing from '../games/Drawing.js';
import SnakeGame from '../games/SnakeGame.js';
import { initMatchmakingHandlers, updateRatingsAfterGame } from './matchmakingHandler.js';
import jwt from 'jsonwebtoken';

// Active game sessions with replay data
const activeGames = new Map();

// Game class registry
const gameRegistry = {
  'caro': CaroGame,
  'tank': TankGame,
  'tictactoe': TicTacToe,
  'connect4': Connect4,
  'match3': Match3,
  'memory': Memory,
  'drawing': Drawing,
  'snake': SnakeGame
};

/**
 * Initialize WebSocket handlers
 */
export const initSocketHandlers = (io) => {
  // Middleware: Authenticate socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);
    
    // Update user online status
    User.findByIdAndUpdate(socket.user._id, { isOnline: true }).exec();
    
    // Join user's personal room
    socket.join(`user:${socket.user._id}`);
    
    /**
     * Join a game room
     */
    socket.on('room:join', async ({ roomCode }) => {
      try {
        const match = await Match.findOne({ roomCode })
          .populate('game')
          .populate('players.user', 'username avatar');
        
        if (!match) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        // Check if already in room
        const playerIndex = match.players.findIndex(
          p => p.user._id.toString() === socket.user._id.toString()
        );
        
        if (playerIndex === -1) {
          // Join as new player
          if (match.players.length >= match.game.maxPlayers) {
            socket.emit('error', { message: 'Room is full' });
            return;
          }
          
          match.players.push({
            user: socket.user._id,
            socketId: socket.id,
            isReady: false
          });
          await match.save();
        } else {
          // Update socket ID for existing player
          match.players[playerIndex].socketId = socket.id;
          await match.save();
        }
        
        // Join socket room
        socket.join(`room:${roomCode}`);
        socket.currentRoom = roomCode;
        
        // Notify room
        await match.populate('players.user', 'username avatar');
        // Ensure game is fully populated
        if (!match.game.slug) await match.populate('game');
        
        console.log(`Sending room update for ${match.game.slug} (${match.roomCode})`);

        io.to(`room:${roomCode}`).emit('room:updated', {
          match: match.toObject(),
          players: match.players
        });
        
        console.log(`${socket.user.username} joined room ${roomCode}`);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    /**
     * Leave a game room
     */
    socket.on('room:leave', async () => {
      if (!socket.currentRoom) return;
      
      try {
        await handleLeaveRoom(socket, io);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    /**
     * Toggle ready status
     */
    socket.on('room:ready', async ({ isReady }) => {
      if (!socket.currentRoom) return;
      
      try {
        const match = await Match.findOne({ roomCode: socket.currentRoom });
        if (!match) return;
        
        const playerIndex = match.players.findIndex(
          p => p.user.toString() === socket.user._id.toString()
        );
        
        if (playerIndex !== -1) {
          match.players[playerIndex].isReady = isReady;
          await match.save();
          
          await match.populate('players.user', 'username avatar');
          await match.populate('game');
          io.to(`room:${socket.currentRoom}`).emit('room:updated', {
            match: match.toObject()
          });
          
          // Check if all players ready to start game
          const allReady = match.players.every(p => p.isReady);
          const enoughPlayers = match.players.length >= (match.game.minPlayers || 2);
          
          if (allReady && enoughPlayers && match.status === 'waiting') {
            await startGame(socket.currentRoom, io);
          }
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    /**
     * Send game action - with replay recording
     */
    socket.on('game:action', async ({ action }) => {
      if (!socket.currentRoom) return;
      
      const gameSession = activeGames.get(socket.currentRoom);
      if (!gameSession) {
        socket.emit('error', { message: 'Game not started' });
        return;
      }
      
      const result = gameSession.loop.handleAction(action, socket.user._id.toString());
      
      if (result.success && gameSession.replayActions) {
        // Record action for replay
        const timestamp = Date.now() - gameSession.startTime;
        gameSession.replayActions.push({
          playerId: socket.user._id.toString(),
          action,
          timestamp,
          resultState: gameSession.game.getState()
        });
      }
      
      if (!result.success) {
        socket.emit('game:invalid_action', { error: result.error });
      }
    });
    
    /**
     * Spectate a game
     */
    socket.on('room:spectate', async ({ roomCode }) => {
      try {
        const match = await Match.findOne({ roomCode })
          .populate('game')
          .populate('players.user', 'username avatar');
        
        if (!match) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        // Add as spectator
        match.spectators.push({
          user: socket.user._id,
          socketId: socket.id
        });
        await match.save();
        
        socket.join(`room:${roomCode}`);
        socket.currentRoom = roomCode;
        socket.isSpectator = true;
        
        // Send current game state if game is running
        const gameSession = activeGames.get(roomCode);
        if (gameSession) {
          socket.emit('game:state', { state: gameSession.loop.getState() });
        }
        
        console.log(`${socket.user.username} spectating room ${roomCode}`);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    /**
     * Handle chat messages
     */
    socket.on('room:chat', ({ message }) => {
      // Validate user is in a room
      if (!socket.currentRoom) {
        socket.emit('error', { message: 'You must join a room to send messages' });
        console.log(`Chat rejected: ${socket.user?.username} is not in a room`);
        return;
      }
      
      // Validate message content
      if (!message || typeof message !== 'string' || !message.trim()) {
        socket.emit('error', { message: 'Message cannot be empty' });
        return;
      }
      
      // Sanitize and limit message length
      const sanitizedMessage = message.trim().slice(0, 500);
      
      const chatMsg = {
        sender: socket.user.username,
        senderId: socket.user._id.toString(),
        text: sanitizedMessage,
        timestamp: new Date().toISOString()
      };
      
      console.log(`Chat in room ${socket.currentRoom}: ${socket.user.username}: ${sanitizedMessage.slice(0, 50)}...`);
      io.to(`room:${socket.currentRoom}`).emit('room:chat', chatMsg);
    });

    /**
     * Handle disconnect
     */
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.username}`);
      
      // Update user offline status
      User.findByIdAndUpdate(socket.user._id, { 
        isOnline: false, 
        lastSeen: new Date() 
      }).exec();
      
      // Handle leaving room
      if (socket.currentRoom) {
        await handleLeaveRoom(socket, io);
      }
    });
  });
  
  // Initialize matchmaking handlers
  initMatchmakingHandlers(io);
};

/**
 * Handle player leaving room
 */
async function handleLeaveRoom(socket, io) {
  const roomCode = socket.currentRoom;
  
  const match = await Match.findOne({ roomCode });
  if (!match) return;
  
  if (socket.isSpectator) {
    // Remove spectator
    match.spectators = match.spectators.filter(
      s => s.socketId !== socket.id
    );
  } else {
    // Remove player
    match.players = match.players.filter(
      p => p.user.toString() !== socket.user._id.toString()
    );
    
    // If game is playing, handle abandonment
    if (match.status === 'playing') {
      const gameSession = activeGames.get(roomCode);
      if (gameSession) {
        gameSession.loop.stop();
        activeGames.delete(roomCode);
      }
      
      match.status = 'abandoned';
      
      // Award win to remaining player
      if (match.players.length === 1) {
        match.result = {
          winner: match.players[0].user,
          reason: 'Opponent left the game'
        };
      }
    }
    
    // If room empty, mark as abandoned
    if (match.players.length === 0) {
      match.status = 'abandoned';
    }
  }
  
  await match.save();
  socket.leave(`room:${roomCode}`);
  socket.currentRoom = null;
  
  // Notify remaining players
  await match.populate('players.user', 'username avatar');
  await match.populate('game');
  io.to(`room:${roomCode}`).emit('room:updated', {
    match: match.toObject()
  });
}

/**
 * Start a game
 */
async function startGame(roomCode, io) {
  const match = await Match.findOne({ roomCode })
    .populate('game')
    .populate('players.user', 'username avatar');
  
  if (!match || match.status !== 'waiting') return;
  
  // Get game class
  const GameClass = gameRegistry[match.game.slug];
  if (!GameClass) {
    io.to(`room:${roomCode}`).emit('error', { message: 'Game type not found' });
    return;
  }
  
  // Create game instance
  const gameInstance = new GameClass(match.game.config || {});
  gameInstance.load(match.game.config || {});
  
  // Add players to game
  match.players.forEach(p => {
    gameInstance.addPlayer({
      id: p.user._id.toString(),
      username: p.user.username,
      avatar: p.user.avatar
    });
  });
  
  // Create game loop
  const loop = new GameLoop(gameInstance, {
    tickRate: gameInstance.live ? 60 : 1,
    onStateChange: (state) => {
      io.to(`room:${roomCode}`).emit('game:state', { state });
    },
    onGameEnd: async (result) => {
      console.log(`Game ended in room ${roomCode}:`, result);
      
      const gameSession = activeGames.get(roomCode);
      const gameDuration = Date.now() - (gameSession?.startTime || Date.now());
      
      // Update match
      match.status = 'finished';
      match.finishedAt = new Date();
      match.result = {
        winner: result.winner,
        isDraw: result.isDraw || false,
        reason: result.reason
      };
      await match.save();
      
      // Save replay
      try {
        await Replay.create({
          match: match._id,
          game: match.game._id,
          gameSlug: match.game.slug,
          players: match.players.map(p => ({
            id: p.user._id.toString(),
            username: p.user.username,
            avatar: p.user.avatar
          })),
          initialState: gameSession?.initialState || {},
          actions: gameSession?.replayActions || [],
          result: {
            winnerId: result.winner,
            reason: result.reason,
            isDraw: result.isDraw || false
          },
          duration: gameDuration
        });
        console.log(`Replay saved for match ${match._id}`);
      } catch (replayError) {
        console.error('Failed to save replay:', replayError);
      }
      
      // Update player stats and ELO ratings
      for (const p of match.players) {
        const isWinner = result.winner === p.user._id.toString();
        const update = {
          $inc: { 'stats.gamesPlayed': 1 }
        };
        
        if (result.isDraw) {
          update.$inc['stats.gamesDraw'] = 1;
        } else if (isWinner) {
          update.$inc['stats.gamesWon'] = 1;
        } else {
          update.$inc['stats.gamesLost'] = 1;
        }
        
        await User.findByIdAndUpdate(p.user._id, update);
      }
      
      // Update ELO ratings for matchmaking
      if (match.players.length === 2 && !result.isDraw && result.winner) {
        const winnerId = result.winner;
        const loserId = match.players.find(p => p.user._id.toString() !== winnerId)?.user._id;
        if (loserId) {
          await updateRatingsAfterGame(winnerId, loserId.toString(), match.game.slug, result.isDraw);
        }
      }
      
      // Notify players
      io.to(`room:${roomCode}`).emit('game:end', { result, match: match.toObject() });
      
      // Cleanup
      activeGames.delete(roomCode);
    }
  });
  
  // Store session with replay data
  const initialState = gameInstance.getState();
  activeGames.set(roomCode, {
    match,
    game: gameInstance,
    loop,
    startTime: Date.now(),
    initialState,
    replayActions: []
  });
  
  // Update match status
  match.status = 'playing';
  match.startedAt = new Date();
  await match.save();
  
  // Start game loop
  loop.start();
  
  // Notify players
  io.to(`room:${roomCode}`).emit('game:start', {
    match: match.toObject(),
    state: gameInstance.getState()
  });
  
  console.log(`Game started in room ${roomCode}`);
}

export default { initSocketHandlers };
