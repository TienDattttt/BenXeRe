import { useState, useEffect, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '../core/typography';
import Card from '../core/card';
import Input from '../core/form-controls/input';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PaymentForm from '../payment/payment-form';
import {
  createBookingPayment,
  PaymentError,
  PAYMENT_METHODS,
  ERROR_CODES
} from '../../services/payment-service';
import { getScheduleById } from '../../services/schedule-service';
import '../../styles/modal.css';

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

  useEffect(() => {
    if (schedule) {
      getScheduleById(schedule.id).then(setScheduleDetails).catch(console.error);
    }
  }, [schedule]);

  const handleNext = () => {
    if (currentStep === BookingSteps.PASSENGER_INFO) {
      setCurrentStep(BookingSteps.PAYMENT);
    } else {
      onConfirm({ passengerInfo, paymentMethod });
    }
  };

  const handleBack = () => {
    if (currentStep === BookingSteps.PAYMENT) {
      setCurrentStep(BookingSteps.PASSENGER_INFO);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      <div className={twMerge("step", currentStep === BookingSteps.PASSENGER_INFO && "active")}>
        Thông tin hành khách
      </div>
      <div className={twMerge("step", currentStep === BookingSteps.PAYMENT && "active")}>
        Thanh toán
      </div>
    </div>
  );

  const renderStepContent = () => {
    if (currentStep === BookingSteps.PASSENGER_INFO) {
      return (
        <div>
          <Typography variant="h6">Thông tin hành khách</Typography>
          <Input
            label="Họ và tên"
            value={passengerInfo.name || ''}
            onChange={(e) => setPassengerInfo({ ...passengerInfo, name: e.target.value })}
          />
          <Input
            label="Số điện thoại"
            value={passengerInfo.phone || ''}
            onChange={(e) => setPassengerInfo({ ...passengerInfo, phone: e.target.value })}
          />
        </div>
      );
    }

    if (currentStep === BookingSteps.PAYMENT) {
      return (
        <PaymentForm
          selectedSeats={selectedSeats}
          scheduleDetails={scheduleDetails}
          onPaymentMethodChange={setPaymentMethod}
          onError={setBookingError}
        />
      );
    }

    return null;
  };

  if (!isOpen) return null;

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