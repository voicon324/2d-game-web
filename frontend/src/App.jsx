import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import GameBoardPage from './pages/GameBoardPage';
import LeaderboardPage from './pages/LeaderboardPage';
import TournamentsPage from './pages/TournamentsPage';
import FriendsPage from './pages/FriendsPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import SpectatePage from './pages/SpectatePage';
import HelpCenterPage from './pages/HelpCenterPage';
import AboutPage from './pages/AboutPage';
import GameRulesPage from './pages/GameRulesPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminGamesPage from './pages/admin/AdminGamesPage';
import AdminTournamentsPage from './pages/admin/AdminTournamentsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSystemHealthPage from './pages/admin/AdminSystemHealthPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
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
          
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="games" element={<AdminGamesPage />} />
            <Route path="tournaments" element={<AdminTournamentsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="system" element={<AdminSystemHealthPage />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
