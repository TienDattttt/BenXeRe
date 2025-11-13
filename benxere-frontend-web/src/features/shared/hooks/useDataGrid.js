import { useState, useCallback, useEffect } from 'react';
import { SortDirections } from '../types';

/**
 * Custom hook for managing data grid operations (sorting, filtering, pagination)
 * @param {Object} options
 * @param {Function} options.fetchData - Function to fetch data
 * @param {Object} [options.initialFilters={}] - Initial filter values
 * @param {Object} [options.initialSort={ direction: 'desc' }] - Initial sort configuration
 * @param {number} [options.initialPage=1] - Initial page number
 * @param {number} [options.initialLimit=10] - Initial items per page
 * @returns {Object} Data grid state and handlers
 */
export const useDataGrid = ({
  fetchData,
  initialFilters = {},
  initialSort = { direction: SortDirections.DESC },
  initialPage = 1,
  initialLimit = 10,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);

  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  /**
   * Load data with current parameters
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchData({
        page,
        limit,
        sort,
        ...filters,
      });
      setData(response.data);
      setTotalItems(response.total);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      setData([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [fetchData, page, limit, sort, filters]);

  // Load data when parameters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Handle filter change
   * @param {Object} newFilters
   * @param {boolean} [resetPage=true] - Whether to reset to first page
   */
  const handleFilterChange = useCallback((newFilters, resetPage = true) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    if (resetPage) {
      setPage(1);
    }
  }, []);

  /**
   * Handle sort change
   * @param {string} field - Field to sort by
   * @param {string} direction - Sort direction
   */
  const handleSortChange = useCallback((field, direction) => {
    setSort({ field, direction });
  }, []);

  /**
   * Handle page change
   * @param {number} newPage
   */
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  /**
   * Handle items per page change
   * @param {number} newLimit
   */
  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  /**
   * Reset all parameters to initial values
   */
  const resetAll = useCallback(() => {
    setFilters(initialFilters);
    setSort(initialSort);
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialFilters, initialSort, initialPage, initialLimit]);

  /**
   * Refresh current data
   */
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    // State
    data,
    loading,
    error,
    totalItems,
    filters,
    sort,
    page,
    limit,

    // Computed
    pageCount: Math.ceil(totalItems / limit),
    isEmpty: data.length === 0,
    
    // Handlers
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    handleLimitChange,
    resetAll,
    refresh,

    // Original params for custom handling
    params: {
      page,
      limit,
      sort,
      ...filters,
    },
  };
};