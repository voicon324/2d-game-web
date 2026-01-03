const STATS = [
  { label: 'Server Uptime', value: '99.98%', icon: 'timer', color: 'bg-green-500/20', iconColor: 'text-green-500', status: 'Operational', statusColor: 'bg-green-500', extra: '14d 2h' },
  { label: 'Database Connections', value: '42/100', icon: 'database', color: 'bg-blue-500/20', iconColor: 'text-blue-500', status: 'Connected', statusColor: 'bg-green-500', extra: '2ms latency' },
  { label: 'API Latency (Avg)', value: '124ms', icon: 'speed', color: 'bg-yellow-500/20', iconColor: 'text-yellow-500', status: 'Slight degradation', statusColor: 'bg-yellow-500', extra: '+12ms', trend: 'up' },
  { label: 'Error Rate (1h)', value: '0.05%', icon: 'error', color: 'bg-red-500/20', iconColor: 'text-red-500', status: 'Within limits', statusColor: 'bg-green-500', extra: '-0.01%', trend: 'down' },
];

const RESOURCE_USAGE = [
  { label: 'CPU', value: 45, unit: '8 Cores Active', color: 'text-pink-500' },
  { label: 'RAM', value: 62, unit: '12GB / 16GB', color: 'text-blue-500' },
  { label: 'I/O', value: 25, unit: '45 MB/s', color: 'text-purple-500' },
];

const SERVICES = [
  { name: 'Authentication Service', version: 'v2.4.1', region: 'us-east-1', status: 'Operational', statusColor: 'bg-green-500', icon: 'verified_user', iconBg: 'bg-indigo-100 dark:bg-indigo-900', iconColor: 'text-indigo-600 dark:text-indigo-300' },
  { name: 'Game Engine Core', version: 'v3.0.0', region: 'us-east-1', status: 'Operational', statusColor: 'bg-green-500', icon: 'sports_esports', iconBg: 'bg-pink-100 dark:bg-pink-900', iconColor: 'text-pink-600 dark:text-pink-300' },
  { name: 'Matchmaking', version: 'v1.8.2', region: 'us-east-2', status: 'Degraded', statusColor: 'bg-yellow-500', icon: 'handshake', iconBg: 'bg-yellow-100 dark:bg-yellow-900', iconColor: 'text-yellow-600 dark:text-yellow-300' },
  { name: 'Chat & Presence', version: 'v2.1.0', region: 'global', status: 'Operational', statusColor: 'bg-green-500', icon: 'chat', iconBg: 'bg-blue-100 dark:bg-blue-900', iconColor: 'text-blue-600 dark:text-blue-300' },
  { name: 'Payment Gateway', version: 'v1.2.4', region: 'secure', status: 'Operational', statusColor: 'bg-green-500', icon: 'payments', iconBg: 'bg-purple-100 dark:bg-purple-900', iconColor: 'text-purple-600 dark:text-purple-300' },
];

const ERROR_LOGS = [
  { time: '10:42:01', level: 'ERR', levelColor: 'text-red-500', service: 'Auth-Svc', message: 'Timeout connecting to Redis pool...' },
  { time: '10:41:58', level: 'WARN', levelColor: 'text-yellow-500', service: 'Game-Eng', message: 'Match #4492 latency spike detected (250ms)' },
  { time: '10:41:45', level: 'INFO', levelColor: 'text-blue-500', service: 'Pay-Gate', message: 'Webhook received: invoice.paid' },
  { time: '10:41:12', level: 'ERR', levelColor: 'text-red-500', service: 'Match-Mkr', message: 'User 9921 failed to join lobby (Lobby Full)' },
  { time: '10:40:55', level: 'WARN', levelColor: 'text-yellow-500', service: 'API-Gw', message: 'Rate limit exceeded for IP 192.168.1.42' },
  { time: '10:39:20', level: 'INFO', levelColor: 'text-blue-500', service: 'System', message: 'Backup routine started...' },
];

export default function AdminSystemHealthPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            System Health Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor critical infrastructure, services, and real-time logs.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none mr-3">
            <span className="material-icons text-sm mr-2">history</span>
            Historical Data
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none">
            <span className="material-icons text-sm mr-2">notifications_active</span>
            Configure Alerts
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow ring-1 ring-black ring-opacity-5 relative">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                  <span className={`material-icons ${stat.iconColor}`}>{stat.icon}</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{stat.label}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.trend === 'up' ? 'text-yellow-500' : stat.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {stat.trend && (
                          <span className="material-icons text-[16px] align-middle">
                            {stat.trend === 'up' ? 'trending_up' : 'trending_down'}
                          </span>
                        )}
                        {stat.extra}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <span className={`h-2 w-2 rounded-full ${stat.statusColor} mr-2`}></span>
                  {stat.status}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resource Utilization */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Resource Utilization</h3>
              <div className="flex space-x-2">
                <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">Cluster A</span>
                <span className="px-2 py-1 text-xs font-medium rounded bg-pink-500/10 text-pink-500">Live</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {RESOURCE_USAGE.map(resource => (
                <div key={resource.label} className="flex flex-col items-center">
                  <div className="relative h-32 w-32">
                    <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200 dark:text-gray-700"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className={resource.color}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray={`${resource.value}, 100`}
                        strokeWidth="3"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{resource.value}%</span>
                      <span className="text-xs text-gray-500">{resource.label}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">{resource.unit}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Game Server Instances</span>
                  <span className="text-gray-500">12/20 Nodes Active</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-600 dark:text-gray-300">WebSocket Connections</span>
                  <span className="text-gray-500">8.4k / 10k Capacity</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-pink-500 h-2.5 rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Logs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col h-[400px]">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <span className="material-icons mr-2 text-gray-500">terminal</span>
                Live Error Logs
              </h3>
              <div className="flex space-x-2">
                <button className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-50">Clear</button>
                <button className="text-xs bg-pink-500 text-white rounded px-2 py-1 hover:bg-pink-600">Pause</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lvl</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-xs font-mono">
                  {ERROR_LOGS.map((log, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-500">{log.time}</td>
                      <td className="px-4 py-2 whitespace-nowrap"><span className={`${log.levelColor} font-bold`}>{log.level}</span></td>
                      <td className="px-4 py-2 whitespace-nowrap text-indigo-500">{log.service}</td>
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Service Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Service Status Monitor</h3>
          </div>
          <div className="p-6 space-y-6">
            {SERVICES.map(service => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${service.iconBg} flex items-center justify-center`}>
                    <span className={`material-icons ${service.iconColor}`}>{service.icon}</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</p>
                    <p className="text-xs text-gray-500">{service.version} • {service.region}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {service.status === 'Operational' ? (
                    <span className="flex h-3 w-3 relative mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  ) : (
                    <span className={`h-3 w-3 rounded-full ${service.statusColor} mr-2`}></span>
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">{service.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
            <a href="#" className="text-sm font-medium text-pink-500 hover:text-pink-600 flex items-center">
              View full service topology
              <span className="material-icons text-sm ml-1">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
