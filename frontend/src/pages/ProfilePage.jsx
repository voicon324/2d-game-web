import ThemeToggle from '../components/ThemeToggle';

const STATS = [
  { icon: 'videogame_asset', value: '1,240', label: 'Games Played', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-500' },
  { icon: 'emoji_events', value: '856', label: 'Wins', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-500' },
  { icon: 'local_fire_department', value: '12', label: 'Day Streak', bgColor: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-500' },
  { icon: 'favorite', value: '98%', label: 'Reputation', bgColor: 'bg-pink-100 dark:bg-pink-900/30', textColor: 'text-pink-500' },
];

const ACHIEVEMENTS = [
  { unlocked: false }, { unlocked: false }, 
  { unlocked: true, color: 'bg-pink-500', title: 'First Love' },
  { unlocked: true, color: 'bg-pink-500', title: 'Cupid' },
  { unlocked: false }, { unlocked: false }, { unlocked: false },
  { unlocked: true, color: 'bg-orange-400', title: 'On Fire' },
  { unlocked: true, color: 'bg-orange-400', title: 'Hot Streak' },
  { unlocked: true, color: 'bg-orange-400', title: 'Burnout' },
  { unlocked: true, color: 'bg-orange-400', title: 'Phoenix' },
  { unlocked: false },
  { unlocked: true, color: 'bg-green-400', title: 'Beginner Luck' },
  { unlocked: true, color: 'bg-green-400', title: 'Environment' },
  { unlocked: true, color: 'bg-green-400', title: 'Recycler' },
  { unlocked: true, color: 'bg-green-400', title: 'Gardener' },
  { unlocked: true, color: 'bg-green-400', title: 'Forest' },
  { unlocked: true, color: 'bg-green-400', title: 'Earth Day' },
  { unlocked: false },
  { unlocked: true, color: 'bg-blue-400', title: 'Water World' },
  { unlocked: true, color: 'bg-blue-400', title: 'Deep Dive' },
  { unlocked: true, color: 'bg-blue-400', title: 'Splash' },
  { unlocked: true, color: 'bg-blue-400', title: 'Ocean' },
  { unlocked: false }, { unlocked: false }, { unlocked: false },
  { unlocked: true, color: 'bg-purple-400', title: 'Royalty' },
  { unlocked: true, color: 'bg-purple-400', title: 'Majestic' },
  { unlocked: false }, { unlocked: false }, { unlocked: false },
  { unlocked: false }, { unlocked: false }, { locked: true },
  { unlocked: false }, { unlocked: false },
];

const RECENT_ACTIVITY = [
  { icon: 'star', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', textColor: 'text-yellow-600', title: 'New High Score!', description: 'You scored 5,420 points in Classic Mode.', time: '2h ago' },
  { icon: 'emoji_events', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-600', title: 'Achievement Unlocked', description: 'Earned the "Green Thumb" badge.', time: '1d ago' },
];

export default function ProfilePage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 bg-dots min-h-screen flex flex-col transition-colors duration-300 font-[Quicksand]">
      {/* Top Nav */}
      <nav className="absolute top-0 right-0 p-4 sm:p-6 z-10 flex gap-3">
        <button className="p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-md hover:scale-105 active:scale-95 transition-all text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700">
          <span className="material-icons-round text-xl">logout</span>
        </button>
        <ThemeToggle />
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 relative flex flex-col">
          {/* Gradient Header */}
          <div className="h-1.5 w-full bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500"></div>
          
          <div className="flex flex-col md:flex-row h-full">
            {/* Left Panel - User Info */}
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700/50 p-8 flex flex-col items-center text-center bg-slate-50/50 dark:bg-slate-800/30">
              {/* Avatar */}
              <div className="relative group mb-6">
                <div className="w-32 h-32 rounded-full ring-4 ring-white dark:ring-slate-700 shadow-xl overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-1 scale-150">
                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                    <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                  </div>
                </div>
                <button className="absolute bottom-1 right-1 bg-pink-500 text-white p-2 rounded-full shadow-lg hover:bg-pink-600 transition-transform hover:scale-110">
                  <span className="material-icons-round text-sm">edit</span>
                </button>
              </div>

              {/* Name & Username */}
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Alex DotMaster</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4">@alex_connects</p>
              
              {/* Level Badge */}
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <span className="material-icons-round text-base">emoji_events</span>
                Level 42
              </div>

              {/* User Details */}
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                  <span className="text-slate-500 dark:text-slate-400">Email</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">alex@example.com</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                  <span className="text-slate-500 dark:text-slate-400">Member Since</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">Nov 2023</span>
                </div>
                <div className="flex justify-between items-center text-sm pb-1">
                  <span className="text-slate-500 dark:text-slate-400">Location</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">Global</span>
                </div>
              </div>

              {/* Edit Profile Button */}
              <button className="mt-8 w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all flex items-center justify-center gap-2">
                <span className="material-icons-round text-lg">settings</span>
                Edit Profile
              </button>
            </div>

            {/* Right Panel - Stats & Achievements */}
            <div className="w-full md:w-2/3 p-8 bg-white dark:bg-slate-800/20">
              {/* Statistics Header */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Statistics</h3>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-pink-500 transition-colors">
                    <span className="material-icons-round">bar_chart</span>
                  </button>
                  <button className="p-2 text-pink-500 bg-pink-500/10 rounded-lg">
                    <span className="material-icons-round">grid_view</span>
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {STATS.map((stat, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full ${stat.bgColor} ${stat.textColor} flex items-center justify-center mb-2`}>
                      <span className="material-icons-round">{stat.icon}</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</span>
                    <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* Achievements Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Achievements</h3>
                <a href="#" className="text-sm font-bold text-pink-500 hover:text-pink-600 transition-colors">View All</a>
              </div>

              {/* Achievements Grid */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50">
                <div className="grid grid-cols-6 sm:grid-cols-9 gap-3 sm:gap-4 place-items-center">
                  {ACHIEVEMENTS.map((achievement, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full ${
                        achievement.locked 
                          ? 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 border-dashed'
                          : achievement.unlocked 
                            ? `${achievement.color} shadow-md ring-2 ring-white dark:ring-slate-800 cursor-help`
                            : 'bg-slate-200 dark:bg-slate-700 opacity-20'
                      }`}
                      title={achievement.title || (achievement.locked ? 'Locked' : '')}
                    ></div>
                  ))}
                </div>
                <div className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                  Collecting colored dots unlocks badges
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {RECENT_ACTIVITY.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                      <div className={`w-10 h-10 rounded-xl ${activity.bgColor} ${activity.textColor} flex items-center justify-center shrink-0`}>
                        <span className="material-icons-round">{activity.icon}</span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{activity.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activity.description}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
