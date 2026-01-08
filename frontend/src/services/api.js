const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * API Service for backend communication
 */

// Helper for making authenticated requests
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };
  
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message);
  }
  
  return response.json();
}

// ===============================
// Auth API
// ===============================
export const authApi = {
  login: async (email, password) => {
    const data = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  },
  
  register: async (username, email, password) => {
    const data = await fetchWithAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  },
  
  logout: async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    await fetchWithAuth('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ userId: user._id })
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  googleLogin: async (idToken) => {
    const data = await fetchWithAuth('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken })
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  },

  facebookLogin: async (accessToken, userID) => {
    const data = await fetchWithAuth('/api/auth/facebook', {
      method: 'POST',
      body: JSON.stringify({ accessToken, userID })
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// ===============================
// Games API
// ===============================
export const gamesApi = {
  getAll: () => fetchWithAuth('/api/games'),
  
  getBySlug: (slug) => fetchWithAuth(`/api/games/${slug}`),
  
  getRooms: (slug) => fetchWithAuth(`/api/games/${slug}/rooms`),
  
  createRoom: (slug) => fetchWithAuth(`/api/games/${slug}/rooms`, {
    method: 'POST'
  }),
  
  joinRoom: (roomCode) => fetchWithAuth(`/api/games/rooms/${roomCode}/join`, {
    method: 'POST'
  }),
  
  // Admin only
  create: (gameData) => fetchWithAuth('/api/games', {
    method: 'POST',
    body: JSON.stringify(gameData)
  }),
  
  update: (id, gameData) => fetchWithAuth(`/api/games/${id}`, {
    method: 'PUT',
    body: JSON.stringify(gameData)
  })
};

// ===============================
// Users API
// ===============================
export const usersApi = {
  getProfile: () => fetchWithAuth('/api/users/profile'),
  
  updateProfile: (data) => fetchWithAuth('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  getLeaderboard: (gameSlug) => fetchWithAuth(`/api/users/leaderboard${gameSlug ? `?game=${gameSlug}` : ''}`),
  
  getFriends: () => fetchWithAuth('/api/users/friends'),
  
  addFriend: (userId) => fetchWithAuth(`/api/users/friends/${userId}`, {
    method: 'POST'
  }),
  
  removeFriend: (userId) => fetchWithAuth(`/api/users/friends/${userId}`, {
    method: 'DELETE'
  })
};

// ===============================
// Tournaments API
// ===============================
export const tournamentsApi = {
  getAll: (status) => fetchWithAuth(`/api/tournaments${status ? `?status=${status}` : ''}`),
  
  getById: (id) => fetchWithAuth(`/api/tournaments/${id}`),
  
  join: (id) => fetchWithAuth(`/api/tournaments/${id}/join`, {
    method: 'POST'
  }),
  
  // Admin only
  create: (data) => fetchWithAuth('/api/tournaments', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// ===============================
// Matches API
// ===============================
export const matchesApi = {
  getLive: () => fetchWithAuth('/api/matches/live'),
  
  getRecent: (limit) => fetchWithAuth(`/api/matches/recent?limit=${limit || 10}`),
  
  getByRoom: (roomCode) => fetchWithAuth(`/api/matches/${roomCode}`)
};

export default {
  auth: authApi,
  games: gamesApi,
  users: usersApi,
  tournaments: tournamentsApi,
  matches: matchesApi
};
