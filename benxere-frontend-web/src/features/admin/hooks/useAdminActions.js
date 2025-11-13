import { useState, useCallback } from 'react';
import * as adminService from '../services/adminService';
import { AdminActionTypes } from '../types';

/**
 * Custom hook for managing admin actions
 * @returns {Object} Admin actions and state
 */
export const useAdminActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionResult, setActionResult] = useState(null);

  /**
   * Reset state
   */
  const resetState = useCallback(() => {
    setError(null);
    setActionResult(null);
  }, []);

  /**
   * Update user status or role
   * @param {string} userId 
   * @param {Object} updates 
   */
  const updateUser = useCallback(async (userId, updates) => {
    setLoading(true);
    resetState();
    try {
      const result = await adminService.updateUser(userId, updates);
      setActionResult({
        success: true,
        message: 'User updated successfully',
        data: result,
      });
      return result;
    } catch (err) {
      setError(err.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [resetState]);

  /**
   * Update role permissions
   * @param {string} roleId 
   * @param {string[]} permissionIds 
   */
  const updateRolePermissions = useCallback(async (roleId, permissionIds) => {
    setLoading(true);
    resetState();
    try {
      const result = await adminService.updateRolePermissions(roleId, permissionIds);
      setActionResult({
        success: true,
        message: 'Role permissions updated successfully',
        data: result,
      });
      return result;
    } catch (err) {
      setError(err.message || 'Failed to update role permissions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [resetState]);

  /**
   * Process bus owner verification
   * @param {string} userId 
   * @param {boolean} approved 
   * @param {string} [reason] 
   */
  const processBusOwnerVerification = useCallback(async (userId, approved, reason) => {
    setLoading(true);
    resetState();
    try {
      const result = await adminService.manageBusOwnerVerification(userId, approved, reason);
      setActionResult({
        success: true,
        message: `Bus owner ${approved ? 'approved' : 'rejected'} successfully`,
        data: result,
      });
      return result;
    } catch (err) {
      setError(err.message || 'Failed to process verification');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [resetState]);

  /**
   * Update system settings
   * @param {Object} settings 
   */
  const updateSettings = useCallback(async (settings) => {
    setLoading(true);
    resetState();
    try {
      const result = await adminService.updateSystemSettings(settings);
      setActionResult({
        success: true,
        message: 'Settings updated successfully',
        data: result,
      });
      return result;
    } catch (err) {
      setError(err.message || 'Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [resetState]);

  /**
   * Perform a generic admin action
   * @param {string} actionType 
   * @param {string} targetId 
   * @param {Object} [data] 
   */
  const performAction = useCallback(async (actionType, targetId, data = {}) => {
    setLoading(true);
    resetState();
    try {
      let result;
      
      switch (actionType) {
        case AdminActionTypes.BLOCK:
          result = await updateUser(targetId, { isActive: false });
          break;
        case AdminActionTypes.UNBLOCK:
          result = await updateUser(targetId, { isActive: true });
          break;
        case AdminActionTypes.GRANT_ACCESS:
          result = await updateUser(targetId, { role: data.role });
          break;
        case AdminActionTypes.REVOKE_ACCESS:
          result = await updateUser(targetId, { role: 'user' });
          break;
        default:
          throw new Error(`Unsupported action type: ${actionType}`);
      }

      setActionResult({
        success: true,
        message: 'Action completed successfully',
        data: result,
      });
      return result;
    } catch (err) {
      setError(err.message || 'Failed to perform action');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateUser, resetState]);

  return {
    // State
    loading,
    error,
    actionResult,
    
    // Actions
    updateUser,
    updateRolePermissions,
    processBusOwnerVerification,
    updateSettings,
    performAction,
    resetState,
  };
};