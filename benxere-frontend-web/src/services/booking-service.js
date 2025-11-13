import API from './api';

export class BookingError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export const ERROR_CODES = {
  BOOKING_NOT_FOUND: '2020',
  INVALID_BOOKING_DATA: '2021',
  BOOKING_CREATION_FAILED: '2022',
  SEATS_NOT_AVAILABLE: '2023',
  SCHEDULE_NOT_FOUND: '2024'
};

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED'
};

/**
 * Create a new booking
 * @param {Object} bookingData - Booking details
 * @param {number} bookingData.scheduleId - Schedule ID
 * @param {Array<number>} bookingData.seatIds - List of seat IDs
 * @param {number} bookingData.pickUpLocationId - Pickup location ID
 * @param {number} bookingData.dropOffLocationId - Dropoff location ID
 * @param {number} bookingData.couponId - Coupon ID (optional)
 * @param {string} bookingData.status - Booking status
 * @param {string} bookingData.paymentMethod - Payment method (CASH, ZALOPAY, etc.)
 * @param {string} bookingData.returnUrl - Return URL for online payment
 * @returns {Promise<Object>} Booking result
 */
export const createBooking = async (bookingData) => {
  try {
    console.log('Creating booking with data:', bookingData);
    const response = await API.post('/api/bookings', bookingData);
    
    const result = response.data.result;
    console.log('Booking API response:', result);

    // Validate booking and payment data
    if (!result?.booking || !result?.payment) {
      throw new BookingError(
        ERROR_CODES.BOOKING_CREATION_FAILED,
        'Không nhận được thông tin đặt vé hoặc thanh toán'
      );
    }

    // For online payments, validate payment URL
    if (bookingData.paymentMethod !== 'CASH' && !result.payment?.paymentUrl) {
      throw new BookingError(
        ERROR_CODES.BOOKING_CREATION_FAILED,
        'Không nhận được đường dẫn thanh toán'
      );
    }

    return result;
  } catch (error) {
    console.error('Error creating booking:', error);
    if (error instanceof BookingError) {
      throw error;
    }
    throw new BookingError(
      ERROR_CODES.BOOKING_CREATION_FAILED,
      error.response?.data?.message || 'Đã xảy ra lỗi khi đặt vé. Vui lòng thử lại sau.'
    );
  }
};

/**
 * Get all bookings for current user
 * @returns {Promise<Array>} List of bookings
 */
export const getUserBookings = async () => {
  try {
    const response = await API.get('/api/bookings/me');
    const bookingsWithPayment = response.data.result;
    console.log('Raw response from /api/bookings/me:', response.data);
    
    if (!bookingsWithPayment) {
      console.warn('No bookings data received from API');
      return [];
    }
    
    if (Array.isArray(bookingsWithPayment)) {
      return bookingsWithPayment.map(item => {
        if (item && item.booking && item.payment) {
          const bookingWithPayment = {
            ...item.booking,
            payment: item.payment,
            paymentMethod: item.payment?.paymentMethod,
            paymentStatus: item.payment?.status,
            paymentUrl: item.payment?.paymentUrl
          };
          
          if (!bookingWithPayment.totalPrice && item.payment && item.payment.amount) {
            bookingWithPayment.totalPrice = item.payment.amount;
          }
          
          return bookingWithPayment;
        }
        return item;
      });
    }
    console.warn('Unexpected response format from /api/bookings/me, not an array:', bookingsWithPayment);
    return [];
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw new Error(error.response?.data?.message || 'Không thể lấy thông tin đặt vé. Vui lòng thử lại sau.');
  }
};

/**
 * Alias for getUserBookings to maintain compatibility
 * @returns {Promise<Array>} List of bookings
 */
export const getBookingsByCurrentUser = getUserBookings;

/**
 * Get booking by ID
 * @param {number} id Booking ID
 * @returns {Promise<Object>} Booking details
 */
export const getBookingById = async (id) => {
  try {
    const response = await API.get(`/api/bookings/${id}`);
    return response.data.result;
  } catch (error) {
    console.error(`Error fetching booking with ID ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Không thể lấy thông tin đặt vé. Vui lòng thử lại sau.');
  }
};

/**
 * Cancel a booking
 * @param {number} id Booking ID
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelBooking = async (id) => {
  try {
    const response = await API.delete(`/api/bookings/${id}`);
    return response.data.result;
  } catch (error) {
    console.error(`Error cancelling booking with ID ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Không thể hủy vé. Vui lòng thử lại sau.');
  }
};

/**
 * Get all bookings (admin only)
 * @returns {Promise<Array>} List of all bookings
 */
export const getAllBookings = async () => {
  try {
    const response = await API.get('/api/bookings');
    return response.data.result;
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    throw new Error(error.response?.data?.message || 'Không thể lấy danh sách đặt vé. Vui lòng thử lại sau.');
  }
};

/**
 * Get bookings by schedule ID
 * @param {number} scheduleId Schedule ID
 * @returns {Promise<Array>} List of bookings for the schedule
 */
export const getBookingsByScheduleId = async (scheduleId) => {
  try {
    const response = await API.get(`/api/bookings/schedule/${scheduleId}`);
    return response.data.result;
  } catch (error) {
    console.error(`Error fetching bookings for schedule ${scheduleId}:`, error);
    throw new Error(error.response?.data?.message || 'Không thể lấy danh sách đặt vé cho lịch trình. Vui lòng thử lại sau.');
  }
};

/**
 * Update booking status (admin/bus owner only)
 * @param {number} id Booking ID
 * @param {Object} data Update data
 * @returns {Promise<Object>} Updated booking
 */
export const updateBooking = async (id, data) => {
  try {
    const response = await API.put(`/api/bookings/${id}`, data);
    return response.data.result;
  } catch (error) {
    console.error(`Error updating booking with ID ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Không thể cập nhật thông tin đặt vé. Vui lòng thử lại sau.');
  }
};

/**
 * Delete a booking (admin only)
 * @param {number} id Booking ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteBooking = async (id) => {
  try {
    const response = await API.delete(`/api/bookings/${id}`);
    return response.data.result;
  } catch (error) {
    console.error(`Error deleting booking with ID ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Không thể xóa thông tin đặt vé. Vui lòng thử lại sau.');
  }
};