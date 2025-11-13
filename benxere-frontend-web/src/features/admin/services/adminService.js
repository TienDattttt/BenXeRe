import API from '../../../services/api';
import { TokenService } from '../../auth/services/authService';

/**
 * Error class for admin-related errors
 */
export class AdminError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'AdminError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Create headers with admin token
 * @private
 */
const createHeaders = () => ({
  Authorization: `Bearer ${TokenService.getToken()}`,
  'Content-Type': 'application/json',
});

/**
 * Get admin dashboard statistics
 * @returns {Promise<import('../types').AdminStats>}
 */
export const getAdminStats = async () => {
  try {
    const response = await API.get('/api/admin/stats', {
      headers: createHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new AdminError(
      error?.response?.data?.message || 'Failed to fetch admin stats',
      'STATS_FETCH_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Get list of users with pagination
 * @param {Object} params
 * @param {number} params.page
 * @param {number} params.limit
 * @param {string} [params.search]
 * @param {string} [params.filter]
 * @param {string} [params.sort]
 * @returns {Promise<{ users: import('../types').AdminUser[], total: number }>}
 */
export const getUsers = async ({ page, limit, search, filter, sort }) => {
  try {
    const response = await API.get('/api/admin/users', {
      headers: createHeaders(),
      params: { page, limit, search, filter, sort },
    });
    return response.data;
  } catch (error) {
    throw new AdminError(
      error?.response?.data?.message || 'Failed to fetch users',
      'USERS_FETCH_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Update user status or role
 * @param {string} userId
 * @param {Object} updates
 * @param {boolean} [updates.isActive]
 * @param {string} [updates.role]
 * @returns {Promise<import('../types').AdminUser>}
 */
export const updateUser = async (userId, updates) => {
  try {
    const response = await API.put(`/api/admin/users/${userId}`, updates, {
      headers: createHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new AdminError(
      error?.response?.data?.message || 'Failed to update user',
      'USER_UPDATE_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Get list of roles and permissions
 * @returns {Promise<{ roles: import('../types').AdminRole[] }>}
 */
export const getRolesAndPermissions = async () => {
  try {
    const response = await API.get('/api/admin/roles', {
      headers: createHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new AdminError(
      error?.response?.data?.message || 'Failed to fetch roles',
      'ROLES_FETCH_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Update role permissions
 * @param {string} roleId
 * @param {string[]} permissionIds
 * @returns {Promise<import('../types').AdminRole>}
 */
export const updateRolePermissions = async (roleId, permissionIds) => {
  try {
    const response = await API.put(
      `/api/admin/roles/${roleId}/permissions`,
      { permissions: permissionIds },
      { headers: createHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new AdminError(
      error?.response?.data?.message || 'Failed to update role permissions',
      'PERMISSIONS_UPDATE_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Get admin reports
 * @param {Object} params
 * @param {string} params.type - Report type
 * @param {string} params.period - Time period
 * @param {string} [params.startDate] - Start date for custom period
 * @param {string} [params.endDate] - End date for custom period
 * @returns {Promise<Object>}
 */
export const getReports = async ({ type, period, startDate, endDate }) => {
  try {
    const response = await API.get('/api/admin/reports', {
      headers: createHeaders(),
      params: { type, period, startDate, endDate },
    });
    return response.data;
  } catch (error) {
    throw new AdminError(
      error?.response?.data?.message || 'Failed to fetch reports',
      'REPORTS_FETCH_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Manage bus owner verification requests
 * @param {string} userId
 * @param {boolean} approved
 * @param {string} [reason]
 * @returns {Promise<{ success: boolean }>}
 */
export const manageBusOwnerVerification = async (userId, approved, reason = '') => {
  try {
    const response = await API.post(
      `/api/admin/bus-owners/${userId}/verify`,
      { approved, reason },
      { headers: createHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new AdminError(
      error?.response?.data?.message || 'Failed to process verification',
      'VERIFICATION_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Get system audit logs
 * @param {Object} params
 * @param {number} params.page
 * @param {number} params.limit
 * @param {string} [params.action]
 * @param {string} [params.module]
 * @param {string} [params.userId]
 * @returns {Promise<{ logs: Array<Object>, total: number }>}
 */
export const getAuditLogs = async ({ page, limit, action, module, userId }) => {
  try {
    const response = await API.get('/api/admin/audit-logs', {
      headers: createHeaders(),
      params: { page, limit, action, module, userId },
    });
    return response.data;
  } catch (error) {
    throw new AdminError(
      error?.response?.data?.message || 'Failed to fetch audit logs',
      'AUDIT_LOGS_FETCH_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Update system settings
 * @param {Object} settings
 * @returns {Promise<Object>}
 */
export const updateSystemSettings = async (settings) => {
  try {
    const response = await API.put(
      '/api/admin/settings',
      settings,
      { headers: createHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new AdminError(
      error?.response?.data?.message || 'Failed to update settings',
      'SETTINGS_UPDATE_FAILED',
      error?.response?.data
    );
  }
};