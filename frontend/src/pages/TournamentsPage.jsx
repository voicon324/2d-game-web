import { useState, useEffect } from 'react';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';
import api from '../services/api';

const STATUS_FILTERS = ['All', 'Active', 'Upcoming', 'Completed'];

export default function TournamentsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await api.tournaments.getAll();
        
        // Map API data to UI format
        const mappedTournaments = data.map(t => ({
          id: t._id,
          name: t.name,
          game: t.game.name, // Assuming populated
          status: t.status,
          participants: t.participants.length,
          maxParticipants: t.maxParticipants,
          prize: t.prize,
          startDate: new Date(t.startDate).toLocaleDateString(),
          endDate: new Date(t.endDate).toLocaleDateString(),
          description: t.description || `Join the ${t.name} to win ${t.prize}!`,
          icon: t.game.slug === 'caro' ? 'grid_view' : 'sports_esports', // Simplified icon logic
          winner: t.winner?.username
        }));
        
        setTournaments(mappedTournaments);
      } catch (error) {
        console.error('Failed to fetch tournaments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTournaments();
  }, []);

  const handleJoin = async (id) => {
    if (!window.confirm('Join this tournament?')) return;
    try {
      await api.tournaments.join(id);
      alert('Joined successfully!');
      // Refresh list
      const data = await api.tournaments.getAll();
      setTournaments(data.map(t => ({
        id: t._id,
        name: t.name,
        game: t.game.name,
        status: t.status,
        participants: t.participants.length,
        maxParticipants: t.maxParticipants,
        prize: t.prize,
        startDate: new Date(t.startDate).toLocaleDateString(),
        endDate: new Date(t.endDate).toLocaleDateString(),
        description: t.description || `Join the ${t.name} to win ${t.prize}!`,
        icon: t.game.slug === 'caro' ? 'grid_view' : 'sports_esports',
        winner: t.winner?.username
      })));
    } catch (error) {
      alert('Failed to join: ' + error.message);
    }
  };
  
  const filteredTournaments = tournaments.filter(t => {
    if (activeFilter === 'All') return true;
    return t.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const getStatusStyles = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGameColor = (gameName) => {
    // Simplified color logic based on game name string
    if (gameName.includes('Caro') || gameName.includes('Pixel')) return 'from-pink-500 to-rose-500';
    if (gameName.includes('Chess')) return 'from-indigo-500 to-purple-500';
    if (gameName.includes('Go')) return 'from-amber-500 to-orange-500';
    return 'from-blue-500 to-cyan-500';
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 font-[Inter] min-h-screen transition-colors duration-200">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate flex items-center gap-3">
              <span className="material-icons text-pink-500 text-3xl">emoji_events</span>
              Tournaments
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Compete in official tournaments and win amazing prizes!
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3 md:mt-0 md:ml-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredTournaments.length} tournaments found
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8 flex flex-wrap gap-3">
          {STATUS_FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? 'bg-pink-500 text-white shadow-md ring-2 ring-pink-500 ring-offset-2 dark:ring-offset-gray-900'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Tournaments Grid */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTournaments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTournaments.map(tournament => (
              <div 
                key={tournament.id} 
                className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group ${
                  tournament.status === 'completed' ? 'opacity-75' : ''
                }`}
              >
                {/* Tournament Header */}
                <div className={`bg-gradient-to-r ${getGameColor(tournament.game)} p-6 text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-icons text-4xl opacity-80">{tournament.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold">{tournament.name}</h3>
                        <p className="text-white/80 text-sm">{tournament.game}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusStyles(tournament.status)}`}>
                      {tournament.status}
                    </span>
                  </div>
                </div>
                
                {/* Tournament Body */}
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {tournament.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Prize Pool</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{tournament.prize}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Participants</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {tournament.participants}/{tournament.maxParticipants}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <span className="material-icons text-base">calendar_today</span>
                      <span>{tournament.startDate} - {tournament.endDate}</span>
                    </div>
                  </div>
                  
                  {tournament.winner && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium flex items-center gap-1">
                        <span className="material-icons text-base">emoji_events</span>
                        Winner: <span className="font-bold">{tournament.winner}</span>
                      </p>
                    </div>
                  )}
                  
                  {tournament.status === 'active' && (
                    <button 
                      onClick={() => handleJoin(tournament.id)}
                      className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-icons text-lg">play_arrow</span>
                      Join Tournament
                    </button>
                  )}
                  
                  {tournament.status === 'upcoming' && (
                    <button 
                      onClick={() => handleJoin(tournament.id)}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-icons text-lg">notifications</span>
                      Register Now
                    </button>
                  )}
                  
                  {tournament.status === 'completed' && (
                    <button className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium flex items-center justify-center gap-2 cursor-default">
                      <span className="material-icons text-lg">done_all</span>
                      Tournament Ended
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
            <span className="material-icons text-6xl text-gray-400 mb-4">emoji_events</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No tournaments found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              There are no {activeFilter.toLowerCase()} tournaments at the moment. Check back later!
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
