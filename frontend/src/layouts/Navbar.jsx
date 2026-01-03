import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  
  // Get user from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  
  const navItems = [
    { path: '/', label: 'Lobby' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/tournaments', label: 'Tournaments' },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Nav Items */}
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="material-icons text-pink-500 text-3xl mr-2">grid_on</span>
              <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">
                PixelHeart Games
              </span>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8 items-center">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    border-b-2 px-1 pt-1 text-sm font-medium transition-colors
                    ${location.pathname === item.path
                      ? 'border-pink-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {/* Notifications */}
            <Link 
              to="/notifications"
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none relative"
            >
              <span className="material-icons">notifications</span>
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
            </Link>
            
            {/* User Avatar with Dropdown */}
            <div className="ml-3 relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 dark:focus:ring-offset-gray-800"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {user?.username?.[0]?.toUpperCase() || 'P'}
                </div>
              </button>
              
              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
                  {user ? (
                    <>
                      {/* User info */}
                      <div className="px-4 py-3 bg-gray-50 dark:bg-slate-900">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.username || 'Player'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email || 'player@example.com'}
                        </p>
                      </div>
                      
                      {/* Menu items */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="material-icons text-lg mr-3 text-gray-400">person</span>
                          My Profile
                        </Link>
                        <Link
                          to="/friends"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="material-icons text-lg mr-3 text-gray-400">people</span>
                          Friends
                        </Link>
                        <Link
                          to="/notifications"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="material-icons text-lg mr-3 text-gray-400">notifications</span>
                          Notifications
                        </Link>
                      </div>
                      
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <span className="material-icons text-lg mr-3">logout</span>
                          Sign out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Guest info */}
                      <div className="px-4 py-3 bg-gray-50 dark:bg-slate-900">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Welcome, Guest!
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Sign in to track your progress
                        </p>
                      </div>
                      
                      {/* Login/Register buttons */}
                      <div className="p-3 space-y-2">
                        <Link
                          to="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center justify-center w-full px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
                        >
                          <span className="material-icons text-lg mr-2">login</span>
                          Sign In
                        </Link>
                        <Link
                          to="/login?tab=register"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center justify-center w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                        >
                          <span className="material-icons text-lg mr-2">person_add</span>
                          Create Account
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
