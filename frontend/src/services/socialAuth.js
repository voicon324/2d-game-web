

const socialAuth = {
  /**
   * Login/Register with Google
   * @param {string} idToken - The ID token from Google
   */
  googleLogin: async (idToken) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Google login failed');
      
      // Save user and token
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      
      return data;
    } catch (error) {
      console.error('Google Auth Error:', error);
      throw error;
    }
  },

  /**
   * Login/Register with Facebook
   * @param {string} accessToken - The access token from Facebook
   * @param {string} userID - The user ID from Facebook
   */
  facebookLogin: async (accessToken, userID) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/facebook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken, userID }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Facebook login failed');
      
      // Save user and token
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      
      return data;
    } catch (error) {
      console.error('Facebook Auth Error:', error);
      throw error;
    }
  }
};

export default socialAuth;
