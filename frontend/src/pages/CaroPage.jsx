import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import CaroBoard from '../components/CaroBoard';
import useWebSocket from '../hooks/useWebSocket';

/**
 * CaroPage - Full Caro game page with WebSocket integration
 */
export default function CaroPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const roomCode = roomId || searchParams.get('room');
  
  // Mock user - in real app this would come from auth context
  const [user] = useState({
    id: `user_${Math.random().toString(36).substr(2, 9)}`,
    username: `Player_${Math.floor(Math.random() * 1000)}`
  });
  
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
    clearError
  } = useWebSocket();
  
  const [isReady, setIsReady] = useState(false);
  const [joinInput, setJoinInput] = useState('');
  
  // Connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);
  
  // Auto-join room if roomCode provided
  useEffect(() => {
    if (isConnected && roomCode) {
      joinRoom(roomCode, user.id, user.username);
    }
  }, [isConnected, roomCode, user.id, user.username, joinRoom]);
  
  // Handle cell click
  const handleCellClick = useCallback((x, y) => {
    if (!roomInfo?.roomCode) return;
    
    sendAction(roomInfo.roomCode, {
      type: 'PLACE',
      data: { x, y }
    });
  }, [roomInfo?.roomCode, sendAction]);
  
  // Handle ready
  const handleReady = () => {
    if (!roomInfo?.roomCode) return;
    setReady(roomInfo.roomCode, user.id);
    setIsReady(true);
  };
  
  // Handle join room
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (joinInput.trim()) {
      joinRoom(joinInput.trim().toUpperCase(), user.id, user.username);
    }
  };
  
  // Check if it's current user's turn
  const isMyTurn = gameState?.currentPlayer?.id === user.id;
  
  // My symbol
  const mySymbol = gameState?.players?.find(p => p.id === user.id)?.symbol;
  
  return (
    <div className="bg-slate-100 dark:bg-slate-950 min-h-screen transition-colors">
      {/* Header */}
      <header className="p-4 flex justify-between items-center max-w-7xl mx-auto">
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
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-4">
        {/* Error display */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex justify-between items-center">
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
                {gameResult.winner === user.id
                  ? 'You Win!'
                  : gameResult.isDraw
                  ? 'Draw!'
                  : 'You Lose'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">{gameResult.reason}</p>
              <div className="flex gap-4 justify-center">
                <Link
                  to="/"
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-700 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Home
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Not in room - show join form */}
        {!roomInfo && (
          <div className="max-w-md mx-auto mt-20">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-white">
                🎮 Caro / Gomoku
              </h2>
              
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
                <button
                  type="submit"
                  className="w-full py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors"
                >
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
        )}
        
        {/* In room - waiting for game or playing */}
        {roomInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar - Room Info */}
            <aside className="lg:col-span-3 space-y-6">
              {/* Room info */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
                  Room: {roomInfo.roomCode}
                </h3>
                
                <div className="space-y-4">
                  {/* Players */}
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Players</p>
                    {roomInfo.players?.map((p, i) => (
                      <div key={p.user?._id || i} className="flex items-center gap-3 py-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${i === 0 ? 'bg-pink-500' : 'bg-blue-500'}`}>
                          {['×', '○'][i]}
                        </div>
                        <span className="text-slate-900 dark:text-white font-medium">
                          {p.user?.username || 'Player'}
                          {p.user?._id === user.id && ' (You)'}
                        </span>
                        {p.isReady && (
                          <span className="text-green-500 text-sm">✓ Ready</span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Status */}
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      roomInfo.status === 'playing'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {roomInfo.status === 'playing' ? '🎮 Playing' : '⏳ Waiting'}
                    </span>
                  </div>
                </div>
                
                {/* Ready button */}
                {roomInfo.status === 'waiting' && !isReady && (
                  <button
                    onClick={handleReady}
                    className="mt-6 w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    Ready to Play
                  </button>
                )}
                
                {/* Leave button */}
                <button
                  onClick={leaveRoom}
                  className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Leave Room
                </button>
              </div>
              
              {/* My info */}
              {gameState && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Your Symbol</p>
                  <div className={`text-4xl font-bold ${mySymbol === 'X' ? 'text-pink-500' : 'text-blue-500'}`}>
                    {mySymbol === 'X' ? '×' : '○'}
                  </div>
                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                    Moves: {gameState.movesCount || 0}
                  </p>
                </div>
              )}
            </aside>
            
            {/* Game Board */}
            <section className="lg:col-span-9 flex justify-center items-start">
              {gameState?.board ? (
                <CaroBoard
                  board={gameState.board}
                  boardSize={gameState.boardSize || 15}
                  lastMove={gameState.lastMove}
                  currentPlayer={gameState.currentPlayer}
                  isMyTurn={isMyTurn}
                  onCellClick={handleCellClick}
                  disabled={isGameOver || roomInfo.status !== 'playing'}
                />
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🎮</div>
                  <p className="text-xl text-slate-600 dark:text-slate-400">
                    Waiting for all players to be ready...
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
