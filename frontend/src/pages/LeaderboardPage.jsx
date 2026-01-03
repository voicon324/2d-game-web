import { useState, useEffect } from 'react';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';
import api from '../services/api';

const GAME_FILTERS = ['All Games', 'Pixel Dots', 'Grandmaster Chess', 'Go Master', 'Reversi'];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('global');
  const [activeFilter, setActiveFilter] = useState('All Games');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(api.auth.getCurrentUser());

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.users.getLeaderboard(50);
        
        // Map API data to UI format
        const mappedUsers = data.map((u, index) => ({
          rank: index + 1,
          id: u._id,
          name: u.username,
          initials: u.username.substring(0, 2).toUpperCase(),
          title: getTitle(u.stats?.gamesWon || 0),
          score: (u.stats?.gamesWon || 0) * 100 + (u.stats?.gamesDraw || 0) * 20, // Simple score formula
          game: 'General',
          winRate: calculateWinRate(u.stats),
          bgColor: getRandomColor(index),
          textColor: 'text-white',
          isCurrentUser: currentUser && u._id === currentUser._id,
          change: Math.floor(Math.random() * 20), // Mock change
          changeType: Math.random() > 0.5 ? 'up' : 'down'
        }));
        
        setUsers(mappedUsers);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [currentUser]);

  const getTitle = (wins) => {
    if (wins > 100) return 'Grandmaster';
    if (wins > 50) return 'Master';
    if (wins > 20) return 'Expert';
    return 'Novice';
  };

  const calculateWinRate = (stats) => {
    if (!stats || !stats.gamesPlayed) return 0;
    return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  };

  const getRandomColor = (index) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 
      'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'
    ];
    return colors[index % colors.length];
  };

  const topPlayers = users.slice(0, 3);
  // Reorder top players for podium: 2nd, 1st, 3rd
  const podiumPlayers = [];
  if (topPlayers.length > 0) podiumPlayers[1] = topPlayers[0]; // 1st place in middle (index 1)
  if (topPlayers.length > 1) podiumPlayers[0] = topPlayers[1]; // 2nd place on left (index 0)
  if (topPlayers.length > 2) podiumPlayers[2] = topPlayers[2]; // 3rd place on right (index 2)
  
  // Filter out empty spots if fewer than 3 players
  const validPodium = podiumPlayers.filter(p => p); 
  
  const restPlayers = users.slice(3);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 font-[Inter] min-h-screen transition-colors duration-200">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
              Leaderboards
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              See who's dominating the arena this season.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3 md:mt-0 md:ml-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">Season 1 Active</span>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none">
              <span className="material-icons text-sm mr-2">history</span>
              History
            </button>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex p-1 space-x-1 bg-gray-100 dark:bg-gray-900 rounded-lg w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('global')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'global' 
                  ? 'bg-white dark:bg-slate-700 shadow text-gray-900 dark:text-white' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Global Ranking
            </button>
            <button 
              onClick={() => setActiveTab('friends')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'friends' 
                  ? 'bg-white dark:bg-slate-700 shadow text-gray-900 dark:text-white' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Friends
            </button>
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {GAME_FILTERS.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter
                    ? 'bg-pink-500 text-white shadow-sm ring-2 ring-pink-500 ring-offset-2 dark:ring-offset-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-end">
              {validPodium.map((player, index) => { 
                // index matches the visual order: 0=Left(2nd), 1=Center(1st), 2=Right(3rd)
                // But player.rank is the source of truth
                const isChampion = player.rank === 1;
                return (
                <div 
                  key={player.id}
                  className={`${index === 1 ? 'order-1 md:order-2' : index === 0 ? 'order-2 md:order-1' : 'order-3'} 
                    bg-white dark:bg-slate-800 rounded-xl shadow-${isChampion ? 'lg' : 'md'} 
                    border-t-4 ${isChampion ? 'border-yellow-400' : player.rank === 2 ? 'border-gray-300 dark:border-gray-500' : 'border-orange-400'} 
                    p-${isChampion ? '8' : '6'} flex flex-col items-center 
                    transform ${isChampion ? 'scale-105 z-10' : 'hover:-translate-y-1'} transition-transform`}
                >
                  <div className="relative">
                    {isChampion && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400">
                        <span className="material-icons text-4xl">emoji_events</span>
                      </div>
                    )}
                    <div className={`h-${isChampion ? '24' : '20'} w-${isChampion ? '24' : '20'} rounded-full ${player.bgColor} flex items-center justify-center text-${isChampion ? '3' : '2'}xl font-bold ${player.textColor} ${isChampion ? 'ring-4 ring-yellow-400/20' : ''}`}>
                      {player.initials}
                    </div>
                    <div className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 ${isChampion ? 'bg-yellow-400 text-yellow-900' : player.rank === 2 ? 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100' : 'bg-orange-400 text-white'} text-xs font-bold px-${isChampion ? '3' : '2'} py-1 rounded-full border-2 border-white dark:border-gray-800`}>
                      #{player.rank}
                    </div>
                  </div>
                  <div className={`mt-${isChampion ? '6' : '5'} text-center`}>
                    <h3 className={`text-${isChampion ? 'xl' : 'lg'} font-bold text-gray-900 dark:text-white`}>{player.name}</h3>
                    <p className={`text-sm ${isChampion ? 'text-pink-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>{player.title}</p>
                    <div className="mt-3 flex items-center justify-center space-x-1">
                      <span className={`text-${isChampion ? '3' : '2'}xl font-bold text-gray-${isChampion ? '800 dark:text-white' : '700 dark:text-gray-200'}`}>
                        {player.score.toLocaleString()}
                      </span>
                      <span className={`text-xs ${player.changeType === 'up' ? 'text-green-500' : 'text-red-500'} font-medium flex items-center`}>
                        <span className="material-icons text-sm">{player.changeType === 'up' ? 'arrow_upward' : 'arrow_downward'}</span>
                        {player.change}
                      </span>
                    </div>
                  </div>
                </div>
              )})}
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Player</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Main Game</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Win Rate</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {restPlayers.map(player => (
                      <tr 
                        key={player.id} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                          player.isCurrentUser ? 'bg-pink-500/5 dark:bg-pink-500/10 border-l-4 border-pink-500' : ''
                        }`}
                      >
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-${player.isCurrentUser ? 'bold text-pink-500' : 'medium text-gray-900 dark:text-white'}`}>
                          {player.rank}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {player.isCurrentUser ? (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-pink-500">
                                Me
                              </div>
                            ) : (
                              <div className={`flex-shrink-0 h-8 w-8 rounded-full ${player.bgColor} flex items-center justify-center text-xs font-bold ${player.textColor}`}>
                                {player.initials}
                              </div>
                            )}
                            <div className="ml-4">
                              <div className={`text-sm font-${player.isCurrentUser ? 'bold' : 'medium'} text-gray-900 dark:text-white`}>
                                {player.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{player.game}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mr-2">
                              <div 
                                className={`${player.winRate >= 60 ? 'bg-green-500' : 'bg-yellow-500'} h-1.5 rounded-full`} 
                                style={{ width: `${player.winRate}%` }}
                              />
                            </div>
                            {player.winRate}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 dark:text-white">
                          {player.score.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
