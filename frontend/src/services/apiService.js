const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  /**
   * Set auth token
   * @param {string} token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  /**
   * Get auth token
   */
  getToken() {
    return this.token;
  }

  /**
   * Make API request
   * @param {string} endpoint
   * @param {Object} options
   */
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  // Auth endpoints
  async register(username, email, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    this.setToken(data.token);
    this.setCurrentUser(data);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    this.setCurrentUser(data);
    return data;
  }

  async logout() {
    const userId = this.getCurrentUser()?._id;
    this.setToken(null);
    localStorage.removeItem('user');
    if (userId) {
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
    }
  }

  // User endpoints
  async getProfile() {
    return this.request('/users/me');
  }

  async updateProfile(data) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getLeaderboard(limit = 50) {
    return this.request(`/users/leaderboard?limit=${limit}`);
  }

  async getOnlineUsers() {
    return this.request('/users/online');
  }

  // Game endpoints
  async getGames() {
    return this.request('/games');
  }

  async getGame(slug) {
    return this.request(`/games/${slug}`);
  }

  async getRooms(gameSlug) {
    return this.request(`/games/${gameSlug}/rooms`);
  }

  async createRoom(gameSlug) {
    return this.request(`/games/${gameSlug}/rooms`, {
      method: 'POST'
    });
  }

  async joinRoom(roomCode) {
    return this.request(`/games/rooms/${roomCode}/join`, {
      method: 'POST'
    });
  }

  // Helper methods
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }

  isAuthenticated() {
    return !!this.token;
  }
}

// Singleton instance
const apiService = new ApiService();
export default apiService;
