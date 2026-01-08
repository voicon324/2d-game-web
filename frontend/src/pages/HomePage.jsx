import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';
import GameCard from '../components/GameCard';
import Button from '../components/Button';
import api from '../services/api';

const CATEGORIES = ['All Games', 'Strategy', 'Card', 'Puzzle'];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Games');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [roomSettings, setRoomSettings] = useState({
    isPrivate: false,
    password: '',
  });
  const [joinRoomCode, setJoinRoomCode] = useState('');

  const handleJoinRoom = () => {
    if (!joinRoomCode) return;
    // We don't know the game type from code alone easily without API, 
    // but usually we redirect to a generic join or matchmaking checker.
    // For now, let's assume valid codes exist. 
    // Wait, the router usually needs gameSlug. 
    // But our test expects just entering code. 
    // Let's rely on backend validation or specific route.
    // Actually, checking API first is better.
    // For this project, let's redirect to matchmaking/check or similar?
    // Looking at routes, we have /play/:slug/:roomCode or similar?
    
    // Quick fix: The backend matchmaking/gameHandler knows the game.
    // But frontend URL requires slug: /game/:slug?room=...
    // We need to fetch room info first.
    api.matches.getByRoom(joinRoomCode)
      .then(match => {
        if (match && match.game && match.game.slug) {
           navigate(`/game/${match.game.slug}?type=${match.game.slug}&room=${joinRoomCode}`);
        } else {
           alert('Room not found');
        }
      })
      .catch(err => {
        alert('Failed to join room: ' + err.message);
      });
  };

  const [games, setGames] = useState([]);
  const [user] = useState(api.auth.getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const data = await api.games.getAll();
        // Transform API data to match UI expectations if needed
        // For now assuming API returns compatible data structure
        // Or mapping it:
        const mappedGames = data.map(g => ({
          ...g,
          id: g._id,
          // Add UI specific props if missing from API
          icon: g.slug === 'caro' ? 'grid_view' : (g.slug === 'tank' ? 'sports_esports' : 'gamepad'),
          iconBgColor: g.slug === 'caro' ? 'bg-pink-100 dark:bg-pink-900' : 'bg-green-100 dark:bg-green-900',
          iconColor: g.slug === 'caro' ? 'text-pink-500' : 'text-green-500',
          status: 'live', // Everyone is live
          playerCount: Math.floor(Math.random() * 1000) + 100 // Mock player count for now
        }));
        setGames(mappedGames);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGames();
  }, []);

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    setSelectedGame(null);
    setRoomSettings({ isPrivate: false, password: '' });
  };

  const handleSelectGame = (game) => {
    console.log('handleSelectGame called with:', game);
    if (game.status === 'maintenance') {
      console.log('Game is in maintenance');
      return;
    }
    setSelectedGame(game);
    console.log('selectedGame set to:', game);
  };

  const handleCreateRoom = async () => {
    if (!selectedGame) return;
    
    try {
      const match = await api.games.createRoom(selectedGame.slug);
      setShowCreateModal(false);
      navigate(`/game/${selectedGame.slug}?type=${selectedGame.slug}&room=${match.roomCode}`);
    } catch (error) {
      alert('Failed to create room: ' + error.message);
    }
  };

  return (
    <div className="font-[Inter] min-h-screen transition-colors duration-200">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
              Welcome back, {user ? user.username : 'Guest'}!
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Ready for your next challenge? Choose a game below.
            </p>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 md:mt-0 md:ml-4 items-center">
            {/* Join Room Form */}
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter room code..."
                className="w-full sm:w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-pink-500 focus:border-pink-500 uppercase font-mono text-sm"
                maxLength={6}
              />
              <Button 
                variant="secondary" 
                onClick={handleJoinRoom}
                disabled={!joinRoomCode || joinRoomCode.length < 6}
                className="whitespace-nowrap"
              >
                Join Room
              </Button>
            </div>
            
            <Button icon="add" onClick={handleOpenCreateModal}>
              Create Custom Room
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-gray-400">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="block w-full pl-10 pr-4 py-2 sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map(game => (
              <GameCard key={game.id} {...game} title={game.name} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-center transition-colors duration-200">
            <div className="relative mb-6 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative h-24 w-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <span className="material-icons text-5xl text-gray-400 dark:text-gray-500">search_off</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No games found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-sm sm:text-base leading-relaxed">
              We couldn't find any games matching "<span className="font-medium text-gray-900 dark:text-white">{searchQuery}</span>". 
              Try adjusting your filters or create a new room to start playing!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button 
                variant="secondary" 
                icon="filter_alt_off"
                onClick={() => setSearchQuery('')}
              >
                Clear Filters
              </Button>
              <Button icon="add" onClick={handleOpenCreateModal}>
                Create Custom Room
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setShowCreateModal(false)}
            />
            
            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center">
                    <span className="material-icons text-white">add</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Custom Room</h2>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="material-icons text-gray-500">close</span>
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6">
                {/* Step 1: Select Game */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs">1</span>
                    Select a Game
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {games.map(game => (
                      <button
                        key={game.id}
                        onClick={() => handleSelectGame(game)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedGame?.id === game.id
                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg ${game.iconBgColor} flex items-center justify-center mb-2`}>
                          <span className={`material-icons ${game.iconColor}`}>{game.icon}</span>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{game.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{game.minPlayers}-{game.maxPlayers} players</p>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Step 2: Room Settings */}
                {console.log('Rendering Step 2, selectedGame:', selectedGame)}
                {selectedGame && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs">2</span>
                      Room Settings
                    </h3>
                    <div className="space-y-4">
                      {/* Private Room Toggle */}
                      <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-xl cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="material-icons text-gray-500">{roomSettings.isPrivate ? 'lock' : 'public'}</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Private Room</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Only players with password can join</p>
                          </div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={roomSettings.isPrivate}
                          onChange={(e) => setRoomSettings(prev => ({ ...prev, isPrivate: e.target.checked }))}
                          className="w-5 h-5 rounded text-pink-500 focus:ring-pink-500"
                        />
                      </label>
                      
                      {/* Password Input */}
                      {roomSettings.isPrivate && (
                        <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Room Password
                          </label>
                          <input
                            type="text"
                            value={roomSettings.password}
                            onChange={(e) => setRoomSettings(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Enter password..."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900 rounded-b-2xl">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateRoom}
                  disabled={!selectedGame}
                  className={`px-6 py-2.5 font-medium rounded-lg transition-colors flex items-center gap-2 ${
                    selectedGame
                      ? 'bg-pink-500 hover:bg-pink-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="material-icons text-lg">sports_esports</span>
                  Create Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
