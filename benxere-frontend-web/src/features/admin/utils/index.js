import { ReportPeriods, ReportTypes } from '../types';

/**
 * Format currency for admin displays
 * @param {number} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format date for admin displays
 * @param {string|Date} date 
 * @param {Object} options
 * @param {boolean} [options.includeTime=false]
 * @returns {string}
 */
export const formatDate = (date, { includeTime = false } = {}) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
    }),
  });
};

/**
 * Get date range for report period
 * @param {string} period - One of ReportPeriods
 * @param {Object} [customRange] - Required for CUSTOM period
 * @returns {{ startDate: Date, endDate: Date }}
 */
export const getReportDateRange = (period, customRange = null) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch (period) {
    case ReportPeriods.TODAY:
      return { startDate: startOfDay, endDate: endOfDay };
    
    case ReportPeriods.YESTERDAY:
      const yesterday = new Date(startOfDay);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59);
      return { startDate: yesterday, endDate: yesterdayEnd };
    
    case ReportPeriods.THIS_WEEK:
      const thisWeekStart = new Date(startOfDay);
      thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
      return { startDate: thisWeekStart, endDate: endOfDay };
    
    case ReportPeriods.LAST_WEEK:
      const lastWeekStart = new Date(startOfDay);
      lastWeekStart.setDate(lastWeekStart.getDate() - lastWeekStart.getDay() - 7);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);
      lastWeekEnd.setHours(23, 59, 59);
      return { startDate: lastWeekStart, endDate: lastWeekEnd };
    
    case ReportPeriods.THIS_MONTH:
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: thisMonthStart, endDate: endOfDay };
    
    case ReportPeriods.LAST_MONTH:
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { startDate: lastMonthStart, endDate: lastMonthEnd };
    
    case ReportPeriods.THIS_YEAR:
      const thisYearStart = new Date(now.getFullYear(), 0, 1);
      return { startDate: thisYearStart, endDate: endOfDay };
    
    case ReportPeriods.CUSTOM:
      if (!customRange?.startDate || !customRange?.endDate) {
        throw new Error('Custom range requires both startDate and endDate');
      }
      return {
        startDate: new Date(customRange.startDate),
        endDate: new Date(customRange.endDate),
      };
    
    default:
      throw new Error(`Invalid report period: ${period}`);
  }
};

/**
 * Format report data for charts
 * @param {Object} data - Raw report data
 * @param {string} type - One of ReportTypes
 * @returns {Object} Formatted data for charts
 */
export const formatReportData = (data, type) => {
  switch (type) {
    case ReportTypes.REVENUE:
      return {
        labels: data.map(item => formatDate(item.date)),
        datasets: [{
          label: 'Revenue',
          data: data.map(item => item.amount),
          fill: false,
        }],
      };
    
    case ReportTypes.BOOKINGS:
      return {
        labels: data.map(item => formatDate(item.date)),
        datasets: [{
          label: 'Bookings',
          data: data.map(item => item.count),
          fill: false,
        }],
      };
    
    case ReportTypes.USERS:
      return {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: [
            '#4CAF50',
            '#2196F3',
            '#FFC107',
            '#F44336',
          ],
        }],
      };
    
    default:
      return data;
  }
};

/**
 * Validate admin action permissions
 * @param {Object} user - Current admin user
 * @param {string} action - Action to check
 * @param {string} module - Module to check
 * @returns {boolean}
 */
export const hasPermission = (user, action, module) => {
  if (!user || !user.role || !user.permissions) {
    return false;
  }

  // Super admin has all permissions
  if (user.role === 'admin') {
    return true;
  }

  return user.permissions.some(
    permission => permission.action === action && permission.module === module
  );
};

/**
 * Generate audit log message
 * @param {string} action 
 * @param {string} module 
 * @param {Object} details 
 * @returns {string}
 */
export const generateAuditMessage = (action, module, details) => {
  const messages = {
    create: `Created new ${module}`,
    update: `Updated ${module}`,
    delete: `Deleted ${module}`,
    block: `Blocked ${module}`,
    unblock: `Unblocked ${module}`,
    approve: `Approved ${module}`,
    reject: `Rejected ${module}`,
  };

  let message = messages[action] || `Performed ${action} on ${module}`;
  
  if (details) {
    if (details.id) {
      message += ` (ID: ${details.id})`;
    }
    if (details.name) {
      message += `: ${details.name}`;
    }
  }

  return message;
};