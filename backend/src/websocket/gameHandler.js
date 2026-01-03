import Match from '../models/Match.js';
import Game from '../models/Game.js';
import User from '../models/User.js';
import GameLoop from '../engine/GameLoop.js';
import CaroGame from '../games/CaroGame.js';
import TankGame from '../games/TankGame.js';
import jwt from 'jsonwebtoken';

// Active game sessions
const activeGames = new Map();

// Game class registry
const gameRegistry = {
  'caro': CaroGame,
  'tank': TankGame
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
          io.to(`room:${socket.currentRoom}`).emit('room:updated', {
            match: match.toObject()
          });
          
          // Check if all players ready to start game
          const allReady = match.players.every(p => p.isReady);
          const enoughPlayers = match.players.length >= 2;
          
          if (allReady && enoughPlayers && match.status === 'waiting') {
            await startGame(socket.currentRoom, io);
          }
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    /**
     * Send game action
     */
    socket.on('game:action', async ({ action }) => {
      if (!socket.currentRoom) return;
      
      const gameSession = activeGames.get(socket.currentRoom);
      if (!gameSession) {
        socket.emit('error', { message: 'Game not started' });
        return;
      }
      
      const result = gameSession.loop.handleAction(action, socket.user._id.toString());
      
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
      
      // Update match
      match.status = 'finished';
      match.finishedAt = new Date();
      match.result = {
        winner: result.winner,
        isDraw: result.isDraw || false,
        reason: result.reason
      };
      await match.save();
      
      // Update player stats
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
      
      // Notify players
      io.to(`room:${roomCode}`).emit('game:end', { result, match: match.toObject() });
      
      // Cleanup
      activeGames.delete(roomCode);
    }
  });
  
  // Store session
  activeGames.set(roomCode, {
    match,
    game: gameInstance,
    loop
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
