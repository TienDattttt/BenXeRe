import API from '../../../services/api';
import { TokenService } from '../../auth/services/authService';
import { BusTypes, ScheduleStatus } from '../types';

/**
 * Error class for bus owner related errors
 */
export class BusOwnerError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'BusOwnerError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Create headers with auth token
 * @private
 */
const createHeaders = () => ({
  Authorization: `Bearer ${TokenService.getToken()}`,
  'Content-Type': 'application/json',
});

/**
 * Get buses for current owner
 * @returns {Promise<Array<import('../types').Bus>>}
 */
export const getBuses = async () => {
  try {
    const response = await API.get('/bus-owner/buses', {
      headers: createHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new BusOwnerError(
      error?.response?.data?.message || 'Failed to fetch buses',
      'FETCH_BUSES_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Add a new bus
 * @param {Object} busData
 * @returns {Promise<import('../types').Bus>}
 */
export const addBus = async (busData) => {
  try {
    const response = await API.post('/bus-owner/buses', busData, {
      headers: createHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new BusOwnerError(
      error?.response?.data?.message || 'Failed to add bus',
      'ADD_BUS_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Update bus details
 * @param {string} busId
 * @param {Object} updates
 * @returns {Promise<import('../types').Bus>}
 */
export const updateBus = async (busId, updates) => {
  try {
    const response = await API.put(`/bus-owner/buses/${busId}`, updates, {
      headers: createHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new BusOwnerError(
      error?.response?.data?.message || 'Failed to update bus',
      'UPDATE_BUS_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Get schedules for current owner
 * @param {Object} params
 * @param {string} [params.status]
 * @param {string} [params.startDate]
 * @param {string} [params.endDate]
 * @returns {Promise<Array<import('../types').Schedule>>}
 */
export const getSchedules = async (params = {}) => {
  try {
    const response = await API.get('/bus-owner/schedules', {
      headers: createHeaders(),
      params,
    });
    return response.data;
  } catch (error) {
    throw new BusOwnerError(
      error?.response?.data?.message || 'Failed to fetch schedules',
      'FETCH_SCHEDULES_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Create a new schedule
 * @param {Object} scheduleData
 * @returns {Promise<import('../types').Schedule>}
 */
export const createSchedule = async (scheduleData) => {
  try {
    const response = await API.post('/bus-owner/schedules', scheduleData, {
      headers: createHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new BusOwnerError(
      error?.response?.data?.message || 'Failed to create schedule',
      'CREATE_SCHEDULE_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Get employees for current owner
 * @returns {Promise<Array<import('../types').Employee>>}
 */
export const getEmployees = async () => {
  try {
    const response = await API.get('/bus-owner/employees', {
      headers: createHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new BusOwnerError(
      error?.response?.data?.message || 'Failed to fetch employees',
      'FETCH_EMPLOYEES_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Add a new employee
 * @param {Object} employeeData
 * @returns {Promise<import('../types').Employee>}
 */
export const addEmployee = async (employeeData) => {
  try {
    const response = await API.post('/bus-owner/employees', employeeData, {
      headers: createHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new BusOwnerError(
      error?.response?.data?.message || 'Failed to add employee',
      'ADD_EMPLOYEE_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Get reviews for current owner
 * @param {Object} params
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @param {string} [params.sortBy]
 * @returns {Promise<{ reviews: Array<import('../types').Review>, total: number }>}
 */
export const getReviews = async (params = {}) => {
  try {
    const response = await API.get('/bus-owner/reviews', {
      headers: createHeaders(),
      params,
    });
    return {
      reviews: response.data.result,
      total: response.data.total,
    };
  } catch (error) {
    throw new BusOwnerError(
      error?.response?.data?.message || 'Failed to fetch reviews',
      'FETCH_REVIEWS_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Update schedule status
 * @param {string} scheduleId
 * @param {string} status
 * @param {string} [reason]
 * @returns {Promise<import('../types').Schedule>}
 */
export const updateScheduleStatus = async (scheduleId, status, reason = '') => {
  try {
    const response = await API.put(
      `/bus-owner/schedules/${scheduleId}/status`,
      { status, reason },
      { headers: createHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new BusOwnerError(
      error?.response?.data?.message || 'Failed to update schedule status',
      'UPDATE_SCHEDULE_STATUS_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Get dashboard statistics
 * @returns {Promise<Object>}
 */
export const getDashboardStats = async () => {
  try {
    const response = await API.get('/bus-owner/dashboard/stats', {
      headers: createHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new BusOwnerError(
      error?.response?.data?.message || 'Failed to fetch dashboard stats',
      'FETCH_STATS_FAILED',
      error?.response?.data
    );
  }
};