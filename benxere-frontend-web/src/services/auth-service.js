/**
 * Authentication Service
 * Handles user authentication, token management, and user information
 */
class AuthService {
  /**
   * Get the authentication token from local storage
   * @returns {string|null} The authentication token
   */
  getToken() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('No authentication token found in local storage');
      return null;
    }
    
    // Validate token format
    if (!this.isValidJwt(token)) {
      console.warn('Invalid token format in local storage');
      return null;
    }
    
    return token;
  }
  
  /**
   * Check if a string is a valid JWT token format
   * @param {string} token - The token to validate
   * @returns {boolean} True if valid JWT format
   */
  isValidJwt(token) {
    // Basic JWT format validation (three parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // Try to decode the payload
    try {
      JSON.parse(atob(parts[1]));
      return true;
    } catch (e) {
      console.error('Error parsing JWT payload:', e);
      return false;
    }
  }
  
  /**
   * Set the authentication token in local storage
   * @param {string} token - The authentication token
   */
  setToken(token) {
    if (!token) {
      console.warn('Attempted to store empty token');
      return;
    }
    
    if (!this.isValidJwt(token)) {
      console.warn('Attempted to store invalid token format');
      return;
    }
    
    localStorage.setItem('token', token);
    console.log('Token stored successfully');
  }
  
  /**
   * Remove the authentication token from local storage
   */
  removeToken() {
    localStorage.removeItem('token');
    console.log('Token removed from storage');
  }
  
  /**
   * Check if the user is authenticated
   * @returns {boolean} True if the user is authenticated
   */
  isAuthenticated() {
    const token = this.getToken();
    
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      const isExpired = Date.now() >= expiry;
      
      if (isExpired) {
        console.warn('Token is expired. Expiry:', new Date(expiry).toISOString(), 'Current:', new Date().toISOString());
      }
      
      return !isExpired;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return false;
    }
  }
  
  /**
   * Get the current user's ID from the token
   * @returns {string|null} The user ID or null if not authenticated
   */
  getUserId() {
    if (!this.isAuthenticated()) {
      return null;
    }
    
    try {
      const token = this.getToken();
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const userId = payload.userId || payload.sub || payload.id;
      
      if (!userId) {
        console.warn('No user ID found in token payload:', payload);
      }
      
      return userId;
    } catch (error) {
      console.error('Error getting user ID from token:', error);
      return null;
    }
  }
  
  /**
   * Get the current user's role from the token
   * @returns {string|null} The user role or null if not authenticated
   */
  getUserRole() {
    if (!this.isAuthenticated()) {
      return null;
    }
    
    try {
      const token = this.getToken();
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Handle different role formats
      const role = payload.role || 
                 (payload.roles && payload.roles.length > 0 ? payload.roles[0] : null) ||
                 (payload.authorities && payload.authorities.length > 0 ? payload.authorities[0] : null);
      
      if (!role) {
        console.warn('No role found in token payload:', payload);
      }
      
      return role;
    } catch (error) {
      console.error('Error getting user role from token:', error);
      return null;
    }
  }
  
  /**
   * Get full token payload
   * @returns {Object|null} The token payload or null if not authenticated
   */
  getTokenPayload() {
    if (!this.isAuthenticated()) {
      return null;
    }
    
    try {
      const token = this.getToken();
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token payload:', error);
      return null;
    }
  }
  
  /**
   * Login the user
   * @param {string} email - The user's email
   * @param {string} password - The user's password
   * @returns {Promise<Object>} The user data
   */
  async login(email, password) {
    try {
      console.log(`Attempting login for user: ${email}`);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      
      if (!data.token) {
        console.error('Login response missing token:', data);
        throw new Error('Login response missing token');
      }
      
      this.setToken(data.token);
      console.log('Login successful');
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  /**
   * Logout the user
   */
  logout() {
    this.removeToken();
    // Redirect to login page or perform other logout actions
    window.location.href = '/auth';
  }
  
  /**
   * Refresh the authentication token
   * @returns {Promise<string>} The new token
   */
  async refreshToken() {
    try {
      console.log('Refreshing authentication token');
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token refresh failed:', response.status, errorText);
        throw new Error('Token refresh failed');
      }
      
      const data = await response.json();
      
      if (!data.token) {
        console.error('Refresh response missing token:', data);
        throw new Error('Refresh response missing token');
      }
      
      this.setToken(data.token);
      console.log('Token refreshed successfully');
      
      return data.token;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.removeToken();
      throw error;
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService; 