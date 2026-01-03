import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const TEAM_MEMBERS = [
  { name: 'Maya Chen', role: 'Lead Designer', avatar: 'MC', color: 'from-pink-400 to-rose-500' },
  { name: 'David Park', role: 'Game Developer', avatar: 'DP', color: 'from-blue-400 to-indigo-500' },
  { name: 'Elena Rodriguez', role: 'Community Manager', avatar: 'ER', color: 'from-amber-400 to-orange-500' },
  { name: 'Alex Turner', role: 'Backend Engineer', avatar: 'AT', color: 'from-purple-400 to-violet-500' },
];

const STATS = [
  { value: '15+', label: 'Game Modes' },
  { value: '2M+', label: 'Matches Played' },
  { value: '24/7', label: 'Support' },
];

export default function AboutPage() {
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
                <span className="border-b-2 border-pink-500 text-gray-900 dark:text-white px-1 pt-1 text-sm font-medium">About</span>
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
      <section className="relative bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <span className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-8">
            <span className="material-icons text-white text-4xl">favorite</span>
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-6">
            About PixelHeart Games
          </h1>
          <p className="text-xl text-pink-100 max-w-2xl mx-auto leading-relaxed">
            We're on a mission to bring people together through the timeless joy of board games, 
            reimagined for the digital age with modern design and seamless multiplayer experiences.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700">
          {STATS.map(stat => (
            <div key={stat.label} className="py-8 px-6 text-center">
              <p className="text-3xl font-bold text-pink-500">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="material-icons text-pink-500 text-4xl mb-4">rocket_launch</span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
          At PixelHeart Games, we believe that great games create lasting memories. Our platform combines 
          classic board game mechanics with modern technology, making it easy to play with friends and 
          family no matter where they are in the world. We're committed to creating a welcoming community 
          where players of all skill levels can enjoy the thrill of competition and the joy of play.
        </p>
      </section>

      {/* Team */}
      <section className="bg-white dark:bg-gray-800 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="material-icons text-pink-500 text-4xl mb-4">groups</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meet the Team</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">The passionate people behind PixelHeart Games</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {TEAM_MEMBERS.map(member => (
              <div key={member.name} className="text-center group">
                <div className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-105 transition-transform`}>
                  {member.avatar}
                </div>
                <p className="mt-4 font-medium text-gray-900 dark:text-white">{member.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          </div>
          <div className="relative">
            <span className="material-icons text-white text-4xl mb-4">mail</span>
            <h2 className="text-2xl font-bold text-white mb-4">Get in Touch</h2>
            <p className="text-pink-100 mb-8 max-w-md mx-auto">
              Have questions, suggestions, or just want to say hello? We'd love to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a href="mailto:hello@pixelheartgames.com" className="inline-flex items-center px-6 py-3 bg-white text-pink-600 font-medium rounded-lg hover:bg-gray-100 transition-colors">
                <span className="material-icons mr-2">email</span>
                hello@pixelheartgames.com
              </a>
              <a href="mailto:support@pixelheartgames.com" className="inline-flex items-center px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors">
                <span className="material-icons mr-2">support_agent</span>
                support@pixelheartgames.com
              </a>
            </div>
            <form className="max-w-lg mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50"
                />
                <input
                  type="text"
                  placeholder="Your message"
                  className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          © 2024 PixelHeart Games, Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
