/**
 * @typedef {Object} Booking
 * @property {string} id - Unique identifier for the booking
 * @property {string} scheduleId - ID of the scheduled bus trip
 * @property {string} userId - ID of the user making the booking
 * @property {BookingSeat[]} seats - Array of booked seats
 * @property {string} status - Current status of the booking
 * @property {number} totalAmount - Total amount for the booking
 * @property {string} createdAt - Booking creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} BookingSeat
 * @property {string} seatId - ID of the booked seat
 * @property {string} number - Seat number
 * @property {number} price - Price of the seat
 * @property {PassengerInfo} passengerInfo - Information about the passenger
 */

/**
 * @typedef {Object} PassengerInfo
 * @property {string} name - Passenger's full name
 * @property {string} phone - Passenger's phone number
 */

/**
 * @typedef {Object} BookingCreateData
 * @property {string} scheduleId - ID of the scheduled bus trip
 * @property {Array<{seatId: string, passengerInfo: PassengerInfo}>} seats - Seats to book
 * @property {string} [paymentMethod] - Method of payment
 * @property {string} [couponCode] - Optional coupon code
 */

export const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};