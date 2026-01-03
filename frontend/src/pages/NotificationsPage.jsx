import { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'game_invite',
    icon: 'sports_esports',
    iconColor: 'text-pink-500',
    iconBg: 'bg-pink-100 dark:bg-pink-900/30',
    title: 'Game Invitation',
    message: 'Alex Kim has invited you to play Pixel Dots.',
    time: '5 minutes ago',
    read: false,
    actions: ['Accept', 'Decline'],
  },
  {
    id: 2,
    type: 'friend_request',
    icon: 'person_add',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    title: 'Friend Request',
    message: 'Sarah Miller wants to add you as a friend.',
    time: '1 hour ago',
    read: false,
    actions: ['Accept', 'Ignore'],
  },
  {
    id: 3,
    type: 'system',
    icon: 'build',
    iconColor: 'text-yellow-500',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Dec 25, 2023 from 2:00 AM - 4:00 AM UTC.',
    time: '3 hours ago',
    read: true,
    actions: [],
  },
  {
    id: 4,
    type: 'tournament',
    icon: 'emoji_events',
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    title: 'Tournament Results',
    message: 'You placed 3rd in the Weekly Chess Championship! 🎉',
    time: 'Yesterday',
    read: true,
    actions: ['View Results'],
  },
  {
    id: 5,
    type: 'security',
    icon: 'security',
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    title: 'Security Alert',
    message: 'New login detected from Chrome on Windows. Was this you?',
    time: '2 days ago',
    read: true,
    actions: ['Yes', 'No, secure my account'],
  },
];

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'mentions', label: 'Mentions' },
  { id: 'game_invites', label: 'Game Invites' },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'game_invites') return n.type === 'game_invite';
    if (activeTab === 'mentions') return n.type === 'friend_request';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="material-icons text-pink-500 text-3xl mr-2">grid_on</span>
                <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">PixelHeart Games</span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8 items-center">
                <Link to="/" className="border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200 px-1 pt-1 text-sm font-medium">Lobby</Link>
                <Link to="/leaderboard" className="border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200 px-1 pt-1 text-sm font-medium">Leaderboard</Link>
                <span className="border-b-2 border-pink-500 text-gray-900 dark:text-white px-1 pt-1 text-sm font-medium">Notifications</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/profile" className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">P</div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-icons text-sm mr-1">done_all</span>
              Mark All as Read
            </button>
            <button
              onClick={clearAll}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-icons text-sm mr-1">delete_sweep</span>
              Clear All
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons text-4xl text-gray-300 dark:text-gray-600">notifications_off</span>
              <p className="mt-2 text-gray-500 dark:text-gray-400">No notifications</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-lg border ${
                  notification.read
                    ? 'border-gray-200 dark:border-gray-700'
                    : 'border-pink-300 dark:border-pink-800 ring-1 ring-pink-100 dark:ring-pink-900/30'
                } p-4 transition-all hover:shadow-md`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${notification.iconBg} flex items-center justify-center`}>
                    <span className={`material-icons ${notification.iconColor}`}>{notification.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                      {!notification.read && (
                        <span className="flex-shrink-0 w-2 h-2 bg-pink-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400">{notification.time}</span>
                      {notification.actions.length > 0 && (
                        <div className="flex space-x-2">
                          {notification.actions.map((action, idx) => (
                            <button
                              key={idx}
                              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                                idx === 0
                                  ? 'bg-pink-500 text-white hover:bg-pink-600'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
