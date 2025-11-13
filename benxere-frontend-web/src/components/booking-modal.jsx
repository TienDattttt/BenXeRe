import { useState, useEffect, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import Typography from './core/typography';
import Card from './core/card';
import Input from './core/form-controls/input';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PaymentForm from './payment/payment-form';
import {
  createBookingPayment,
  PaymentError,
  PAYMENT_METHODS,
  ERROR_CODES
} from '../services/payment-service';
import { getScheduleById } from '../services/schedule-service';
import '../styles/modal.css';

const BookingSteps = {
  PASSENGER_INFO: 'passenger_info',
  PAYMENT: 'payment'
};

const BookingModal = ({
  isOpen,
  onClose,
  selectedSeats = [],
  schedule,
  onConfirm,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(BookingSteps.PASSENGER_INFO);
  const [passengerInfo, setPassengerInfo] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bookingError, setBookingError] = useState(null);
  const [scheduleDetails, setScheduleDetails] = useState(null);

  // Fetch schedule details when modal opens
  useEffect(() => {
    const fetchScheduleDetails = async () => {
      if (isOpen && schedule?.id) {
        try {
          const details = await getScheduleById(schedule.id);
          setScheduleDetails(details);
        } catch (error) {
          console.error('Error fetching schedule details:', error);
          setBookingError('Không thể tải thông tin chuyến xe');
        }
      }
    };

    fetchScheduleDetails();
  }, [isOpen, schedule?.id]);

  // Handle cleanup when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setBookingError(null);
      setCurrentStep(BookingSteps.PASSENGER_INFO);
      setScheduleDetails(null);
    }
  }, [isOpen]);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    const pricePerSeat = scheduleDetails?.pricePerSeat || 0;
    return Number(pricePerSeat) * selectedSeats.length;
  }, [scheduleDetails?.pricePerSeat, selectedSeats.length]);

  if (!isOpen) return null;

  const handleCreateBooking = async () => {
    if (!paymentMethod) {
      setBookingError('Vui lòng chọn phương thức thanh toán');
      return;
    }

    try {
      setBookingError(null);

      // Create booking with all required fields
      const { booking, payment } = await createBookingPayment({
        scheduleId: schedule.id,
        seatIds: selectedSeats.map(seat => seat.id),
        pickUpLocationId: schedule.pickUpLocationId,
        dropOffLocationId: schedule.dropOffLocationId,
        passengerInfo,
        paymentMethod,
        amount: totalAmount,
        returnUrl: `${window.location.origin}/payment-callback` // Required for online payments
      });

      // Store references
      localStorage.setItem('lastBookingId', booking.bookingId);
      localStorage.setItem('lastPaymentId', payment.paymentId);

      // Handle online vs offline payments
      if (payment.paymentUrl) {
        // Validate payment URL for online payments
        const PAYMENT_DOMAINS = {
          [PAYMENT_METHODS.ZALOPAY]: ['.zalopay.com.vn', '.zalopay.vn'],
          [PAYMENT_METHODS.MOMO]: ['.momo.vn'],
          [PAYMENT_METHODS.VNPAY]: ['.vnpayment.vn']
        };

        const paymentUrl = new URL(payment.paymentUrl);
        const validDomains = PAYMENT_DOMAINS[paymentMethod];

        if (!validDomains?.some(domain => paymentUrl.hostname.endsWith(domain))) {
          throw new PaymentError(
            ERROR_CODES.INVALID_PAYMENT_URL,
            'Đường dẫn thanh toán không hợp lệ'
          );
        }

        // Redirect to payment gateway
        window.location.href = payment.paymentUrl;
      } else if (payment.status === 'COMPLETED') {
        // Handle successful offline payment
        onConfirm?.(booking);
      }
    } catch (err) {
      console.error('Booking/Payment error:', err);

      if (err instanceof PaymentError) {
        switch (err.code) {
          case ERROR_CODES.PAYMENT_NOT_FOUND:
            setBookingError('Không tìm thấy thông tin thanh toán. Vui lòng thử lại.');
            break;
          case ERROR_CODES.PAYMENT_CREATION_FAILED:
            setBookingError('Không thể tạo thanh toán. Vui lòng thử lại sau.');
            break;
          case ERROR_CODES.INVALID_PAYMENT_METHOD:
            setBookingError('Phương thức thanh toán không hợp lệ. Vui lòng chọn phương thức khác.');
            break;
          case ERROR_CODES.INVALID_PAYMENT_URL:
            setBookingError('Đường dẫn thanh toán không hợp lệ. Vui lòng thử phương thức thanh toán khác.');
            break;
          default:
            setBookingError(err.message);
        }
      } else if (err.response?.status === 400) {
        // Handle validation errors from backend
        const message = err.response.data?.message || 'Dữ liệu không hợp lệ';
        setBookingError(message);
      } else if (err instanceof TypeError) {
        if (err.message.includes('JSON')) {
          setBookingError('Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.');
        } else if (err.message.includes('URL')) {
          setBookingError('Đường dẫn thanh toán không hợp lệ. Vui lòng thử phương thức thanh toán khác.');
        } else {
          setBookingError('Đã xảy ra lỗi kỹ thuật. Vui lòng thử lại sau.');
        }
      } else if (err.message?.toLowerCase().includes('network')) {
        setBookingError('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.');
      } else {
        setBookingError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.');
      }

      // Clean up stored IDs if there's an error
      localStorage.removeItem('lastBookingId');
      localStorage.removeItem('lastPaymentId');
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: BookingSteps.PASSENGER_INFO, label: 'Thông tin hành khách' },
      { key: BookingSteps.PAYMENT, label: 'Thanh toán' }
    ];

    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: currentStep === step.key ? 1.1 : 1 }}
              className={twMerge(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                currentStep === step.key
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-500'
              )}
            >
              {index + 1}
            </motion.div>
            {index < steps.length - 1 && (
              <div className="w-12 h-1 bg-slate-200 mx-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: currentStep === steps[index + 1].key ? '100%' : '0%' }}
                  className="h-full bg-indigo-600 transition-all duration-500"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPassengerInfo = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {selectedSeats.map((seat, index) => (
        <Card key={seat.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
          <Card.Body className="p-4">
            <Typography variant="subtitle2" className="mb-3 font-medium">
              Hành khách {index + 1} - Ghế {seat.number}
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <Input
                  label="Họ và tên"
                  placeholder="Nhập tên hành khách"
                  required
                  size="small"
                  className="form-input"
                  onChange={(e) => {
                    const newInfo = [...passengerInfo];
                    newInfo[index] = { ...newInfo[index], name: e.target.value };
                    setPassengerInfo(newInfo);
                  }}
                />
              </div>
              <div className="form-group">
                <Input
                  label="Số điện thoại"
                  placeholder="Nhập số điện thoại"
                  type="tel"
                  required
                  size="small"
                  className="form-input"
                  onChange={(e) => {
                    const newInfo = [...passengerInfo];
                    newInfo[index] = { ...newInfo[index], phone: e.target.value };
                    setPassengerInfo(newInfo);
                  }}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      ))}
    </motion.div>
  );

  const renderPayment = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-5"
    >
      {/* Booking Summary */}
      <Card className="hover:shadow-xl transition-all duration-300 border-t-4 border-indigo-500">
        <Card.Body className="p-6">
          <Typography variant="h6" className="font-semibold mb-4 text-slate-800">
            Chi tiết đặt vé
          </Typography>
          <div className="space-y-4">
            {/* Trip Info Section */}
            <div className="bg-slate-50 p-5 rounded-lg">
              <div className="flex items-center mb-4">
                <span className="material-symbols-outlined text-indigo-600 mr-2">directions_bus</span>
                <Typography variant="subtitle2" className="text-slate-700 font-medium">
                  Thông tin chuyến xe
                </Typography>
              </div>
              <div className="flex justify-between text-sm py-1.5">
                <span className="text-slate-600">Chuyến xe:</span>
                <span className="font-medium text-slate-800">{scheduleDetails?.route?.name || 'Đang tải...'}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5">
                <span className="text-slate-600">Xe:</span>
                <span className="font-medium text-slate-800">{scheduleDetails?.bus?.name || 'Đang tải...'}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5">
                <span className="text-slate-600">Thời gian khởi hành:</span>
                <span className="font-medium text-slate-800">
                  {scheduleDetails?.departureTime
                    ? new Date(scheduleDetails.departureTime).toLocaleString('vi-VN')
                    : 'Đang tải...'}
                </span>
              </div>
              <div className="flex justify-between text-sm py-1.5">
                <span className="text-slate-600">Thời gian đến:</span>
                <span className="font-medium text-slate-800">
                  {scheduleDetails?.arrivalTime
                    ? new Date(scheduleDetails.arrivalTime).toLocaleString('vi-VN')
                    : 'Đang tải...'}
                </span>
              </div>
              <div className="flex justify-between text-sm py-1.5">
                <span className="text-slate-600">Số ghế:</span>
                <span className="font-medium text-slate-800">{selectedSeats.map((s) => s.number).join(', ')}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5">
                <span className="text-slate-600">Điểm đón:</span>
                <span className="font-medium text-slate-800">{scheduleDetails?.pickUpLocations?.[0]?.name || 'Đang tải...'}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5">
                <span className="text-slate-600">Điểm trả:</span>
                <span className="font-medium text-slate-800">{scheduleDetails?.dropOffLocations?.[0]?.name || 'Đang tải...'}</span>
              </div>
              <div className="flex justify-between text-sm mt-3 pt-3 border-t">
                <span className="text-slate-600">Tổng tiền:</span>
                <span className="font-semibold text-indigo-600 text-base">
                  {totalAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Payment Method Selection */}
      <Card className="hover:shadow-md transition-shadow duration-300">
        <Card.Body className="p-5">
          <Typography variant="subtitle1" className="font-medium mb-4 text-slate-800">
            Phương thức thanh toán
          </Typography>
          <PaymentForm
            amount={totalAmount}
            onSelectPaymentMethod={(method) => setPaymentMethod(method)}
            selectedMethod={paymentMethod}
          />
        </Card.Body>
      </Card>

      {bookingError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
          {bookingError}
        </div>
      )}
    </motion.div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case BookingSteps.PASSENGER_INFO:
        return renderPassengerInfo();
      case BookingSteps.PAYMENT:
        return renderPayment();
      default:
        return null;
    }
  };

  const handleNext = async () => {
    if (currentStep === BookingSteps.PASSENGER_INFO) {
      // Validate passenger info before proceeding
      const isValid = passengerInfo.every(info =>
        info?.name?.trim() && info?.phone?.trim()
      );

      if (!isValid) {
        alert('Vui lòng điền đầy đủ thông tin hành khách');
        return;
      }

      setCurrentStep(BookingSteps.PAYMENT);
      setBookingError(null); // Reset any previous booking errors
    } else if (currentStep === BookingSteps.PAYMENT) {
      // Validate payment method is selected
      if (!paymentMethod) {
        setBookingError('Vui lòng chọn phương thức thanh toán');
        return;
      }

      // Create booking and process payment
      await handleCreateBooking();
      // Note: No setting confirmation step here because we will be redirected to payment provider
    }
  };

  const handleBack = () => {
    if (currentStep === BookingSteps.PAYMENT) {
      setCurrentStep(BookingSteps.PASSENGER_INFO);
      setBookingError(null); // Reset any booking errors when going back
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={twMerge("modal-content admin-modal", className)}
          >
            <div className="modal-header">
              <div className="modal-header-title">
                <svg xmlns="http://www.w3.org/2000/svg" className="modal-header-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <Typography variant="h6" className="font-semibold">
                  Đặt vé xe BenXeRe
                </Typography>
              </div>
              <button onClick={onClose} className="modal-close-button">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body">
              {renderStepIndicator()}
              {renderStepContent()}
            </div>

            <div className="modal-footer">
              {currentStep === BookingSteps.PAYMENT && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn btn-secondary"
                >
                  Quay lại
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary"
              >
                {currentStep === BookingSteps.PAYMENT ? 'Xác nhận' : 'Tiếp tục'}
                <ArrowForwardIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;