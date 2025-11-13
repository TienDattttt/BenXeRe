/**
 * @typedef {Object} Location
 * @property {string} id
 * @property {string} name
 * @property {string} type - city, district, etc.
 * @property {string} [parentId] - ID of parent location
 */

/**
 * @typedef {Object} SelectOption
 * @property {string|number} value
 * @property {string} label
 * @property {boolean} [disabled]
 * @property {any} [data] - Additional data
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} page
 * @property {number} limit
 * @property {string} [search]
 * @property {string} [sort]
 * @property {string} [filter]
 */

/**
 * @typedef {Object} PaginatedResponse<T>
 * @property {Array<T>} data
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 */

/**
 * Common status codes
 */
export const StatusCodes = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

/**
 * Common sort directions
 */
export const SortDirections = {
  ASC: 'asc',
  DESC: 'desc',
};

/**
 * Common data view modes
 */
export const ViewModes = {
  LIST: 'list',
  GRID: 'grid',
  TABLE: 'table',
  CALENDAR: 'calendar',
};

/**
 * Common time periods
 */
export const TimePeriods = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom',
};

/**
 * Common data export formats
 */
export const ExportFormats = {
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf',
};

/**
 * Common notification types
 */
export const NotificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

/**
 * Common device types
 */
export const DeviceTypes = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
};

/**
 * Common view port breakpoints (in pixels)
 */
export const Breakpoints = {
  XS: 320,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
};

/**
 * Common date formats
 */
export const DateFormats = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD MMMM YYYY',
  WITH_TIME: 'DD/MM/YYYY HH:mm',
  TIME: 'HH:mm',
  ISO: 'YYYY-MM-DD',
};

/**
 * Common response messages
 */
export const ResponseMessages = {
  CREATE_SUCCESS: 'Tạo mới thành công',
  UPDATE_SUCCESS: 'Cập nhật thành công',
  DELETE_SUCCESS: 'Xóa thành công',
  CREATE_ERROR: 'Không thể tạo mới',
  UPDATE_ERROR: 'Không thể cập nhật',
  DELETE_ERROR: 'Không thể xóa',
  FETCH_ERROR: 'Không thể tải dữ liệu',
  NETWORK_ERROR: 'Lỗi kết nối mạng',
  SERVER_ERROR: 'Lỗi máy chủ',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  UNAUTHORIZED: 'Không có quyền truy cập',
  SESSION_EXPIRED: 'Phiên làm việc đã hết hạn',
};