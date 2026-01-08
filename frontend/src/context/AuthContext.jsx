import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import socketService from '../services/socketService';
import apiService from '../services/apiService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = apiService.getToken();
      const savedUser = apiService.getCurrentUser();
      
      if (token && savedUser) {
        try {
          // Verify token is still valid
          const profile = await apiService.getProfile();
          setUser(profile);
          apiService.setCurrentUser(profile);
          
          // Connect socket
          socketService.connect(token);
        } catch {
          // Token expired or invalid
          apiService.setToken(null);
          apiService.setCurrentUser(null);
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const data = await apiService.login(email, password);
      setUser(data);
      apiService.setCurrentUser(data);
      
      // Connect socket after login
      socketService.connect(data.token);
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    setError(null);
    try {
      const data = await apiService.register(username, email, password);
      setUser(data);
      apiService.setCurrentUser(data);
      
      // Connect socket after register
      socketService.connect(data.token);
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.logout();
      socketService.disconnect();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    try {
      const updated = await apiService.updateProfile(data);
      setUser(updated);
      apiService.setCurrentUser(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
