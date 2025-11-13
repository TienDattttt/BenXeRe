import API from '../../../services/api';

/**
 * Error class for authentication-related errors
 */
export class AuthError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Token storage keys
 */
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Token management functions
 */
export const TokenService = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  
  getUser: () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  
  clear: () => {
    TokenService.removeToken();
    TokenService.removeUser();
  },
};

/**
 * Authenticate user with credentials
 * @param {import('../types').AuthCredentials} credentials
 * @returns {Promise<{ authenticated: boolean, user: import('../types').User }>}
 * @throws {AuthError}
 */
export const authenticate = async (credentials) => {
  try {
    const response = await API.post('/api/auth/login', credentials);
    const { token, user } = response.data;
    
    if (token && user) {
      TokenService.setToken(token);
      TokenService.setUser(user);
      return { authenticated: true, user };
    }
    
    throw new AuthError('Invalid response from server', 'INVALID_RESPONSE');
  } catch (error) {
    if (error instanceof AuthError) throw error;
    
    throw new AuthError(
      error?.response?.data?.message || 'Authentication failed',
      'AUTH_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Register a new user
 * @param {import('../types').RegisterData} userData
 * @returns {Promise<{ user: import('../types').User }>}
 * @throws {AuthError}
 */
export const register = async (userData) => {
  try {
    const response = await API.post('/api/auth/register', userData);
    return { user: response.data.user };
  } catch (error) {
    throw new AuthError(
      error?.response?.data?.message || 'Registration failed',
      'REGISTER_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Verify the current authentication token
 * @returns {Promise<{ isValid: boolean, user: import('../types').User }>}
 */
export const verifyToken = async () => {
  const token = TokenService.getToken();
  if (!token) {
    return { isValid: false, user: null };
  }

  try {
    const response = await API.post('/api/auth/verify', { token });
    return { isValid: true, user: response.data.user };
  } catch (error) {
    TokenService.clear();
    return { isValid: false, user: null };
  }
};

/**
 * Request a password reset
 * @param {string} email
 * @returns {Promise<{ success: boolean }>}
 * @throws {AuthError}
 */
export const requestPasswordReset = async (email) => {
  try {
    await API.post('/api/auth/reset-password', { email });
    return { success: true };
  } catch (error) {
    throw new AuthError(
      error?.response?.data?.message || 'Failed to request password reset',
      'RESET_REQUEST_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Reset password with token
 * @param {string} token
 * @param {string} newPassword
 * @returns {Promise<{ success: boolean }>}
 * @throws {AuthError}
 */
export const resetPassword = async (token, newPassword) => {
  try {
    await API.post('/api/auth/reset-password/confirm', {
      token,
      newPassword,
    });
    return { success: true };
  } catch (error) {
    throw new AuthError(
      error?.response?.data?.message || 'Failed to reset password',
      'RESET_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Update user's password
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<{ success: boolean }>}
 * @throws {AuthError}
 */
export const updatePassword = async (currentPassword, newPassword) => {
  try {
    const response = await API.post(
      '/api/auth/update-password',
      { currentPassword, newPassword },
      {
        headers: { Authorization: `Bearer ${TokenService.getToken()}` },
      }
    );
    return { success: true };
  } catch (error) {
    throw new AuthError(
      error?.response?.data?.message || 'Failed to update password',
      'UPDATE_PASSWORD_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Logout the current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  const token = TokenService.getToken();
  if (token) {
    try {
      await API.post('/api/auth/logout', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  TokenService.clear();
};