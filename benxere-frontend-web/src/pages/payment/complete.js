import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getPaymentStatus,
  validateCallbackData,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  ERROR_CODES,
  PaymentError
} from '../../services/payment-service';

const PaymentComplete = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);

  const getPaymentMethod = () => {
    if (searchParams.get('apptransid')) return PAYMENT_METHODS.ZALOPAY;
    if (searchParams.get('orderId')) return PAYMENT_METHODS.MOMO;
    if (searchParams.get('vnp_ResponseCode')) return PAYMENT_METHODS.VNPAY;
    return null;
  };

  const isPaymentSuccessful = (method, params) => {
    switch (method) {
      case PAYMENT_METHODS.ZALOPAY:
        return params.get('status') === '1';
      case PAYMENT_METHODS.MOMO:
        return params.get('resultCode') === '0';
      case PAYMENT_METHODS.VNPAY:
        return params.get('vnp_ResponseCode') === '00';
      default:
        return false;
    }
  };

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get payment method from callback parameters
        const paymentMethod = getPaymentMethod();
        if (!paymentMethod) {
          throw new PaymentError(
            ERROR_CODES.INVALID_CALLBACK_DATA,
            'Invalid payment callback data'
          );
        }

        // Validate callback data format
        const callbackData = Object.fromEntries(searchParams.entries());
        if (!validateCallbackData(paymentMethod, callbackData)) {
          throw new PaymentError(
            ERROR_CODES.INVALID_CALLBACK_DATA,
            'Missing required payment data'
          );
        }

        // Get booking ID from local storage
        const bookingId = localStorage.getItem('lastBookingId');
        if (!bookingId) {
          throw new PaymentError(
            ERROR_CODES.INVALID_TRANSACTION_ID,
            'Invalid booking reference'
          );
        }

        // Check payment status
        const paymentDetails = await getPaymentStatus(bookingId);
        setBookingDetails(paymentDetails.booking);

        // Verify payment success
        if (isPaymentSuccessful(paymentMethod, searchParams)) {
          setStatus(PAYMENT_STATUS.SUCCESS);
          // Auto-redirect after success
          setTimeout(() => {
            localStorage.removeItem('lastBookingId');
            navigate('/account/orders');
          }, 3000);
        } else {
          setStatus(PAYMENT_STATUS.FAILED);
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError(err instanceof PaymentError ? err.message : 'Failed to verify payment');
        setStatus('error');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  const renderContent = () => {
    switch (status) {
      case PAYMENT_STATUS.SUCCESS:
        return (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4">
              <svg
                className="w-full h-full text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thanh toán thành công!
            </h2>
            {bookingDetails && (
              <div className="space-y-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg max-w-sm mx-auto">
                  <h3 className="font-medium mb-2">Chi tiết đặt vé</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã đặt vé:</span>
                      <span className="font-medium">{bookingDetails.bookingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số ghế:</span>
                      <span className="font-medium">
                        {bookingDetails.seats?.join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="font-medium text-primary-600">
                        {bookingDetails.totalPrice?.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  Đang chuyển hướng đến trang đơn đặt vé của bạn...
                </p>
              </div>
            )}
          </div>
        );

      case PAYMENT_STATUS.FAILED:
        return (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4">
              <svg
                className="w-full h-full text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thanh toán thất bại
            </h2>
            <p className="text-gray-600 mb-4">
              Thanh toán không thành công. Vui lòng thử lại.
            </p>
            <div className="space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
              >
                Thử lại
              </button>
              <button
                onClick={() => navigate('/account/orders')}
                className="text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 inline-block"
              >
                Xem đơn đặt vé
              </button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4">
              <svg
                className="w-full h-full text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <div className="space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
              >
                Thử lại
              </button>
              <button
                onClick={() => navigate('/support')}
                className="text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 inline-block"
              >
                Liên hệ hỗ trợ
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="w-full h-full border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Đang xử lý thanh toán
            </h2>
            <p className="text-gray-600">Vui lòng đợi trong khi chúng tôi xác nhận thanh toán của bạn...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentComplete;