import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import Button from '../components/Button';
import GameRenderer from '../components/GameRenderer';
import ChatComponent from '../components/ChatComponent';
import useWebSocket from '../hooks/useWebSocket';

/**
 * GameBoardPage - Universal game board page
 * Supports multiple game types through GameRenderer
 * Uses WebSocket for real-time multiplayer
 */
export default function GameBoardPage() {
  const { id: gameId } = useParams();
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('room');
  const gameType = searchParams.get('type') || 'caro'; // default to caro
  
  // Get user from localStorage if available
  const [user] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  
  // WebSocket connection
  const {
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
    chatMessages,
    sendChat,
    clearError
  } = useWebSocket();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [joinInput, setJoinInput] = useState('');
  
  // Determine effective game type
  // Prioritize game type from connected room info (if available) over URL param
  const effectiveGameType = roomInfo?.game?.slug || gameType;

  // Game info based on type
  const gameInfo = {
    caro: { name: 'Cờ Caro', icon: 'grid_view', boardSize: 15 },
    tank: { name: 'Tank Battle', icon: 'sports_esports', boardSize: 20 },
    tictactoe: { name: 'Tic Tac Toe', icon: 'grid_view', boardSize: 3 },
    connect4: { name: 'Connect 4', icon: 'grid_view', boardSize: 7 },
    match3: { name: 'Candy Rush', icon: 'grid_view', boardSize: 8 },
    memory: { name: 'Memory Chess', icon: 'grid_view', boardSize: 6 },
    drawing: { name: 'Free Drawing', icon: 'brush', boardSize: 16 },
    chess: { name: 'Cờ Vua', icon: 'chess', boardSize: 8 },
    dots: { name: 'Pixel Dots', icon: 'apps', boardSize: 13 },
    snake: { name: 'Snake', icon: 'all_inclusive', boardSize: 20 }
  };
  const currentGame = gameInfo[effectiveGameType] || gameInfo.caro;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      window.location.href = '/login'; 
    }
  }, [user]);

  // Connect on mount
  useEffect(() => {
    if (user) {
        connect();
    }
    return () => disconnect();
  }, [connect, disconnect, user]);
  
  // Auto-join room if provided
  useEffect(() => {
    if (isConnected && roomCode) {
      joinRoom(roomCode);
      // Don't set isLoading(false) here, wait for roomInfo to arrive
    } else if (isConnected && !roomCode) {
      // If no room code, we are done loading (show join form)
      setIsLoading(false);
    } else if (error) {
       setIsLoading(false);
    }
  }, [isConnected, roomCode, joinRoom, error]);

  // Stop loading when roomInfo or error arrives
  useEffect(() => {
    if (roomInfo) {
      setIsLoading(false);
    }
  }, [roomInfo]);
  
  // Handle cell click
  const handleCellClick = useCallback((x, y) => {
    if (!roomInfo?.roomCode) return;
    
    const action = {
      type: 'PLACE',
      data: { x, y }
    };
    
    // For drawing, we can add color
    if (effectiveGameType === 'drawing') {
        action.data.color = '#000000'; // Default color
    }
    
    sendAction(action);
  }, [roomInfo?.roomCode, effectiveGameType, sendAction]);
  
  // Handle ready
  const handleReady = () => {
    if (!roomInfo?.roomCode) return;
    setReady(true);
    setIsPlayerReady(true);
  };
  
  // Handle keyboard controls for Tank and Snake game
  useEffect(() => {
    if (!roomInfo?.roomCode || !['tank', 'snake'].includes(effectiveGameType) || !gameState) return;

    const handleKeyDown = (e) => {
      // Prevent scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          sendAction({ type: 'MOVE', data: { direction: 'UP' } });
          break;
        case 's':
        case 'arrowdown':
          sendAction({ type: 'MOVE', data: { direction: 'DOWN' } });
          break;
        case 'a':
        case 'arrowleft':
          sendAction({ type: 'MOVE', data: { direction: 'LEFT' } });
          break;
        case 'd':
        case 'arrowright':
          sendAction({ type: 'MOVE', data: { direction: 'RIGHT' } });
          break;
        case ' ':
          sendAction({ type: 'SHOOT', data: {} });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [roomInfo, effectiveGameType, gameState, sendAction]);

  // Handle join room
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (joinInput.trim()) {
      joinRoom(joinInput.trim().toUpperCase());
    }
  };
  
  // Check if it's current user's turn
  // For live games (drawing, tank, snake), it's always "my turn" if I'm a player
  const isLiveGame = ['drawing', 'tank', 'snake'].includes(effectiveGameType);
  const isMyTurn = isLiveGame || gameState?.currentPlayer?.id === user?._id;
  
  // Get my symbol/info
  const myPlayer = gameState?.players?.find(p => p.id === user?._id);

  // Loading Overlay
  if (isLoading) {
    return (
      <div className="bg-slate-100 dark:bg-slate-950 min-h-screen flex flex-col items-center justify-center transition-colors">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
              <span className="material-icons text-white text-4xl">{currentGame.icon}</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              PixelHeart<span className="text-pink-500">.io</span>
            </h1>
          </div>
          <div className="relative w-64 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-loading-bar" />
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="material-icons animate-spin text-pink-500">sync</span>
            <span className="font-medium">Connecting to game server...</span>
          </div>
        </div>
        <style>{`
          @keyframes loading-bar {
            0% { width: 0; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
          .animate-loading-bar {
            animation: loading-bar 2s ease-in-out;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-[Poppins] min-h-screen transition-colors duration-300 flex flex-col items-center justify-center p-4 lg:p-8">
      {/* Header */}
      <header className="w-full max-w-7xl flex justify-between items-center mb-6 lg:mb-8">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center shadow-glow">
            <span className="material-icons text-white">grid_view</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            PixelHeart<span className="text-pink-500">.io</span>
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <span className={`flex items-center gap-2 text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <ThemeToggle />
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-sm">
            <span className="material-icons text-lg">settings</span>
            Settings
          </button>
        </div>
      </header>
      
      {/* Error display */}
      {error && (
        <div className="w-full max-w-7xl mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex justify-between items-center">
          <span className="text-red-700 dark:text-red-400">{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
            <span className="material-icons">close</span>
          </button>
        </div>
      )}
      
      {/* Game Over Modal */}
      {isGameOver && gameResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="text-6xl mb-4">
              {gameResult.winner === user.id ? '🎉' : gameResult.isDraw ? '🤝' : '😢'}
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
              {gameResult.winner === user.id ? 'You Win!' : gameResult.isDraw ? 'Draw!' : 'You Lose'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{gameResult.reason}</p>
            <div className="flex gap-4 justify-center">
              <Link to="/" className="px-6 py-3 bg-slate-200 dark:bg-slate-700 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                Home
              </Link>
              <button onClick={() => window.location.reload()} className="px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors">
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Not in room - show join form */}
      {!roomInfo ? (
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center">
                <span className="material-icons text-white">{currentGame.icon}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentGame.name}
              </h2>
            </div>
            
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                  placeholder="Enter room code..."
                  maxLength={6}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white uppercase text-center text-2xl tracking-widest font-mono"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors">
                Join Room
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Playing as: <span className="font-medium text-slate-700 dark:text-slate-300">{user.username}</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Main Game Layout */
        <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          {/* Left Sidebar - Player Info */}
          <aside className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1">
            {/* Room & Players */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Room</span>
                <span className="font-mono text-pink-500 font-bold">{roomInfo.roomCode}</span>
              </div>
              
              <div className="space-y-3">
                {roomInfo.players?.map((p, i) => (
                  <div key={p.user?._id || i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${i === 0 ? 'bg-pink-500' : 'bg-blue-500'}`}>
                      {gameType === 'caro' ? (i === 0 ? '×' : '○') : `P${i + 1}`}
                    </div>
                    <div className="flex-1">
                      <span className="text-slate-900 dark:text-white font-medium block">
                        {p.user?.username || 'Player'}
                        {p.user?._id === user?._id && ' (You)'}
                      </span>
                      {p.isReady && <span className="text-green-500 text-xs">✓ Ready</span>}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Ready button */}
              {roomInfo.status === 'waiting' && !isPlayerReady && (
                <button onClick={handleReady} className="mt-4 w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">
                  Ready to Play
                </button>
              )}
            </div>
            
            {/* Game Stats */}
            {gameState && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Moves</p>
                    <p className="text-2xl font-mono font-bold text-slate-700 dark:text-slate-200">
                      {gameState.movesCount || 0}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Turn</p>
                    <p className="text-2xl font-mono font-bold text-pink-500">
                      {gameState.currentTurn || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Center - Game Board */}
          <section className="lg:col-span-6 flex flex-col items-center justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-[600px] aspect-square bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-300 dark:border-slate-700/50">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden p-2 sm:p-3 flex items-center justify-center">
                {gameState?.board ? (
                  <GameRenderer
                    gameType={effectiveGameType}
                    gameState={gameState}
                    boardSize={gameState.boardSize || currentGame.boardSize}
                    isMyTurn={isMyTurn}
                    onCellClick={handleCellClick}
                    disabled={isGameOver || roomInfo.status !== 'playing'}
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎮</div>
                    <p className="text-xl text-slate-600 dark:text-slate-400">
                      Waiting for players...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Right Sidebar - Actions */}
          <aside className="lg:col-span-3 flex flex-col gap-6 order-3">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
              <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Actions</h3>
              <Button icon="logout" variant="secondary" onClick={leaveRoom} className="w-full">
                Leave Room
              </Button>
            </div>
            
            {/* Help */}
            <div className="mt-auto pt-4 text-center lg:text-left">
              <Link to={`/rules/${gameType}`} className="text-sm text-slate-400 hover:text-pink-500 transition-colors flex items-center gap-1 mx-auto lg:mx-0 group">
                <span className="material-icons text-base group-hover:scale-110 transition-transform">help</span>
                How to play {currentGame.name}
              </Link>
            </div>

            {/* Chat */}
            <ChatComponent 
              isActive={true}
              messages={chatMessages} 
              onSendMessage={sendChat}
              user={user}
            />
          </aside>
        </main>
      )}
    </div>
  );
}
