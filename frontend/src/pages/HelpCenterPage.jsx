import { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const FAQ_DATA = [
  {
    category: 'Gameplay & Rules',
    icon: 'sports_esports',
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
    questions: [
      { q: 'How do I start a new game?', a: 'From the lobby, select a game type and click "Quick Match" to find an opponent or "Create Lobby" to invite friends.' },
      { q: 'What are the different game modes?', a: 'We offer Casual, Ranked, and Tournament modes. Ranked matches affect your ELO rating. Tournament mode is for competitive events.' },
      { q: 'How does the ranking system work?', a: 'Rankings are based on the ELO rating system. Winning against higher-rated opponents gives more points.' },
    ],
  },
  {
    category: 'Account & Profile',
    icon: 'manage_accounts',
    color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    questions: [
      { q: 'How do I change my display name?', a: 'Go to Profile Settings, click on your username, and enter a new name. Names must be unique and follow our community guidelines.' },
      { q: 'Can I link multiple accounts?', a: 'Yes, you can link Google, Discord, and Steam accounts in the "Linked Accounts" section of your profile settings.' },
      { q: 'How do I delete my account?', a: 'Visit Account Settings > Privacy > Delete Account. This action is irreversible and data cannot be restored after 30 days.' },
    ],
  },
  {
    category: 'Technical Issues',
    icon: 'build',
    color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    questions: [
      { q: 'The game is lagging, what can I do?', a: 'Try refreshing the page, clearing cache, or using a wired connection. Check our server status page for any ongoing issues.' },
      { q: 'Why can\'t I connect to a match?', a: 'This can happen due to network issues. Check your firewall settings and ensure WebSockets are not blocked.' },
      { q: 'How do I report a bug?', a: 'Use the "Report Bug" button in the menu or email bugs@pixelheartgames.com with steps to reproduce the issue.' },
    ],
  },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (category, index) => {
    const key = `${category}-${index}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
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
                <span className="border-b-2 border-pink-500 text-gray-900 dark:text-white px-1 pt-1 text-sm font-medium">Help Center</span>
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

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-pink-500 to-indigo-600 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Help Center</h1>
          <p className="mt-4 text-lg text-pink-100">Find answers to common questions and get support.</p>
          <div className="mt-8 max-w-xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-icons text-gray-400">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="block w-full pl-12 pr-4 py-4 border-0 rounded-xl shadow-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-pink-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* FAQ Sections */}
        <div className="space-y-8">
          {FAQ_DATA.map((section) => (
            <div key={section.category} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <span className={`material-icons ${section.color} p-2 rounded-lg mr-3`}>{section.icon}</span>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{section.category}</h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {section.questions.map((item, idx) => {
                  const key = `${section.category}-${idx}`;
                  const isOpen = openItems[key];
                  return (
                    <div key={idx}>
                      <button
                        onClick={() => toggleItem(section.category, idx)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.q}</span>
                        <span className={`material-icons text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4 text-sm text-gray-600 dark:text-gray-300">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <span className="material-icons text-pink-500 text-4xl mb-2">contact_support</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Still need help?</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Submit a question and our support team will get back to you.</p>
          </div>
          <form className="space-y-6 max-w-lg mx-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <input
                type="text"
                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-pink-500 focus:border-pink-500"
                placeholder="What do you need help with?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea
                rows="4"
                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-pink-500 focus:border-pink-500"
                placeholder="Describe your issue in detail..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
            >
              <span className="material-icons mr-2">send</span>
              Submit Question
            </button>
          </form>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="#" className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <span className="material-icons text-blue-500 mr-4">support_agent</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Contact Support</p>
              <p className="text-sm text-gray-500">support@pixelheartgames.com</p>
            </div>
          </a>
          <a href="#" className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <span className="material-icons text-purple-500 mr-4">forum</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Community Forum</p>
              <p className="text-sm text-gray-500">Join discussions with other players</p>
            </div>
          </a>
        </div>
      </main>
    </div>
  );
}
