import { DateFormats, ResponseMessages } from '../types';

/**
 * Format date according to specified format
 * @param {string|Date} date
 * @param {string} format
 * @returns {string}
 */
export const formatDate = (date, format = DateFormats.SHORT) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  switch (format) {
    case DateFormats.SHORT:
      return d.toLocaleDateString('vi-VN');
    case DateFormats.LONG:
      return d.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case DateFormats.WITH_TIME:
      return d.toLocaleString('vi-VN');
    case DateFormats.TIME:
      return d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    case DateFormats.ISO:
      return d.toISOString().split('T')[0];
    default:
      return d.toLocaleString('vi-VN');
  }
};

/**
 * Format currency amount
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format phone number
 * @param {string} phone
 * @returns {string}
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // Format as Vietnamese phone number
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  return phone;
};

/**
 * Generate pagination info text
 * @param {number} page
 * @param {number} limit
 * @param {number} total
 * @returns {string}
 */
export const getPaginationInfo = (page, limit, total) => {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return `Hiển thị ${start}-${end} trên tổng số ${total}`;
};

/**
 * Create select options from array
 * @param {Array<Object>} items
 * @param {string|Function} labelKey
 * @param {string|Function} valueKey
 * @returns {Array<import('../types').SelectOption>}
 */
export const createSelectOptions = (items, labelKey, valueKey) => {
  if (!Array.isArray(items)) return [];
  
  return items.map(item => ({
    label: typeof labelKey === 'function' ? labelKey(item) : item[labelKey],
    value: typeof valueKey === 'function' ? valueKey(item) : item[valueKey],
    data: item,
  }));
};

/**
 * Deep clone an object
 * @param {Object} obj
 * @returns {Object}
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
  );
};

/**
 * Compare two objects for equality
 * @param {Object} obj1
 * @param {Object} obj2
 * @returns {boolean}
 */
export const isEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  if (obj1 === null || obj2 === null) return false;
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  return keys1.every(key => isEqual(obj1[key], obj2[key]));
};

/**
 * Parse error message from API response
 * @param {Error} error
 * @returns {string}
 */
export const parseErrorMessage = (error) => {
  if (!error) return ResponseMessages.SERVER_ERROR;
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    if (error.message.includes('Network Error')) {
      return ResponseMessages.NETWORK_ERROR;
    }
    return error.message;
  }

  return ResponseMessages.SERVER_ERROR;
};

/**
 * Get device type based on window width
 * @returns {string}
 */
export const getDeviceType = () => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * Check if string is valid JSON
 * @param {string} str
 * @returns {boolean}
 */
export const isValidJSON = (str) => {
  if (typeof str !== 'string') return false;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Generate random string
 * @param {number} length
 * @returns {string}
 */
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};