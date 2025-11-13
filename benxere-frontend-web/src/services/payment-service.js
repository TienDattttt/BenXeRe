import api from './api';

export class PaymentError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export const ERROR_CODES = {
  PAYMENT_NOT_FOUND: '1020',
  INVALID_PAYMENT_METHOD: '1021',
  PAYMENT_CREATION_FAILED: '1022',
  PAYMENT_VERIFICATION_FAILED: '1023',
  INVALID_CALLBACK_DATA: '1024',
  INVALID_TRANSACTION_ID: '1025'
};

export const PAYMENT_METHODS = {
  ZALOPAY: 'ZALOPAY',
  MOMO: 'MOMO',
  VNPAY: 'VNPAY',
};

// Define which payment methods require a return URL
export const ONLINE_PAYMENT_METHODS = [
  PAYMENT_METHODS.ZALOPAY,
  PAYMENT_METHODS.MOMO,
  PAYMENT_METHODS.VNPAY,
];

// Validate required booking fields
const validateBookingRequest = (bookingDetails) => {
  const requiredFields = {
    scheduleId: 'ID chuyến xe',
    seatIds: 'Danh sách ghế',
    pickUpLocationId: 'Điểm đón',
    dropOffLocationId: 'Điểm trả',
    paymentMethod: 'Phương thức thanh toán'
  };

  const errors = [];
  
  // Check required fields
  Object.entries(requiredFields).forEach(([field, label]) => {
    if (!bookingDetails[field]) {
      errors.push(`${label} là bắt buộc`);
    }
  });

  // Validate seat IDs
  if (bookingDetails.seatIds?.length === 0) {
    errors.push('Phải chọn ít nhất một ghế');
  }

  // Validate payment method
  if (bookingDetails.paymentMethod) {
    if (!Object.values(PAYMENT_METHODS).includes(bookingDetails.paymentMethod)) {
      errors.push('Phương thức thanh toán không hợp lệ');
    }
    // Check if return URL is required for online payment methods
    if (ONLINE_PAYMENT_METHODS.includes(bookingDetails.paymentMethod) && !bookingDetails.returnUrl) {
      errors.push('URL callback là bắt buộc cho thanh toán trực tuyến');
    }
  }

  if (errors.length > 0) {
    throw new PaymentError(
      ERROR_CODES.PAYMENT_CREATION_FAILED,
      errors.join(', ')
    );
  }
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
};

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED'
};

// Validate payment method against backend enum
const validatePaymentMethod = (method) => {
  const validMethods = Object.values(PAYMENT_METHODS);
  if (!validMethods.includes(method)) {
    throw new PaymentError(
      ERROR_CODES.INVALID_PAYMENT_METHOD,
      'Phương thức thanh toán không hợp lệ'
    );
  }
  return method;
};

const BOOKING_CACHE_KEY = 'pending_booking_details';

const generateFallbackMomoUrl = (bookingId, amount, returnUrl) => {
  const momoEndpoint = 'https://payment.momo.vn/v2/gateway/api/create';
  const orderId = bookingId;
  const requestId = `REQ_${Date.now()}`;
  
  const url = new URL(momoEndpoint);
  
  url.searchParams.append('orderId', orderId);
  url.searchParams.append('amount', amount);
  url.searchParams.append('requestId', requestId);
  url.searchParams.append('returnUrl', returnUrl);
  
  console.log('Generated fallback MoMo URL:', url.toString());
  
  return url.toString();
};

export const createBookingPayment = async (bookingDetails) => {
  try {
    validateBookingRequest(bookingDetails);

    localStorage.setItem(BOOKING_CACHE_KEY, JSON.stringify({
      ...bookingDetails,
      timestamp: new Date().toISOString()
    }));

    const requestPayload = {
      scheduleId: bookingDetails.scheduleId,
      seatIds: bookingDetails.seatIds,
      pickUpLocationId: bookingDetails.pickUpLocationId,
      dropOffLocationId: bookingDetails.dropOffLocationId,
      paymentMethod: bookingDetails.paymentMethod,
      returnUrl: bookingDetails.returnUrl || `${window.location.origin}/payment-callback`
    };

    // Only add couponId to the request if it exists and is valid
    if (bookingDetails.couponId && bookingDetails.couponId > 0) {
      requestPayload.couponId = bookingDetails.couponId;
    }

    // Create booking with all required fields
    const response = await api.post('/api/bookings', requestPayload);

    // Log response for debugging
    console.log('Booking response:', response.data);

    // Validate response format according to API documentation
    const { result } = response.data;
    if (!result?.booking?.bookingId || !result?.payment) {
      throw new PaymentError(
        ERROR_CODES.PAYMENT_CREATION_FAILED,
        'Không nhận được thông tin đặt vé hợp lệ'
      );
    }

    if (ONLINE_PAYMENT_METHODS.includes(bookingDetails.paymentMethod)) {
      if (!result.payment.paymentUrl) {
        if (bookingDetails.paymentMethod === PAYMENT_METHODS.MOMO) {
          console.warn('Missing MoMo payment URL from API, generating fallback URL');
          const amount = result.payment.amount || result.booking.totalAmount;
          result.payment.paymentUrl = generateFallbackMomoUrl(
            result.booking.bookingId, 
            amount, 
            requestPayload.returnUrl
          );
        } else {
          throw new PaymentError(
            ERROR_CODES.PAYMENT_CREATION_FAILED,
            'Không nhận được đường dẫn thanh toán'
          );
        }
      }
    }

    // Store payment and booking IDs
    localStorage.setItem('lastBookingId', result.booking.bookingId);
    localStorage.setItem('lastPaymentId', result.payment.paymentId);

    // Clear cached booking details on success
    localStorage.removeItem(BOOKING_CACHE_KEY);

    return {
      booking: result.booking,
      payment: result.payment
    };
  } catch (error) {
    if (error instanceof PaymentError) {
      throw error;
    }

    // Handle Axios error responses
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 400) {
        // Log validation error details
        console.error('Backend validation error:', {
          message: data.message,
          errors: data.errors,
          data: data
        });
        
        // Extract validation error details
        let errorMessage = 'Dữ liệu không hợp lệ';
        if (data.errors?.length > 0) {
          errorMessage = data.errors.map(err => err.defaultMessage || err).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        throw new PaymentError(ERROR_CODES.PAYMENT_CREATION_FAILED, errorMessage);
      }
      
      if (status === 404) {
        throw new PaymentError(ERROR_CODES.PAYMENT_NOT_FOUND, 'Không tìm thấy thông tin thanh toán');
      }

      if (status === 401 || status === 403) {
        throw new PaymentError(ERROR_CODES.PAYMENT_CREATION_FAILED, 'Không có quyền thực hiện thanh toán');
      }
    }

    // Handle network errors
    if (error.request) {
      throw new PaymentError(
        ERROR_CODES.PAYMENT_CREATION_FAILED,
        'Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.'
      );
    }

    // Handle other errors
    throw new PaymentError(
      ERROR_CODES.PAYMENT_CREATION_FAILED,
      'Đã xảy ra lỗi khi tạo thanh toán. Vui lòng thử lại.'
    );
  }
};

// Maximum number of retry attempts for network issues
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getPaymentStatus = async (paymentId, retryCount = 0) => {
  try {
    const response = await api.get(`/api/payments/${paymentId}`);
    console.log('Payment status response:', response.data);

    // Validate response format
    if (!response.data?.paymentStatus) {
      throw new PaymentError(
        ERROR_CODES.PAYMENT_VERIFICATION_FAILED,
        'Không nhận được trạng thái thanh toán hợp lệ'
      );
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      console.error('Payment status check error:', { status, data });

      if (status === 404) {
        throw new PaymentError(
          ERROR_CODES.PAYMENT_NOT_FOUND,
          'Không tìm thấy thông tin thanh toán'
        );
      }
    }

    // Handle network errors with retry logic
    if (error.request && retryCount < MAX_RETRIES) {
      console.log(`Retrying payment status check (${retryCount + 1}/${MAX_RETRIES})...`);
      await delay(RETRY_DELAY);
      return getPaymentStatus(paymentId, retryCount + 1);
    }

    throw new PaymentError(
      ERROR_CODES.PAYMENT_VERIFICATION_FAILED,
      'Không thể kiểm tra trạng thái thanh toán. Vui lòng thử lại sau.'
    );
  }
};

export const validateCallbackData = (method, data) => {
  switch (method) {
    case PAYMENT_METHODS.ZALOPAY:
      return Boolean(data.apptransid && data.status !== undefined);
    case PAYMENT_METHODS.MOMO:
      return Boolean(data.orderId && data.resultCode !== undefined);
    case PAYMENT_METHODS.VNPAY:
      return Boolean(
        data.vnp_ResponseCode &&
        data.vnp_TransactionNo &&
        data.vnp_Amount &&
        data.vnp_OrderInfo
      );
    default:
      throw new PaymentError(
        ERROR_CODES.INVALID_PAYMENT_METHOD,
        'Invalid payment method'
      );
  }
};