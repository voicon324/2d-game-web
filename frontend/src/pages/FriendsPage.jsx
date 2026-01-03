import { useState, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import Button from '../components/Button';
import api from '../services/api';

const FRIENDS_DATA = [
  { id: 1, name: 'Jane Doe', initials: 'JD', status: 'in-game', statusText: 'In Game', gradient: 'from-pink-400 to-orange-400' },
  { id: 2, name: 'Alex Smith', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', status: 'online', statusText: 'Online' },
  { id: 3, name: 'Mike Knight', initials: 'MK', status: 'away', statusText: 'Away - 15m', bgColor: 'bg-slate-200 dark:bg-slate-700', textColor: 'text-slate-500 dark:text-slate-300' },
  { id: 4, name: 'Sarah Connor', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', status: 'offline', statusText: 'Offline - 2h ago' },
  { id: 5, name: 'Tom Riddle', initials: 'TR', status: 'offline', statusText: 'Offline - 5d ago', bgColor: 'bg-indigo-100 dark:bg-indigo-900/50', textColor: 'text-indigo-500 dark:text-indigo-300' },
];

const STATUS_COLORS = {
  online: 'bg-green-500',
  'in-game': 'bg-green-500',
  away: 'bg-amber-500',
  offline: 'bg-slate-400',
};

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [friends, setFriends] = useState(FRIENDS_DATA);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  // Initial load
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await api.users.getFriends();
        // data structure: { friends: [], requests: [] }
       
        // Transform backend data to UI format if needed, or assume backend matches
        // For now, let's map backend user objects to our UI objects
        const mappedFriends = (data.friends || []).map(f => ({
          id: f._id,
          name: f.username,
          initials: f.username.substring(0, 2).toUpperCase(),
          status: f.isOnline ? 'online' : 'offline', 
          statusText: f.isOnline ? 'Online' : 'Offline',
          avatar: f.avatar
        }));
        
        setFriends(mappedFriends);
      } catch (err) {
        console.error('Failed to fetch friends', err);
      }
    };
    fetchFriends();
  }, []);
  const handleAddFriend = async () => {
    if (!newFriendUsername.trim()) return;
    try {
      await api.users.addFriend(newFriendUsername);
      alert('Friend request sent!');
      setNewFriendUsername('');
      setShowAddModal(false);
    } catch (error) {
      console.error(error);
      alert('Failed to send request');
    }
  };

  const filteredFriends = friends.filter(friend => {
    const matchesSearch = friend.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'online' && (friend.status === 'online' || friend.status === 'in-game')) ||
      (activeFilter === 'pending');
    return matchesSearch && matchesFilter;
  });

  const removeFriend = (id) => {
    if (window.confirm('Remove this friend?')) {
      setFriends(friends.filter(f => f.id !== id));
    }
  };

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
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-[480px] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 relative flex flex-col h-[85vh] max-h-[700px]">
          {/* Gradient Header */}
          <div className="h-1.5 w-full bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 flex-shrink-0"></div>
          
          {/* Header */}
          <div className="p-6 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  My Friends
                  <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-500 text-xs font-bold px-2 py-0.5 rounded-full">
                    {friends.length}
                  </span>
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Manage your game connections
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="p-2 bg-slate-50 dark:bg-slate-700 rounded-xl text-pink-500 hover:bg-pink-50 dark:hover:bg-slate-600 transition-colors shadow-sm border border-slate-100 dark:border-slate-600"
              >
                <span className="material-icons-round text-2xl">person_add</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500 group-focus-within:text-pink-500 transition-colors">
                <span className="material-icons-round text-xl">search</span>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
                className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm font-medium"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All Friends' },
                { id: 'online', label: `Online (${friends.filter(f => f.status === 'online' || f.status === 'in-game').length})` },
                { id: 'pending', label: 'Pending' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    activeFilter === tab.id
                      ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/20'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Friends List */}
          <div className="flex-grow overflow-y-auto p-6 pt-2 space-y-3">
            {filteredFriends.map(friend => (
              <div 
                key={friend.id}
                className={`flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 hover:border-pink-200 dark:hover:border-pink-900/50 transition-all group ${friend.status === 'offline' ? 'opacity-75 hover:opacity-100' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`relative ${friend.status === 'offline' ? 'grayscale' : ''}`}>
                    {friend.avatar ? (
                      <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full ${friend.gradient ? `bg-gradient-to-tr ${friend.gradient}` : friend.bgColor || 'bg-slate-200 dark:bg-slate-700'} flex items-center justify-center text-${friend.gradient ? 'white' : ''} ${friend.textColor || ''} font-bold text-sm shadow-sm`}>
                        {friend.initials}
                      </div>
                    )}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${STATUS_COLORS[friend.status]} border-2 border-white dark:border-slate-800 rounded-full`}></div>
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${friend.status === 'offline' ? 'text-slate-600 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {friend.name}
                    </h3>
                    <p className={`text-[10px] font-semibold ${friend.status === 'in-game' ? 'text-green-500 flex items-center gap-1' : 'text-slate-500 dark:text-slate-400'}`}>
                      {friend.statusText}
                      {friend.status === 'in-game' && <span className="w-1 h-1 rounded-full bg-green-500"></span>}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors" title="Message">
                    <span className="material-icons-round text-lg">{friend.status === 'offline' ? 'mail_outline' : 'chat_bubble_outline'}</span>
                  </button>
                  <button 
                    onClick={() => removeFriend(friend.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" 
                    title="Remove"
                  >
                    <span className="material-icons-round text-lg">person_remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto bg-slate-50 dark:bg-slate-800/50">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" icon="share">
                Invite Friend
              </Button>
              <Button icon="videogame_asset">
                Play Now
              </Button>
            </div>
          </div>
        </div>

        {/* Add Friend Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 w-full max-w-sm relative">
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-icons-round">close</span>
              </button>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Add Friend</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Enter a username or share your code.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                    Username or Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Gamer123"
                      value={newFriendUsername}
                      onChange={(e) => setNewFriendUsername(e.target.value)}
                      className="block w-full pl-4 pr-16 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                    <button 
                      onClick={handleAddFriend}
                      className="absolute inset-y-0 right-0 px-3 text-pink-500 font-bold text-sm hover:text-pink-600"
                    >
                      ADD
                    </button>
                  </div>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold">OR</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                </div>

                <div className="text-center">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">Your Friend Code</p>
                  <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-3 flex items-center justify-between border border-dashed border-slate-300 dark:border-slate-600 group cursor-pointer hover:border-pink-500 transition-colors">
                    <span className="text-lg font-mono font-bold text-slate-800 dark:text-white tracking-widest ml-2">
                      #8X92K
                    </span>
                    <span className="material-icons-round text-slate-400 group-hover:text-pink-500 transition-colors text-lg">
                      content_copy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
