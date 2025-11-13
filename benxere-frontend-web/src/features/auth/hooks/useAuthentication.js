import { useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as authService from '../services/authService';
import { AuthStatus } from '../types';

/**
 * Custom hook for handling authentication operations
 * @returns {Object} Authentication methods and state
 */
export const useAuthentication = () => {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle user login
   * @param {Object} credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   * @returns {Promise<boolean>}
   */
  const handleLogin = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const success = await auth.login(credentials);
      return success;
    } catch (err) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [auth]);

  /**
   * Handle user registration
   * @param {import('../types').RegisterData} userData
   * @returns {Promise<boolean>}
   */
  const handleRegister = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(userData);
      // Automatically log in after successful registration
      return await handleLogin({
        email: userData.email,
        password: userData.password,
      });
    } catch (err) {
      setError(err.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleLogin]);

  /**
   * Handle password reset request
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  const handlePasswordReset = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      await authService.requestPasswordReset(email);
      return true;
    } catch (err) {
      setError(err.message || 'Password reset request failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle password update
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<boolean>}
   */
  const handlePasswordUpdate = useCallback(async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      await authService.updatePassword(currentPassword, newPassword);
      return true;
    } catch (err) {
      setError(err.message || 'Password update failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle user logout
   * @returns {Promise<void>}
   */
  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      await auth.logout();
    } catch (err) {
      setError(err.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, [auth]);

  /**
   * Clear any authentication errors
   */
  const clearError = useCallback(() => {
    setError(null);
    auth.resetError();
  }, [auth]);

  return {
    // State
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isAdmin: auth.isAdmin,
    isBusOwner: auth.isBusOwner,
    status: auth.status,
    loading: loading || auth.status === AuthStatus.AUTHENTICATING,
    error: error || auth.error,
    
    // Methods
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    requestPasswordReset: handlePasswordReset,
    updatePassword: handlePasswordUpdate,
    clearError,
  };
};