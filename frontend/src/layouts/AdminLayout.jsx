import { Link, useLocation, Outlet } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const SIDEBAR_ITEMS = [
  { path: '/admin', icon: 'dashboard', label: 'Dashboard' },
  { path: '/admin/users', icon: 'group', label: 'User Management' },
  { path: '/admin/games', icon: 'sports_esports', label: 'Games & Lobbies' },
  { path: '/admin/tournaments', icon: 'emoji_events', label: 'Tournaments' },
  { path: '/admin/analytics', icon: 'bar_chart', label: 'Analytics' },
  { path: '/admin/system', icon: 'dns', label: 'System Health' },
];

export default function AdminLayout() {
  const location = useLocation();

  const getCurrentPageTitle = () => {
    const item = SIDEBAR_ITEMS.find(i => location.pathname === i.path);
    return item ? item.label : 'Dashboard';
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 font-[Inter] h-screen overflow-hidden flex transition-colors duration-200 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-20">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <span className="material-icons text-pink-500 text-3xl mr-2">grid_on</span>
          <span className="font-bold text-lg tracking-tight">
            PixelHeart <span className="text-pink-500">Admin</span>
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-pink-500/10 text-pink-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="material-icons mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/admin/settings"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span className="material-icons mr-3">settings</span>
            Settings
          </Link>
          <Link
            to="/"
            className="flex items-center px-4 py-2 text-sm font-medium text-red-500 hover:text-red-700 transition-colors mt-1"
          >
            <span className="material-icons mr-3">logout</span>
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 z-10">
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <span className="material-icons">menu</span>
            </button>
            <span className="ml-3 font-bold text-lg">PixelHeart Admin</span>
          </div>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-2">Pages</span> / 
            <span className="ml-2 font-medium text-gray-900 dark:text-white">{getCurrentPageTitle()}</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-gray-400 text-sm">search</span>
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="focus:ring-pink-500 focus:border-pink-500 block w-64 pl-9 sm:text-sm border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white py-1.5"
              />
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
            
            <ThemeToggle />
            
            {/* Notifications */}
            <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none relative">
              <span className="material-icons">notifications</span>
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
            </button>

            {/* Avatar */}
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm border-2 border-pink-500">
                A
              </div>
              <span className="ml-3 font-medium text-sm hidden sm:block">Admin User</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
