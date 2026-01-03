import { Link } from 'react-router-dom';

const STATS = [
  { label: 'Total Active Users', value: '24,592', icon: 'group', color: 'blue', change: '+12%', changeType: 'up', changeText: 'increase from last week' },
  { label: 'Games Played', value: '1,842', icon: 'sports_esports', color: 'pink', change: '+5.4%', changeType: 'up', changeText: 'increase from yesterday' },
  { label: 'New Registrations', value: '128', icon: 'person_add', color: 'purple', change: '-2%', changeType: 'down', changeText: 'decrease from yesterday' },
  { label: 'System Health', value: '99.9%', icon: 'monitor_heart', color: 'green', change: null, changeText: 'Operational - All servers online' },
];

const TOP_GAMES = [
  { name: 'Pixel Dots', players: 1204, percentage: 85, color: 'bg-pink-500' },
  { name: 'Grandmaster Chess', players: 842, percentage: 65, color: 'bg-indigo-500' },
  { name: 'Go Master', players: 312, percentage: 35, color: 'bg-amber-500' },
  { name: 'King Checkers', players: 156, percentage: 15, color: 'bg-red-500' },
];

const ACTIVITY_DATA = [
  { day: 'Mon', value: 40 },
  { day: 'Tue', value: 65 },
  { day: 'Wed', value: 50 },
  { day: 'Thu', value: 85 },
  { day: 'Fri', value: 90 },
  { day: 'Sat', value: 95 },
  { day: 'Sun', value: 80 },
];

const RECENT_USERS = [
  { name: 'Jane Doe', email: 'jane.doe@example.com', initials: 'JD', role: 'Player', status: 'Active', joined: 'Just now', gradient: 'from-pink-400 to-red-400' },
  { name: 'Mark Smith', email: 'mark.s@example.com', initials: 'MS', role: 'Player', status: 'Pending Email', joined: '15 minutes ago', gradient: 'from-blue-400 to-indigo-400' },
  { name: 'Alex Lee', email: 'alex.lee@example.com', initials: 'AL', role: 'Moderator', status: 'Active', joined: '2 hours ago', gradient: 'from-green-400 to-teal-400' },
];

const ALERTS = [
  { icon: 'warning', color: 'text-yellow-500', title: 'High Latency (US-East)', time: '25 mins ago' },
  { icon: 'backup', color: 'text-green-500', title: 'Backup Completed', time: '2 hours ago' },
];

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Dashboard Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Real-time statistics and system alerts.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none mr-3">
            <span className="material-icons text-sm mr-2">download</span>
            Export Report
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none">
            <span className="material-icons text-sm mr-2">refresh</span>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow ring-1 ring-black ring-opacity-5 relative">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 bg-${stat.color}-500 rounded-md p-3`}>
                  <span className="material-icons text-white">{stat.icon}</span>
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
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                {stat.change ? (
                  <>
                    <span className={`${stat.changeType === 'up' ? 'text-green-500' : 'text-red-500'} font-medium flex items-center`}>
                      <span className="material-icons text-sm mr-1">{stat.changeType === 'up' ? 'trending_up' : 'trending_down'}</span>
                      {stat.change}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">{stat.changeText}</span>
                  </>
                ) : (
                  <>
                    <span className="text-green-500 font-medium flex items-center">
                      <span className="material-icons text-sm mr-1">check_circle</span>
                      Operational
                    </span>
                    <span className="text-gray-500 dark:text-gray-400"> All servers online</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Activity (Last 7 Days)</h3>
            <select className="text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-pink-500 focus:border-pink-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="relative h-64 flex items-end space-x-6 justify-between px-2">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-400 pointer-events-none pb-6 pl-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b border-gray-100 dark:border-gray-700 w-full h-0"></div>
              ))}
            </div>
            {/* Bars */}
            {ACTIVITY_DATA.map((item, index) => (
              <div key={item.day} className="w-full flex flex-col justify-end group cursor-pointer z-10">
                <div 
                  className={`bg-pink-500/${40 + index * 10} hover:bg-pink-500 rounded-t-md transition-all relative`}
                  style={{ height: `${item.value}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                    {item.value * 10}
                  </div>
                </div>
                <span className="text-xs text-center text-gray-500 mt-2">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Games & Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Games Today</h3>
          <div className="space-y-6">
            {TOP_GAMES.map(game => (
              <div key={game.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{game.name}</span>
                  <span className="text-gray-500">{game.players.toLocaleString()} players</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className={`${game.color} h-2 rounded-full`} style={{ width: `${game.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wider mb-3">System Alerts</h3>
            <div className="space-y-3">
              {ALERTS.map((alert, index) => (
                <div key={index} className="flex items-start">
                  <span className={`material-icons ${alert.color} text-lg mr-2 mt-0.5`}>{alert.icon}</span>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-medium text-gray-900 dark:text-white">{alert.title}</p>
                    <p className="text-xs mt-0.5">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Recent User Registrations</h3>
          <Link to="/admin/users" className="text-sm text-pink-500 hover:text-pink-600 font-medium">View all users</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {RECENT_USERS.map(user => (
                <tr key={user.email}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${user.gradient} flex items-center justify-center text-white font-bold`}>
                          {user.initials}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-200">{user.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.joined}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-pink-500 hover:text-pink-600">Manage</a>
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
