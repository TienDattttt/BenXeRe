import API from '../../../services/api';
import { BookingStatus, PaymentStatus } from '../types';

/**
 * Error class for booking-related errors
 */
export class BookingError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'BookingError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Get authentication token from local storage
 * @private
 * @returns {string|null}
 */
const getToken = () => localStorage.getItem('token');

/**
 * Validate token existence
 * @private
 * @throws {BookingError}
 */
const validateToken = () => {
  const token = getToken();
  if (!token) {
    throw new BookingError('Authentication required', 'AUTH_REQUIRED');
  }
  return token;
};

/**
 * Create API headers with authentication
 * @private
 * @param {boolean} [isJson=true] - Whether to include JSON content type
 * @returns {Object} Headers object
 */
const createHeaders = (isJson = true) => {
  const headers = {
    'Authorization': `Bearer ${validateToken()}`,
  };
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

/**
 * Create a new booking
 * @param {import('../types').BookingCreateData} bookingData
 * @returns {Promise<import('../types').Booking>}
 * @throws {BookingError}
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await API.post('/api/bookings', bookingData, {
      headers: createHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new BookingError(
      error?.response?.data?.message || 'Failed to create booking',
      'CREATE_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Get all bookings
 * @returns {Promise<Array<import('../types').Booking>>}
 * @throws {BookingError}
 */
export const getAllBookings = async () => {
  try {
    const response = await API.get('/api/bookings', {
      headers: createHeaders(false),
    });
    return response.data;
  } catch (error) {
    throw new BookingError(
      error?.response?.data?.message || 'Failed to fetch bookings',
      'FETCH_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Update a booking by ID
 * @param {string} id - Booking ID
 * @param {Partial<import('../types').Booking>} bookingData
 * @returns {Promise<import('../types').Booking>}
 * @throws {BookingError}
 */
export const updateBooking = async (id, bookingData) => {
  try {
    const response = await API.put(`/bookings/${id}`, bookingData, {
      headers: createHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new BookingError(
      error?.response?.data?.message || 'Failed to update booking',
      'UPDATE_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Delete a booking by ID
 * @param {string} id - Booking ID
 * @returns {Promise<void>}
 * @throws {BookingError}
 */
export const deleteBooking = async (id) => {
  try {
    await API.delete(`/bookings/${id}`, {
      headers: createHeaders(false),
    });
  } catch (error) {
    throw new BookingError(
      error?.response?.data?.message || 'Failed to delete booking',
      'DELETE_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Get a booking by ID
 * @param {string} id - Booking ID
 * @returns {Promise<import('../types').Booking>}
 * @throws {BookingError}
 */
export const getBookingById = async (id) => {
  try {
    const response = await API.get(`/bookings/${id}`, {
      headers: createHeaders(false),
    });
    return response.data;
  } catch (error) {
    throw new BookingError(
      error?.response?.data?.message || 'Failed to fetch booking',
      'FETCH_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Get bookings for a specific schedule
 * @param {string} scheduleId - Schedule ID
 * @returns {Promise<Array<import('../types').Booking>>}
 * @throws {BookingError}
 */
export const getBookingsByScheduleId = async (scheduleId) => {
  try {
    const response = await API.get(`/api/bookings/schedule/${scheduleId}`, {
      headers: createHeaders(false),
    });
    return response.data.result;
  } catch (error) {
    throw new BookingError(
      error?.response?.data?.message || 'Failed to fetch schedule bookings',
      'FETCH_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Get bookings for the current user
 * @returns {Promise<Array<import('../types').Booking>>}
 * @throws {BookingError}
 */
export const getBookingsByCurrentUser = async () => {
  try {
    const response = await API.get('/api/bookings/me', {
      headers: createHeaders(false),
    });
    return response.data.result;
  } catch (error) {
    throw new BookingError(
      error?.response?.data?.message || 'Failed to fetch user bookings',
      'FETCH_FAILED',
      error?.response?.data
    );
  }
};

/**
 * Check booking status
 * @param {string} bookingId - Booking ID
 * @returns {Promise<{ status: string, paymentStatus: string }>}
 * @throws {BookingError}
 */
export const checkBookingStatus = async (bookingId) => {
  try {
    const response = await API.get(`/api/bookings/${bookingId}/status`, {
      headers: createHeaders(false),
    });
    return {
      status: response.data.status,
      paymentStatus: response.data.paymentStatus,
    };
  } catch (error) {
    throw new BookingError(
      error?.response?.data?.message || 'Failed to check booking status',
      'STATUS_CHECK_FAILED',
      error?.response?.data
    );
  }
};