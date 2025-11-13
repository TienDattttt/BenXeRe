import { useState, useCallback, useEffect } from 'react';
import * as adminService from '../services/adminService';
import { AdminSortOptions, AdminListFilters } from '../types';

/**
 * Custom hook for managing admin data operations
 * @param {Object} options
 * @param {string} options.resource - The resource type to manage (users, roles, etc.)
 * @param {Object} [options.defaultParams] - Default parameters for fetching data
 * @param {number} [options.defaultParams.limit=10] - Items per page
 * @param {string} [options.defaultParams.sort=AdminSortOptions.CREATED_DESC] - Sort order
 * @param {string} [options.defaultParams.filter=AdminListFilters.ALL] - Filter type
 */
export const useAdminData = ({
  resource,
  defaultParams = {
    limit: 10,
    sort: AdminSortOptions.CREATED_DESC,
    filter: AdminListFilters.ALL,
  },
}) => {
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    page: 1,
    ...defaultParams,
  });

  /**
   * Fetch data based on current parameters
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      switch (resource) {
        case 'users':
          response = await adminService.getUsers(params);
          setData(response.users);
          setTotalItems(response.total);
          break;
        case 'roles':
          response = await adminService.getRolesAndPermissions();
          setData(response.roles);
          setTotalItems(response.roles.length);
          break;
        case 'audit-logs':
          response = await adminService.getAuditLogs(params);
          setData(response.logs);
          setTotalItems(response.total);
          break;
        default:
          throw new Error(`Unsupported resource type: ${resource}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [resource, params]);

  // Fetch data on mount and when params change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Update query parameters
   * @param {Object} newParams
   */
  const updateParams = useCallback((newParams) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
      // Reset to first page when other params change
      page: newParams.hasOwnProperty('page') ? newParams.page : 1,
    }));
  }, []);

  /**
   * Handle pagination change
   * @param {number} page
   */
  const handlePageChange = useCallback((page) => {
    updateParams({ page });
  }, [updateParams]);

  /**
   * Handle items per page change
   * @param {number} limit
   */
  const handleLimitChange = useCallback((limit) => {
    updateParams({ limit });
  }, [updateParams]);

  /**
   * Handle sort change
   * @param {string} sort
   */
  const handleSortChange = useCallback((sort) => {
    updateParams({ sort });
  }, [updateParams]);

  /**
   * Handle filter change
   * @param {string} filter
   */
  const handleFilterChange = useCallback((filter) => {
    updateParams({ filter });
  }, [updateParams]);

  /**
   * Handle search
   * @param {string} search
   */
  const handleSearch = useCallback((search) => {
    updateParams({ search });
  }, [updateParams]);

  /**
   * Refresh data
   */
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    // State
    data,
    totalItems,
    loading,
    error,
    params,

    // Pagination
    pageCount: Math.ceil(totalItems / params.limit),
    currentPage: params.page,

    // Actions
    updateParams,
    handlePageChange,
    handleLimitChange,
    handleSortChange,
    handleFilterChange,
    handleSearch,
    refresh,
  };
};