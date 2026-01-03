import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import MainLayout from '../layouts/MainLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function MatchmakingPage() {
  const { gameSlug } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  
  const [status, setStatus] = useState('idle'); // idle, connecting, searching, found
  const [searchTime, setSearchTime] = useState(0);
  const [selectedGame, setSelectedGame] = useState(gameSlug || '');
  const [games, setGames] = useState([]);
  const [matchData, setMatchData] = useState(null);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(null);

  // Fetch available games
  useEffect(() => {
    fetch('/api/games')
      .then(res => res.json())
      .then(data => setGames(data))
      .catch(err => console.error('Failed to fetch games:', err));
  }, []);

  // Timer for search duration
  useEffect(() => {
    let timer;
    if (status === 'searching') {
      timer = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('matchmaking:leave', { userId: getUserId() });
        socketRef.current.disconnect();
      }
    };
  }, []);

  const getUserId = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  }, []);

  const handleStartMatchmaking = async () => {
    if (!selectedGame) return;
    
    const token = localStorage.getItem('token');
    const userId = getUserId();
    
    if (!token || !userId) {
      setError('Please login to use matchmaking');
      return;
    }

    setStatus('connecting');
    setError(null);
    setSearchTime(0);

    // Create socket connection
    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to matchmaking server');
      
      // Join matchmaking queue
      socket.emit('matchmaking:join', {
        gameSlug: selectedGame,
        userId
      });
    });

    socket.on('matchmaking:joined', (data) => {
      console.log('Joined queue:', data);
      setStatus('searching');
      setRating(data.rating);
    });

    socket.on('matchmaking:found', (data) => {
      console.log('Match found:', data);
      setStatus('found');
      setMatchData(data);
      
      // Redirect to game room after short delay
      setTimeout(() => {
        navigate(`/game/${data.gameSlug}?type=${data.gameSlug}&room=${data.roomCode}`);
      }, 2000);
    });

    socket.on('matchmaking:error', (data) => {
      console.error('Matchmaking error:', data);
      setError(data.message);
      setStatus('idle');
    });

    socket.on('matchmaking:left', () => {
      setStatus('idle');
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to matchmaking server');
      setStatus('idle');
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      if (status === 'searching') {
        setError('Connection lost. Please try again.');
        setStatus('idle');
      }
    });
  };

  const handleCancelMatchmaking = () => {
    if (socketRef.current) {
      socketRef.current.emit('matchmaking:leave', { userId: getUserId() });
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setStatus('idle');
    setSearchTime(0);
    setRating(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          <span className="material-icons text-4xl mr-3 align-middle text-pink-500">groups</span>
          Matchmaking
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 flex items-center gap-2">
            <span className="material-icons text-sm">error</span>
            {error}
          </div>
        )}

        {status === 'idle' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Game
              </label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Choose a game...</option>
                {games.map(game => (
                  <option key={game._id} value={game.slug}>{game.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleStartMatchmaking}
              disabled={!selectedGame}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons">search</span>
              Find Match
            </button>
          </div>
        )}

        {status === 'connecting' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400">Connecting to matchmaking server...</p>
          </div>
        )}

        {status === 'searching' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Searching for opponent...
            </h2>
            
            <p className="text-4xl font-mono text-pink-500 mb-2">
              {formatTime(searchTime)}
            </p>

            {rating && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Your rating: <span className="font-semibold text-pink-500">{rating}</span>
              </p>
            )}

            <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Looking for players with similar skill level
              {searchTime > 30 && (
                <div className="mt-2 text-amber-500">
                  Expanding search range...
                </div>
              )}
            </div>

            <button
              onClick={handleCancelMatchmaking}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {status === 'found' && matchData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-green-500 mb-4">Match Found!</h2>
            
            <div className="flex justify-center gap-8 mb-6">
              {matchData.players?.map((player, idx) => (
                <div key={player.id} className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                    {player.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-gray-900 dark:text-white font-medium">{player.username}</div>
                  <div className="text-sm text-gray-500">Rating: {player.rating}</div>
                </div>
              ))}
            </div>
            
            <p className="text-gray-600 dark:text-gray-400">Redirecting to game...</p>
            <div className="mt-4 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pink-500 to-purple-600 animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            <span className="material-icons text-sm mr-2 align-middle">info</span>
            How Matchmaking Works
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Players are matched based on their skill rating (ELO)</li>
            <li>• We look for opponents within ±200 rating points</li>
            <li>• Search range expands by 50 every 10 seconds</li>
            <li>• Average wait time: 30 seconds - 2 minutes</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
