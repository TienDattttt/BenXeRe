import { BusTypes, EmployeeRoles, ScheduleStatus } from '../types';

/**
 * Format duration in minutes to readable format
 * @param {number} minutes
 * @returns {string}
 */
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h${remainingMinutes ? ` ${remainingMinutes}m` : ''}`;
};

/**
 * Format schedule time range
 * @param {string} departureTime
 * @param {string} arrivalTime
 * @returns {string}
 */
export const formatScheduleTime = (departureTime, arrivalTime) => {
  const departure = new Date(departureTime);
  const arrival = new Date(arrivalTime);
  
  return `${departure.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })} - ${arrival.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;
};

/**
 * Calculate schedule occupancy rate
 * @param {number} bookedSeats
 * @param {number} totalSeats
 * @returns {number}
 */
export const calculateOccupancyRate = (bookedSeats, totalSeats) => {
  if (!totalSeats) return 0;
  return Math.round((bookedSeats / totalSeats) * 100);
};

/**
 * Calculate average rating
 * @param {Array<import('../types').Review>} reviews
 * @returns {number}
 */
export const calculateAverageRating = (reviews) => {
  if (!reviews?.length) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return +(sum / reviews.length).toFixed(1);
};

/**
 * Validate bus data
 * @param {Object} data
 * @returns {{ isValid: boolean, errors: Object }}
 */
export const validateBusData = (data) => {
  const errors = {};

  if (!data.number?.trim()) {
    errors.number = 'Vui lòng nhập biển số xe';
  }

  if (!Object.values(BusTypes).includes(data.type)) {
    errors.type = 'Loại xe không hợp lệ';
  }

  if (!data.capacity || data.capacity < 1) {
    errors.capacity = 'Sức chứa không hợp lệ';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate employee data
 * @param {Object} data
 * @returns {{ isValid: boolean, errors: Object }}
 */
export const validateEmployeeData = (data) => {
  const errors = {};

  if (!data.name?.trim()) {
    errors.name = 'Vui lòng nhập tên nhân viên';
  }

  if (!Object.values(EmployeeRoles).includes(data.role)) {
    errors.role = 'Vai trò không hợp lệ';
  }

  if (!data.phone?.trim()) {
    errors.phone = 'Vui lòng nhập số điện thoại';
  } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(data.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ';
  }

  if (data.role === EmployeeRoles.DRIVER && !data.license?.trim()) {
    errors.license = 'Vui lòng nhập số bằng lái';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate schedule data
 * @param {Object} data
 * @returns {{ isValid: boolean, errors: Object }}
 */
export const validateScheduleData = (data) => {
  const errors = {};
  const departure = new Date(data.departureTime);
  const arrival = new Date(data.arrivalTime);

  if (!data.busId) {
    errors.busId = 'Vui lòng chọn xe';
  }

  if (!data.routeId) {
    errors.routeId = 'Vui lòng chọn tuyến đường';
  }

  if (!data.departureTime) {
    errors.departureTime = 'Vui lòng chọn thời gian khởi hành';
  }

  if (!data.arrivalTime) {
    errors.arrivalTime = 'Vui lòng chọn thời gian đến';
  } else if (arrival <= departure) {
    errors.arrivalTime = 'Thời gian đến phải sau thời gian khởi hành';
  }

  if (!data.basePrice || data.basePrice <= 0) {
    errors.basePrice = 'Giá vé không hợp lệ';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Check if a schedule can be cancelled
 * @param {import('../types').Schedule} schedule
 * @returns {boolean}
 */
export const canCancelSchedule = (schedule) => {
  if (!schedule) return false;
  
  const departure = new Date(schedule.departureTime);
  const now = new Date();
  
  // Can only cancel if more than 2 hours before departure
  const hoursUntilDeparture = (departure - now) / (1000 * 60 * 60);
  
  return (
    schedule.status === ScheduleStatus.SCHEDULED &&
    hoursUntilDeparture > 2
  );
};

/**
 * Calculate revenue statistics
 * @param {Array<Object>} bookings
 * @returns {Object}
 */
export const calculateRevenueStats = (bookings) => {
  if (!bookings?.length) {
    return {
      total: 0,
      average: 0,
      byRoute: {},
      byMonth: {},
    };
  }

  const stats = bookings.reduce((acc, booking) => {
    const amount = booking.totalAmount || 0;
    const date = new Date(booking.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const routeKey = booking.routeId;

    acc.total += amount;
    acc.byMonth[monthKey] = (acc.byMonth[monthKey] || 0) + amount;
    acc.byRoute[routeKey] = (acc.byRoute[routeKey] || 0) + amount;

    return acc;
  }, {
    total: 0,
    byMonth: {},
    byRoute: {},
  });

  stats.average = stats.total / bookings.length;

  return stats;
};