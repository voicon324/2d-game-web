const STATS = [
  { label: 'Avg. Session Duration', value: '24m 12s', icon: 'timer', color: 'bg-indigo-50 dark:bg-indigo-900/30', iconColor: 'text-indigo-600 dark:text-indigo-400', trend: '+3.2%', trendUp: true },
  { label: 'Retention Rate (D30)', value: '42.8%', icon: 'diversity_3', color: 'bg-pink-50 dark:bg-pink-900/30', iconColor: 'text-pink-500', trend: '+1.1%', trendUp: true },
  { label: 'Total Playtime', value: '12.4k hrs', icon: 'play_circle', color: 'bg-amber-50 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400', trend: '-0.5%', trendUp: false },
  { label: 'Premium Conversion', value: '2.4%', icon: 'attach_money', color: 'bg-teal-50 dark:bg-teal-900/30', iconColor: 'text-teal-600 dark:text-teal-400', trend: '0.0%', trendUp: null },
];

const GAME_CATEGORIES = [
  { name: 'Board Games', percentage: 45, color: 'bg-pink-500' },
  { name: 'Strategy', percentage: 30, color: 'bg-indigo-500' },
  { name: 'Card Games', percentage: 15, color: 'bg-amber-500' },
  { name: 'Puzzle', percentage: 10, color: 'bg-teal-500' },
];

const TOP_GAMES = [
  { name: 'Pixel Dots', category: 'Board', plays: '12,453', players: '8,201', rating: 4.2, categoryColor: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
  { name: 'Grandmaster Chess', category: 'Strategy', plays: '8,922', players: '4,110', rating: 4.8, categoryColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  { name: 'Poker Night', category: 'Card', plays: '6,104', players: '3,450', rating: 4.0, categoryColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
];

const ACTIVITY_DATA = [
  { day: '1', active: 40, new: 15 },
  { day: '5', active: 45, new: 10 },
  { day: '10', active: 55, new: 25 },
  { day: '15', active: 48, new: 18 },
  { day: '20', active: 60, new: 12 },
  { day: '25', active: 75, new: 28 },
  { day: '30', active: 65, new: 20 },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Analytics Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Deep dive into game performance, player retention, and engagement metrics.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <span className="material-icons text-sm">calendar_today</span>
            </span>
            <select className="pl-9 pr-8 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-pink-500 focus:border-pink-500 shadow-sm">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <span className="material-icons text-sm">category</span>
            </span>
            <select className="pl-9 pr-8 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-pink-500 focus:border-pink-500 shadow-sm">
              <option>All Game Types</option>
              <option>Strategy</option>
              <option>Board Games</option>
              <option>Card Games</option>
              <option>Puzzle</option>
            </select>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <span className="material-icons text-sm mr-2">download</span>
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                <span className={`material-icons ${stat.iconColor}`}>{stat.icon}</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{stat.label}</dt>
                  <dd>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`font-medium flex items-center mr-2 ${
                stat.trendUp === true ? 'text-green-500' : stat.trendUp === false ? 'text-red-500' : 'text-gray-500'
              }`}>
                <span className="material-icons text-sm mr-1">
                  {stat.trendUp === true ? 'arrow_upward' : stat.trendUp === false ? 'arrow_downward' : 'remove'}
                </span>
                {stat.trend}
              </span>
              <span className="text-gray-500 dark:text-gray-400">{stat.trendUp !== null ? 'vs last period' : 'stable'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Daily Active Users vs New Registrations</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Comparative analysis over the selected period</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="block w-3 h-3 bg-pink-500 rounded-full mr-2"></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Active Users</span>
            </div>
            <div className="flex items-center">
              <span className="block w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">New Users</span>
            </div>
          </div>
        </div>
        <div className="relative h-72 flex items-end justify-between px-2 gap-2 sm:gap-4">
          {ACTIVITY_DATA.map((data, idx) => (
            <div key={idx} className="w-full flex flex-col justify-end h-full gap-1 group">
              <div 
                className="w-full bg-gray-300 dark:bg-gray-600 rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity"
                style={{ height: `${data.new}%` }}
              ></div>
              <div 
                className="w-full bg-pink-500 rounded-t-sm opacity-90 group-hover:opacity-100 transition-opacity relative"
                style={{ height: `${data.active}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-20 transition-opacity">
                  Active: {Math.round(data.active * 50)}
                </div>
              </div>
              <span className="text-[10px] text-gray-400 text-center mt-1">{data.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Category Popularity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Game Category Popularity</h3>
          <div className="space-y-5">
            {GAME_CATEGORIES.map(cat => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                  <span className="text-gray-500">{cat.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                  <div className={`${cat.color} h-2.5 rounded-full`} style={{ width: `${cat.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Activity Times */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Peak Activity Times</h3>
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">UTC Time</span>
          </div>
          <div className="space-y-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) => (
              <div key={day} className="flex items-center">
                <span className="text-xs text-gray-400 w-8">{day}</span>
                <div className="flex-1 grid grid-cols-8 gap-1 h-6">
                  {[20, 30, 40, 60, 90, 80, 40, 20].map((intensity, i) => (
                    <div
                      key={i}
                      className="rounded-sm"
                      style={{ 
                        backgroundColor: `rgb(236 72 153 / ${(intensity + idx * 5) / 100})` 
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end items-center mt-3 gap-2">
            <span className="text-[10px] text-gray-400">Low</span>
            <div className="w-16 h-1.5 rounded-full bg-gradient-to-r from-pink-100 to-pink-500"></div>
            <span className="text-[10px] text-gray-400">High</span>
          </div>
        </div>
      </div>

      {/* Top Performing Games Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Top Performing Games</h3>
          <input
            type="text"
            className="text-sm border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-pink-500 focus:border-pink-500 py-1.5 px-3"
            placeholder="Filter games..."
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Game Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Plays</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unique Players</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {TOP_GAMES.map(game => (
                <tr key={game.name}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl">🎲</div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{game.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${game.categoryColor}`}>
                      {game.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{game.plays}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{game.players}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-icons text-sm">
                          {i < Math.floor(game.rating) ? 'star' : i < game.rating ? 'star_half' : 'star_border'}
                        </span>
                      ))}
                      <span className="ml-1 text-gray-500 dark:text-gray-400 text-xs mt-0.5">({game.rating})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-pink-500 hover:text-pink-700 dark:hover:text-pink-400">Details</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
