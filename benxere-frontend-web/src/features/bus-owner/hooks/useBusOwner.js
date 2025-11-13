import { useState, useCallback } from 'react';
import * as busOwnerService from '../services/busOwnerService';
import { BusOwnerSortOptions, ScheduleFilters } from '../types';

/**
 * Custom hook for managing bus owner operations
 * @returns {Object} Bus owner operations and state
 */
export const useBusOwner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  /**
   * Get list of buses
   * @returns {Promise<Array<import('../types').Bus>>}
   */
  const getBuses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const buses = await busOwnerService.getBuses();
      return buses;
    } catch (err) {
      setError(err.message || 'Failed to fetch buses');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a new bus
   * @param {Object} busData
   * @returns {Promise<import('../types').Bus>}
   */
  const addBus = useCallback(async (busData) => {
    setLoading(true);
    setError(null);
    try {
      const bus = await busOwnerService.addBus(busData);
      return bus;
    } catch (err) {
      setError(err.message || 'Failed to add bus');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get schedules with filters
   * @param {Object} params
   * @returns {Promise<Array<import('../types').Schedule>>}
   */
  const getSchedules = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const schedules = await busOwnerService.getSchedules(params);
      return schedules;
    } catch (err) {
      setError(err.message || 'Failed to fetch schedules');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new schedule
   * @param {Object} scheduleData
   * @returns {Promise<import('../types').Schedule>}
   */
  const createSchedule = useCallback(async (scheduleData) => {
    setLoading(true);
    setError(null);
    try {
      const schedule = await busOwnerService.createSchedule(scheduleData);
      return schedule;
    } catch (err) {
      setError(err.message || 'Failed to create schedule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get list of employees
   * @returns {Promise<Array<import('../types').Employee>>}
   */
  const getEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const employees = await busOwnerService.getEmployees();
      return employees;
    } catch (err) {
      setError(err.message || 'Failed to fetch employees');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a new employee
   * @param {Object} employeeData
   * @returns {Promise<import('../types').Employee>}
   */
  const addEmployee = useCallback(async (employeeData) => {
    setLoading(true);
    setError(null);
    try {
      const employee = await busOwnerService.addEmployee(employeeData);
      return employee;
    } catch (err) {
      setError(err.message || 'Failed to add employee');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get reviews with pagination
   * @param {Object} params
   * @returns {Promise<{ reviews: Array<import('../types').Review>, total: number }>}
   */
  const getReviews = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await busOwnerService.getReviews(params);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to fetch reviews');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update schedule status
   * @param {string} scheduleId
   * @param {string} status
   * @param {string} [reason]
   * @returns {Promise<import('../types').Schedule>}
   */
  const updateScheduleStatus = useCallback(async (scheduleId, status, reason) => {
    setLoading(true);
    setError(null);
    try {
      const schedule = await busOwnerService.updateScheduleStatus(scheduleId, status, reason);
      return schedule;
    } catch (err) {
      setError(err.message || 'Failed to update schedule status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load dashboard statistics
   * @returns {Promise<void>}
   */
  const loadDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboardStats = await busOwnerService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear any errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    stats,

    // Bus operations
    getBuses,
    addBus,

    // Schedule operations
    getSchedules,
    createSchedule,
    updateScheduleStatus,

    // Employee operations
    getEmployees,
    addEmployee,

    // Review operations
    getReviews,

    // Dashboard operations
    loadDashboardStats,
    
    // Utility
    clearError,
  };
};