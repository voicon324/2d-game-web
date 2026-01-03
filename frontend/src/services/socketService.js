import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  /**
   * Connect to the socket server
   * @param {string} token - JWT token for authentication
   */
  connect(token) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    return this.socket;
  }

  /**
   * Disconnect from the socket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Get the socket instance
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Join a game room
   * @param {string} roomCode - Room code to join
   */
  joinRoom(roomCode) {
    if (this.socket) {
      this.socket.emit('room:join', { roomCode });
    }
  }

  /**
   * Leave the current room
   */
  leaveRoom() {
    if (this.socket) {
      this.socket.emit('room:leave');
    }
  }

  /**
   * Set ready status
   * @param {boolean} isReady
   */
  setReady(isReady) {
    if (this.socket) {
      this.socket.emit('room:ready', { isReady });
    }
  }

  /**
   * Send a game action
   * @param {Object} action - { type, data }
   */
  sendAction(action) {
    if (this.socket) {
      this.socket.emit('game:action', { action });
    }
  }

  /**
   * Spectate a game
   * @param {string} roomCode
   */
  spectate(roomCode) {
    if (this.socket) {
      this.socket.emit('room:spectate', { roomCode });
    }
  }

  /**
   * Listen for room updates
   * @param {function} callback
   */
  onRoomUpdate(callback) {
    if (this.socket) {
      this.socket.on('room:updated', callback);
    }
  }

  /**
   * Listen for game start
   * @param {function} callback
   */
  onGameStart(callback) {
    if (this.socket) {
      this.socket.on('game:start', callback);
    }
  }

  /**
   * Listen for game state updates
   * @param {function} callback
   */
  onGameState(callback) {
    if (this.socket) {
      this.socket.on('game:state', callback);
    }
  }

  /**
   * Listen for game end
   * @param {function} callback
   */
  onGameEnd(callback) {
    if (this.socket) {
      this.socket.on('game:end', callback);
    }
  }

  /**
   * Listen for errors
   * @param {function} callback
   */
  onError(callback) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

// Singleton instance
const socketService = new SocketService();
export default socketService;
