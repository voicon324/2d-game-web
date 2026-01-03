import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

/**
 * Custom hook for WebSocket game connection
 * Uses correct event names that match backend gameHandler.js
 */
export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  
  const socketRef = useRef(null);
  
  // Initialize socket connection
  useEffect(() => {
    // Get token from localStorage for authentication
    const token = localStorage.getItem('token');
    
    socketRef.current = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      auth: { token }, // Pass JWT token for backend auth
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    const socket = socketRef.current;
    
    socket.on('connect', () => {
      console.log('Connected to game server:', socket.id);
      setIsConnected(true);
      setError(null);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Disconnected from game server:', reason);
      setIsConnected(false);
    });
    
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setError(err.message);
      setIsConnected(false);
    });
    
    // Room updated event (matches backend 'room:updated')
    socket.on('room:updated', (data) => {
      console.log('Room updated:', data);
      if (data.match) {
        setRoomInfo({
          roomCode: data.match.roomCode,
          status: data.match.status,
          players: data.match.players || data.players,
          game: data.match.game
        });
      }
    });
    
    // Game state event (matches backend 'game:state')
    socket.on('game:state', ({ state }) => {
      console.log('Game state update:', state);
      setGameState(state);
    });
    
    // Game started event (matches backend 'game:start')
    socket.on('game:start', ({ match, state }) => {
      console.log('Game started:', match);
      setIsGameOver(false);
      setGameResult(null);
      setGameState(state);
      if (match) {
        setRoomInfo(prev => ({ ...prev, status: match.status }));
      }
    });
    
    // Game end event (matches backend 'game:end')
    socket.on('game:end', ({ result, match }) => {
      console.log('Game ended:', result);
      setIsGameOver(true);
      setGameResult(result);
      if (match) {
        setRoomInfo(prev => ({ ...prev, status: match.status }));
      }
    });
    
    // Error event
    socket.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err.message);
    });
    
    // Invalid action event (matches backend 'game:invalid_action')
    socket.on('game:invalid_action', ({ error: actionError }) => {
      console.error('Invalid action:', actionError);
      setError(actionError);
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);
  
  // Connect to server
  const connect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      // Update token before connecting
      const token = localStorage.getItem('token');
      socketRef.current.auth = { token };
      socketRef.current.connect();
    }
  }, []);
  
  // Disconnect from server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);
  
  // Join a game room (matches backend 'room:join')
  const joinRoom = useCallback((roomCode) => {
    if (socketRef.current) {
      socketRef.current.emit('room:join', { roomCode });
    }
  }, []);
  
  // Leave room (matches backend 'room:leave')
  const leaveRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('room:leave');
      setRoomInfo(null);
      setGameState(null);
      setIsGameOver(false);
      setGameResult(null);
    }
  }, []);
  
  // Set player ready (matches backend 'room:ready')
  const setReady = useCallback((isReady) => {
    if (socketRef.current) {
      socketRef.current.emit('room:ready', { isReady });
    }
  }, []);
  
  // Send game action (matches backend 'game:action')
  const sendAction = useCallback((action) => {
    if (socketRef.current) {
      socketRef.current.emit('game:action', { action });
      setError(null);
    }
  }, []);
  
  // Spectate a game (matches backend 'room:spectate')
  const spectate = useCallback((roomCode) => {
    if (socketRef.current) {
      socketRef.current.emit('room:spectate', { roomCode });
    }
  }, []);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    isConnected,
    roomInfo,
    gameState,
    error,
    isGameOver,
    gameResult,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    setReady,
    sendAction,
    spectate,
    clearError
  };
}

export default useWebSocket;
