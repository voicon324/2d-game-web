import { useState } from 'react';

const STATS = [
  { label: 'Total Users', value: '24,592', icon: 'group', color: 'bg-blue-100 dark:bg-blue-900', iconColor: 'text-blue-600 dark:text-blue-300' },
  { label: 'Active Now', value: '1,203', icon: 'person_check', color: 'bg-green-100 dark:bg-green-900', iconColor: 'text-green-600 dark:text-green-300' },
  { label: 'Moderators', value: '48', icon: 'security', color: 'bg-purple-100 dark:bg-purple-900', iconColor: 'text-purple-600 dark:text-purple-300' },
  { label: 'Locked', value: '156', icon: 'lock', color: 'bg-red-100 dark:bg-red-900', iconColor: 'text-red-600 dark:text-red-300' },
];

const USERS_DATA = [
  { name: 'Jane Doe', email: 'jane.doe@example.com', initials: 'JD', role: 'Player', status: 'Active', joined: 'Oct 24, 2023', gradient: 'from-pink-400 to-red-400' },
  { name: 'Mark Smith', email: 'mark.s@example.com', initials: 'MS', role: 'Player', status: 'Locked', joined: 'Oct 22, 2023', gradient: 'from-blue-400 to-indigo-400' },
  { name: 'Alex Lee', email: 'alex.lee@example.com', initials: 'AL', role: 'Moderator', status: 'Active', joined: 'Sep 15, 2023', gradient: 'from-purple-400 to-pink-400' },
  { name: 'Sarah Rose', email: 's.rose@example.com', initials: 'SR', role: 'Player', status: 'Pending', joined: 'Oct 25, 2023', gradient: 'from-gray-400 to-slate-400' },
  { name: 'Kevin Jones', email: 'kevin.j@example.com', initials: 'KJ', role: 'Admin', status: 'Active', joined: 'Jan 12, 2023', gradient: 'from-green-400 to-teal-400', isSuper: true },
  { name: 'Brian Wong', email: 'brian.w@example.com', initials: 'BW', role: 'Player', status: 'Locked', joined: 'Nov 05, 2023', gradient: 'from-orange-400 to-yellow-400' },
];

const STATUS_STYLES = {
  Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Locked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const ROLE_STYLES = {
  Player: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Moderator: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            User Management
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage users, roles, and account statuses.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none mr-3">
            <span className="material-icons text-sm mr-2">download</span>
            Export CSV
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none">
            <span className="material-icons text-sm mr-2">person_add</span>
            Add User
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
              placeholder="Search by name, email or ID"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option>All Roles</option>
              <option>Admin</option>
              <option>Moderator</option>
              <option>Player</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Locked</option>
              <option>Pending</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none">
              <span className="material-icons text-lg">filter_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center group">
                    User
                    <span className="material-icons text-xs ml-1 opacity-0 group-hover:opacity-100">unfold_more</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center group">
                    Joined Date
                    <span className="material-icons text-xs ml-1 opacity-0 group-hover:opacity-100">unfold_more</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {USERS_DATA.map(user => (
                <tr key={user.email} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_STYLES[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_STYLES[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.joined}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.isSuper ? (
                      <span className="text-gray-400 cursor-not-allowed" title="Cannot modify Super Admin">
                        <span className="material-icons">lock_clock</span>
                      </span>
                    ) : (
                      <div className="flex justify-end space-x-3">
                        {user.status === 'Locked' ? (
                          <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300" title="Unlock Account">
                            <span className="material-icons">lock_open</span>
                          </button>
                        ) : (
                          <button className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300" title="Lock Account">
                            <span className="material-icons">lock</span>
                          </button>
                        )}
                        <button className="text-pink-500 hover:text-pink-700 dark:hover:text-pink-400" title="Edit User">
                          <span className="material-icons">edit</span>
                        </button>
                      </div>
                    )}
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
                Showing <span className="font-medium">1</span> to <span className="font-medium">6</span> of{' '}
                <span className="font-medium">24592</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span className="material-icons text-sm">chevron_left</span>
                </button>
                <button className="z-10 bg-pink-500/10 border-pink-500 text-pink-500 relative inline-flex items-center px-4 py-2 border text-sm font-medium">1</button>
                <button className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">2</button>
                <button className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 hidden md:inline-flex relative items-center px-4 py-2 border text-sm font-medium">3</button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200">...</span>
                <button className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 hidden md:inline-flex relative items-center px-4 py-2 border text-sm font-medium">10</button>
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
