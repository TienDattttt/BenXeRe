/**
 * @typedef {Object} AdminStats
 * @property {number} totalUsers - Total number of users
 * @property {number} totalBookings - Total number of bookings
 * @property {number} totalRevenue - Total revenue
 * @property {number} activeRoutes - Number of active routes
 * @property {number} activeBuses - Number of active buses
 * @property {Object} revenueByMonth - Revenue statistics by month
 */

/**
 * @typedef {Object} AdminPermission
 * @property {string} id - Permission ID
 * @property {string} name - Permission name
 * @property {string} description - Permission description
 * @property {string} module - Module this permission belongs to
 */

/**
 * @typedef {Object} AdminRole
 * @property {string} id - Role ID
 * @property {string} name - Role name
 * @property {string} description - Role description
 * @property {AdminPermission[]} permissions - List of permissions for this role
 */

/**
 * @typedef {Object} AdminUser
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} name - User full name
 * @property {string} role - User role
 * @property {boolean} isActive - Whether user is active
 * @property {string} lastLogin - Last login timestamp
 */

/**
 * Admin modules in the system
 */
export const AdminModules = {
  USERS: 'users',
  BOOKINGS: 'bookings',
  BUSES: 'buses',
  ROUTES: 'routes',
  SCHEDULES: 'schedules',
  SETTINGS: 'settings',
  REPORTS: 'reports',
};

/**
 * Permission types for admin actions
 */
export const PermissionTypes = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
};

/**
 * Booking status that admins can set
 */
export const AdminBookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  REFUNDED: 'refunded',
};

/**
 * Status filters for admin lists
 */
export const AdminListFilters = {
  ALL: 'all',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  BLOCKED: 'blocked',
};

/**
 * Time periods for admin reports
 */
export const ReportPeriods = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_YEAR: 'this_year',
  CUSTOM: 'custom',
};

/**
 * Report types available in admin
 */
export const ReportTypes = {
  REVENUE: 'revenue',
  BOOKINGS: 'bookings',
  USERS: 'users',
  ROUTES: 'routes',
  BUSES: 'buses',
};

/**
 * Sort options for admin lists
 */
export const AdminSortOptions = {
  CREATED_DESC: 'created_desc',
  CREATED_ASC: 'created_asc',
  UPDATED_DESC: 'updated_desc',
  UPDATED_ASC: 'updated_asc',
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
};

/**
 * Action types for admin operations
 */
export const AdminActionTypes = {
  APPROVE: 'approve',
  REJECT: 'reject',
  BLOCK: 'block',
  UNBLOCK: 'unblock',
  RESET_PASSWORD: 'reset_password',
  GRANT_ACCESS: 'grant_access',
  REVOKE_ACCESS: 'revoke_access',
};