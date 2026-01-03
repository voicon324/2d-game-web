import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Suspense, lazy } from 'react';

// Loading component for lazy-loaded pages
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// Lazy load pages for better performance
// Core pages (load immediately)
const LoginPage = lazy(() => import('./pages/LoginPage'));
const HomePage = lazy(() => import('./pages/HomePage'));

// Game pages (heavy - load on demand)
const GameBoardPage = lazy(() => import('./pages/GameBoardPage'));

// Secondary pages (load on demand)
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const TournamentsPage = lazy(() => import('./pages/TournamentsPage'));
const FriendsPage = lazy(() => import('./pages/FriendsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SpectatePage = lazy(() => import('./pages/SpectatePage'));
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const GameRulesPage = lazy(() => import('./pages/GameRulesPage'));

// Admin pages (rarely accessed - lazy load)
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminGamesPage = lazy(() => import('./pages/admin/AdminGamesPage'));
const AdminTournamentsPage = lazy(() => import('./pages/admin/AdminTournamentsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminSystemHealthPage = lazy(() => import('./pages/admin/AdminSystemHealthPage'));

// New pages (to be added)
const MatchmakingPage = lazy(() => import('./pages/MatchmakingPage').catch(() => ({ default: () => <div>Matchmaking Coming Soon</div> })));
const ReplayPlayerPage = lazy(() => import('./pages/ReplayPlayerPage').catch(() => ({ default: () => <div>Replay Coming Soon</div> })));
const AdminGameEditorPage = lazy(() => import('./pages/admin/AdminGameEditorPage').catch(() => ({ default: () => <div>Editor Coming Soon</div> })));

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/game" element={<GameBoardPage />} />
            <Route path="/game/:id" element={<GameBoardPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/spectate" element={<SpectatePage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/rules" element={<GameRulesPage />} />
            <Route path="/rules/:game" element={<GameRulesPage />} />
            
            {/* New Routes */}
            <Route path="/matchmaking" element={<MatchmakingPage />} />
            <Route path="/matchmaking/:gameSlug" element={<MatchmakingPage />} />
            <Route path="/replay/:matchId" element={<ReplayPlayerPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="games" element={<AdminGamesPage />} />
              <Route path="games/:id/editor" element={<AdminGameEditorPage />} />
              <Route path="tournaments" element={<AdminTournamentsPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="system" element={<AdminSystemHealthPage />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
