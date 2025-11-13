/**
 * Format price to VND currency
 * @param {number} price
 * @returns {string}
 */
export const formatPrice = (price) => {
  return price?.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }) ?? '0 ₫';
};

/**
 * Format date to Vietnamese format
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Validate passenger information
 * @param {Object} info
 * @param {string} info.name
 * @param {string} info.phone
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validatePassengerInfo = (info) => {
  const errors = {};

  if (!info.name?.trim()) {
    errors.name = 'Vui lòng nhập họ tên';
  } else if (info.name.length < 2) {
    errors.name = 'Tên phải có ít nhất 2 ký tự';
  }

  if (!info.phone?.trim()) {
    errors.phone = 'Vui lòng nhập số điện thoại';
  } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(info.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Calculate total amount including discounts
 * @param {number} baseAmount
 * @param {Object} discount
 * @param {number} discount.percentage
 * @param {number} discount.maxAmount
 * @returns {Object} { finalAmount: number, discountAmount: number }
 */
export const calculateTotalAmount = (baseAmount, discount = null) => {
  if (!discount) {
    return {
      finalAmount: baseAmount,
      discountAmount: 0,
    };
  }

  const discountAmount = Math.min(
    (baseAmount * discount.percentage) / 100,
    discount.maxAmount || Infinity
  );

  return {
    finalAmount: baseAmount - discountAmount,
    discountAmount,
  };
};

/**
 * Group seats by their position (e.g., floor, section)
 * @param {Array<Object>} seats
 * @returns {Object} Grouped seats
 */
export const groupSeats = (seats) => {
  return seats.reduce((acc, seat) => {
    const key = seat.floor || seat.section || 'default';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(seat);
    return acc;
  }, {});
};

/**
 * Check if a seat is available for booking
 * @param {Object} seat
 * @param {Array<Object>} bookedSeats
 * @returns {boolean}
 */
export const isSeatAvailable = (seat, bookedSeats = []) => {
  if (!seat.isActive) return false;
  return !bookedSeats.some(booked => booked.seatId === seat.id);
};

/**
 * Get seat display information
 * @param {Object} seat
 * @returns {Object} { label: string, position: string }
 */
export const getSeatDisplayInfo = (seat) => {
  const floor = seat.floor ? `Tầng ${seat.floor}` : '';
  const section = seat.section ? `Khu ${seat.section}` : '';
  const position = [floor, section].filter(Boolean).join(' - ');

  return {
    label: `Ghế ${seat.number}`,
    position: position || 'Chưa có vị trí',
  };
};