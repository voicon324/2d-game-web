import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';
import api from '../services/api';

const FILTERS = ['All', 'Ranked', 'Casual', 'Tournament'];

export default function SpectatePage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await api.matches.getLive();
        
        // Map API data to UI format
        const mappedMatches = data.map(m => ({
          id: m._id,
          roomCode: m.roomCode,
          game: m.game.name,
          gameSlug: m.game.slug,
          gameIcon: m.game.slug === 'caro' ? 'grid_view' : 'sports_esports',
          gameColor: m.game.slug === 'caro' ? 'bg-pink-600' : 'bg-green-600',
          type: 'Ranked Match', // Placeholder
          player1: {
            name: m.players[0]?.user?.username || 'Player 1',
            rating: m.players[0]?.user?.stats?.gamesWon * 10 || 1200,
            avatar: m.players[0]?.user?.username.substring(0, 2).toUpperCase(),
            color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
            hasImage: false
          },
          player2: {
            name: m.players[1]?.user?.username || 'Player 2',
            rating: m.players[1]?.user?.stats?.gamesWon * 10 || 1200,
            avatar: m.players[1]?.user?.username.substring(0, 2).toUpperCase(),
            color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
            hasImage: false
          },
          viewers: m.spectators ? m.spectators.length : 0,
          isLive: true,
          isFeatured: false
        }));
        
        setMatches(mappedMatches);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMatches();
  }, []);

  const handleSpectate = (roomCode, gameSlug) => {
    const slug = gameSlug || 'caro';
    navigate(`/game?type=${slug}&room=${roomCode}`);
  };

  const filteredMatches = matches.filter(match => {
    if (activeFilter === 'All') return true;
    return match.type.includes(activeFilter);
  });

  return (
    <div className="bg-gray-100 dark:bg-gray-900 font-[Inter] min-h-screen transition-colors duration-200">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate flex items-center gap-3">
              <span className="material-icons text-red-500 text-3xl animate-pulse">live_tv</span>
              Live Spectate
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Watch top players compete in real-time.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3 md:mt-0 md:ml-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              <span className="w-2 h-2 mr-2 bg-red-500 rounded-full animate-pulse"></span>
              {matches.length} Matches Live
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Matches Grid */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map(match => (
              <div key={match.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${match.gameColor} text-white`}>
                      <span className="material-icons text-sm">{match.gameIcon}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{match.game}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="material-icons text-xs">visibility</span>
                      {match.viewers}
                    </span>
                    {match.isLive && (
                      <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-[10px] font-bold uppercase tracking-wider">
                        Live
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    {/* Player 1 */}
                    <div className="flex flex-col items-center text-center flex-1">
                      <div className="relative mb-2">
                        <div className={`w-14 h-14 rounded-full ${match.player1.color} flex items-center justify-center text-lg font-bold ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-blue-500/30`}>
                          {match.player1.avatar}
                        </div>
                        {match.player1.rating >= 2800 && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full p-0.5 shadow-sm" title="Grandmaster">
                            <span className="material-icons text-[10px]">emoji_events</span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate w-full">{match.player1.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{match.player1.rating}</p>
                    </div>

                    {/* VS */}
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-gray-200 dark:text-gray-700 italic">VS</span>
                      <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">Ranked</span>
                    </div>

                    {/* Player 2 */}
                    <div className="flex flex-col items-center text-center flex-1">
                      <div className="relative mb-2">
                        <div className={`w-14 h-14 rounded-full ${match.player2.color} flex items-center justify-center text-lg font-bold ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-red-500/30`}>
                          {match.player2.avatar}
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate w-full">{match.player2.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{match.player2.rating}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleSpectate(match.roomCode, match.gameSlug)}
                    className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group-hover:scale-[1.02] transform duration-200"
                  >
                    <span className="material-icons text-lg">visibility</span>
                    Watch Match
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <span className="material-icons text-gray-400 text-4xl">tv_off</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Live Matches</h3>
            <p className="text-gray-500 dark:text-gray-400">There are no active matches to spectate right now.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
