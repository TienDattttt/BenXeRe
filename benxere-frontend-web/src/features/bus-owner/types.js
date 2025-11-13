/**
 * @typedef {Object} Bus
 * @property {string} id
 * @property {string} number - Bus number/license plate
 * @property {string} type - Bus type (e.g., sleeper, seater)
 * @property {number} capacity - Total seat capacity
 * @property {string} ownerId - ID of bus owner
 * @property {boolean} isActive
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Schedule
 * @property {string} id
 * @property {string} busId
 * @property {string} routeId
 * @property {string} departureTime
 * @property {string} arrivalTime
 * @property {string} startLocation
 * @property {string} endLocation
 * @property {number} basePrice
 * @property {string} status
 */

/**
 * @typedef {Object} Employee
 * @property {string} id
 * @property {string} name
 * @property {string} role - Role in the bus (driver, conductor, etc.)
 * @property {string} phone
 * @property {string} license - Driver's license number (for drivers)
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} Route
 * @property {string} id
 * @property {string} startLocation
 * @property {string} endLocation
 * @property {number} distance
 * @property {number} duration - Duration in minutes
 * @property {string[]} stops - Intermediate stops
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} userId
 * @property {string} scheduleId
 * @property {number} rating
 * @property {string} comment
 * @property {string} createdAt
 */

/**
 * Bus types available
 */
export const BusTypes = {
  SLEEPER: 'sleeper',
  SEATER: 'seater',
  SEMI_SLEEPER: 'semi_sleeper',
  LUXURY: 'luxury',
  DOUBLE_DECKER: 'double_decker',
};

/**
 * Employee roles in the bus
 */
export const EmployeeRoles = {
  DRIVER: 'driver',
  CONDUCTOR: 'conductor',
  ASSISTANT: 'assistant',
  CLEANER: 'cleaner',
};

/**
 * Schedule status options
 */
export const ScheduleStatus = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DELAYED: 'delayed',
};

/**
 * Sort options for bus owner lists
 */
export const BusOwnerSortOptions = {
  DEPARTURE_TIME_ASC: 'departure_time_asc',
  DEPARTURE_TIME_DESC: 'departure_time_desc',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  CREATED_AT_DESC: 'created_at_desc',
  RATING_DESC: 'rating_desc',
};

/**
 * Filter options for schedules
 */
export const ScheduleFilters = {
  ALL: 'all',
  UPCOMING: 'upcoming',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

/**
 * Bus amenities options
 */
export const BusAmenities = {
  WIFI: 'wifi',
  USB_CHARGING: 'usb_charging',
  WATER: 'water',
  BLANKET: 'blanket',
  AC: 'ac',
  ENTERTAINMENT: 'entertainment',
  TOILET: 'toilet',
  SNACKS: 'snacks',
};

/**
 * Driver license types
 */
export const LicenseTypes = {
  D: 'd',
  E: 'e',
  FC: 'fc',
};

/**
 * Bus maintenance status
 */
export const MaintenanceStatus = {
  UP_TO_DATE: 'up_to_date',
  DUE_SOON: 'due_soon',
  OVERDUE: 'overdue',
  IN_MAINTENANCE: 'in_maintenance',
};

/**
 * Payment settlement status with bus owner
 */
export const SettlementStatus = {
  PENDING: 'pending',
  PROCESSED: 'processed',
  FAILED: 'failed',
  SETTLED: 'settled',
};

/**
 * Bus seat types
 */
export const SeatTypes = {
  WINDOW: 'window',
  AISLE: 'aisle',
  MIDDLE: 'middle',
  SINGLE: 'single',
  DOUBLE: 'double',
};