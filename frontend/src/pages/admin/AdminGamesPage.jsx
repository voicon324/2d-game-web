import { useState } from 'react';

const STATS = [
  { label: 'Total Games', value: '18', icon: 'videogame_asset', color: 'bg-blue-100 dark:bg-blue-900', iconColor: 'text-blue-600 dark:text-blue-300' },
  { label: 'Active Lobbies', value: '342', icon: 'play_circle', color: 'bg-green-100 dark:bg-green-900', iconColor: 'text-green-600 dark:text-green-300' },
  { label: 'Players Online', value: '895', icon: 'supervised_user_circle', color: 'bg-purple-100 dark:bg-purple-900', iconColor: 'text-purple-600 dark:text-purple-300' },
  { label: 'Disabled Games', value: '3', icon: 'block', color: 'bg-red-100 dark:bg-red-900', iconColor: 'text-red-600 dark:text-red-300' },
];

const GAMES_DATA = [
  { name: 'Classic Chess', version: 'v2.4.1', icon: 'chess', category: 'Strategy', status: 'Enabled', boardSize: '8x8', players: 452, color: 'bg-indigo-100 dark:bg-indigo-900', iconColor: 'text-indigo-600 dark:text-indigo-400' },
  { name: 'Connect Four', version: 'v1.2.0', icon: 'apps', category: 'Abstract', status: 'Enabled', boardSize: '7x6', players: 128, color: 'bg-orange-100 dark:bg-orange-900', iconColor: 'text-orange-600 dark:text-orange-400' },
  { name: 'Dice Royale', version: 'v3.0.1', icon: 'casino', category: 'Dice', status: 'Disabled', boardSize: 'N/A', players: 0, color: 'bg-red-100 dark:bg-red-900', iconColor: 'text-red-600 dark:text-red-400' },
  { name: 'Go (Baduk)', version: 'v1.5.0', icon: 'circle', category: 'Strategy', status: 'Maintenance', boardSize: '19x19', players: 0, color: 'bg-teal-100 dark:bg-teal-900', iconColor: 'text-teal-600 dark:text-teal-400' },
  { name: "Poker Texas Hold'em", version: 'v2.1.3', icon: 'style', category: 'Card Game', status: 'Enabled', boardSize: 'N/A', players: 315, color: 'bg-blue-100 dark:bg-blue-900', iconColor: 'text-blue-600 dark:text-blue-400' },
];

const STATUS_STYLES = {
  Enabled: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Disabled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const CATEGORY_STYLES = {
  Strategy: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Abstract: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Dice: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Card Game': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
};

export default function AdminGamesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Game Management
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure games, dimensions, and availability.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none mr-3">
            <span className="material-icons text-sm mr-2">download</span>
            Export Stats
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none">
            <span className="material-icons text-sm mr-2">add_box</span>
            Add New Game
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STATS.map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
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
              placeholder="Search by game name or category"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option>All Categories</option>
              <option>Strategy</option>
              <option>Card Game</option>
              <option>Abstract</option>
              <option>Dice</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option>All Status</option>
              <option>Enabled</option>
              <option>Disabled</option>
              <option>Maintenance</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none">
              <span className="material-icons text-lg">filter_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Games Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center group">
                    Game Title
                    <span className="material-icons text-xs ml-1 opacity-0 group-hover:opacity-100">unfold_more</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Board Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center group">
                    Active Players
                    <span className="material-icons text-xs ml-1 opacity-0 group-hover:opacity-100">unfold_more</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {GAMES_DATA.map(game => (
                <tr key={game.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 ${game.color} rounded-lg flex items-center justify-center`}>
                        <span className={`material-icons ${game.iconColor}`}>{game.icon}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{game.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{game.version}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_STYLES[game.category]}`}>
                      {game.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_STYLES[game.status]}`}>
                      {game.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {game.boardSize}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {game.players.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      {game.boardSize !== 'N/A' ? (
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Configure Dimensions">
                          <span className="material-icons">grid_4x4</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 cursor-not-allowed" title="No Board Configuration">
                          <span className="material-icons">grid_off</span>
                        </span>
                      )}
                      {game.status === 'Enabled' ? (
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Disable Game">
                          <span className="material-icons">block</span>
                        </button>
                      ) : (
                        <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300" title="Enable Game">
                          <span className="material-icons">check_circle</span>
                        </button>
                      )}
                      <button className="text-pink-500 hover:text-pink-700 dark:hover:text-pink-400" title="Edit Game">
                        <span className="material-icons">edit</span>
                      </button>
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
                Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
                <span className="font-medium">18</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span className="material-icons text-sm">chevron_left</span>
                </button>
                <button className="z-10 bg-pink-500/10 border-pink-500 text-pink-500 relative inline-flex items-center px-4 py-2 border text-sm font-medium">1</button>
                <button className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">2</button>
                <button className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">3</button>
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
