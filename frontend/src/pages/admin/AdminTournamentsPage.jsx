import { useState } from 'react';

const STATS = [
  { label: 'Live Now', value: '12', icon: 'stream', color: 'bg-red-100 dark:bg-red-900', iconColor: 'text-red-600 dark:text-red-300', trend: null },
  { label: 'Upcoming', value: '28', icon: 'schedule', color: 'bg-blue-100 dark:bg-blue-900', iconColor: 'text-blue-600 dark:text-blue-300', trend: '+5' },
  { label: 'Completed', value: '156', icon: 'emoji_events', color: 'bg-green-100 dark:bg-green-900', iconColor: 'text-green-600 dark:text-green-300', trend: null },
  { label: 'Total Players', value: '2,847', icon: 'group', color: 'bg-purple-100 dark:bg-purple-900', iconColor: 'text-purple-600 dark:text-purple-300', trend: '+12%' },
];

const TOURNAMENTS_DATA = [
  { id: 1, name: 'Weekly Chess Championship', game: 'Chess', players: '64/64', status: 'Live', startTime: 'Started 2h ago', prize: '$500', round: '4/6' },
  { id: 2, name: 'Pixel Dots Masters', game: 'Pixel Dots', players: '32/32', status: 'Live', startTime: 'Started 45m ago', prize: '$200', round: '2/5' },
  { id: 3, name: 'Go Championship 2024', game: 'Go', players: '16/16', status: 'Live', startTime: 'Started 4h ago', prize: '$1000', round: '3/4' },
  { id: 4, name: 'Reversi Weekend Open', game: 'Reversi', players: '48/64', status: 'Upcoming', startTime: 'Starts in 2h', prize: '$150', round: '-' },
  { id: 5, name: 'Beginner Friendly Chess', game: 'Chess', players: '22/32', status: 'Upcoming', startTime: 'Starts in 5h', prize: '$50', round: '-' },
  { id: 6, name: 'Checkers Blitz', game: 'Checkers', players: '64/64', status: 'Completed', startTime: 'Ended 1d ago', prize: '$100', round: 'Final' },
];

const STATUS_STYLES = {
  Live: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

const GAME_STYLES = {
  Chess: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'Pixel Dots': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  Go: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  Reversi: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Checkers: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function AdminTournamentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [gameFilter, setGameFilter] = useState('All Games');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filteredTournaments = TOURNAMENTS_DATA.filter(t => {
    if (gameFilter !== 'All Games' && t.game !== gameFilter) return false;
    if (statusFilter !== 'All Status' && t.status !== statusFilter) return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Tournament Management
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create, manage, and monitor all tournaments.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none mr-3">
            <span className="material-icons text-sm mr-2">download</span>
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none">
            <span className="material-icons text-sm mr-2">add</span>
            Create Tournament
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STATS.map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                {stat.trend && (
                  <span className="ml-2 text-xs text-green-500 font-medium">{stat.trend}</span>
                )}
              </div>
            </div>
            <div className={`p-2 ${stat.color} rounded-lg`}>
              <span className={`material-icons ${stat.iconColor}`}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-gray-400">search</span>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tournaments..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option>All Games</option>
              <option>Chess</option>
              <option>Pixel Dots</option>
              <option>Go</option>
              <option>Reversi</option>
              <option>Checkers</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option>All Status</option>
              <option>Live</option>
              <option>Upcoming</option>
              <option>Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tournaments Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tournament</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Game</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Players</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prize</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTournaments.map(tournament => (
                <tr key={tournament.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                        <span className="material-icons text-pink-500">emoji_events</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{tournament.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Round {tournament.round}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${GAME_STYLES[tournament.game]}`}>
                      {tournament.game}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {tournament.players}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_STYLES[tournament.status]}`}>
                      {tournament.status === 'Live' && <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>}
                      {tournament.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {tournament.startTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {tournament.prize}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="View">
                        <span className="material-icons">visibility</span>
                      </button>
                      <button className="text-pink-500 hover:text-pink-700 dark:hover:text-pink-400" title="Edit">
                        <span className="material-icons">edit</span>
                      </button>
                      {tournament.status !== 'Completed' && (
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Cancel">
                          <span className="material-icons">cancel</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredTournaments.length}</span> of{' '}
                <span className="font-medium">{TOURNAMENTS_DATA.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span className="material-icons text-sm">chevron_left</span>
                </button>
                <button className="z-10 bg-pink-500/10 border-pink-500 text-pink-500 relative inline-flex items-center px-4 py-2 border text-sm font-medium">1</button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span className="material-icons text-sm">chevron_right</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
