import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socketService';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [room, setRoom] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  
  const listenersInitialized = useRef(false);

  // Initialize socket listeners
  useEffect(() => {
    if (listenersInitialized.current) return;
    
    const socket = socketService.getSocket();
    if (!socket) return;
    
    listenersInitialized.current = true;

    socketService.onRoomUpdate(({ match }) => {
      setRoom(match);
    });

    socketService.onGameStart(({ match, state }) => {
      setRoom(match);
      setGameState(state);
      setIsPlaying(true);
      setGameResult(null);
    });

    socketService.onGameState(({ state }) => {
      setGameState(state);
    });

    socketService.onGameEnd(({ result, match }) => {
      setRoom(match);
      setGameResult(result);
      setIsPlaying(false);
      setIsReady(false);
    });

    socketService.onError((err) => {
      setError(err.message);
    });

    return () => {
      socketService.removeAllListeners();
      listenersInitialized.current = false;
    };
  }, []);

  const joinRoom = useCallback((roomCode) => {
    setError(null);
    setGameResult(null);
    socketService.joinRoom(roomCode);
  }, []);

  const leaveRoom = useCallback(() => {
    socketService.leaveRoom();
    setRoom(null);
    setGameState(null);
    setIsPlaying(false);
    setIsReady(false);
    setGameResult(null);
  }, []);

  const toggleReady = useCallback(() => {
    const newReady = !isReady;
    setIsReady(newReady);
    socketService.setReady(newReady);
  }, [isReady]);

  const sendAction = useCallback((type, data = {}) => {
    socketService.sendAction({ type, data });
  }, []);

  const spectate = useCallback((roomCode) => {
    setError(null);
    socketService.spectate(roomCode);
  }, []);

  const value = {
    room,
    gameState,
    isPlaying,
    isReady,
    error,
    gameResult,
    joinRoom,
    leaveRoom,
    toggleReady,
    sendAction,
    spectate
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export default GameContext;
