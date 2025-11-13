import PropTypes from 'prop-types';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Typography from '../../../../components/core/typography';
import Button from '../../../../components/core/button';
import Card from '../../../../components/core/card';
import Input from '../../../../components/core/form-controls/input';
import Select from '../../../../components/core/form-controls/select';

const BookingSteps = {
  PASSENGER_INFO: 'passenger_info',
  PAYMENT: 'payment',
  CONFIRMATION: 'confirmation',
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

  if (!isOpen) return null;

  const totalAmount = selectedSeats.reduce(
    (sum, seat) => sum + (seat.price || 0),
    0
  );

  const renderStepIndicator = () => {
    const steps = [
      { key: BookingSteps.PASSENGER_INFO, label: 'Thông tin hành khách' },
      { key: BookingSteps.PAYMENT, label: 'Thanh toán' },
      { key: BookingSteps.CONFIRMATION, label: 'Xác nhận' },
    ];

    return (
      <div className="flex items-center justify-center mb-4">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: currentStep === step.key ? 1.1 : 1 }}
              className={twMerge(
                'w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium',
                currentStep === step.key
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-500'
              )}
            >
              {index + 1}
            </motion.div>
            {index < steps.length - 1 && (
              <div className="w-10 h-1 bg-gray-200 mx-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: currentStep === step.key ? '100%' : '0%' }}
                  className="h-full bg-primary-600 transition-all duration-500"
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
      className="space-y-3"
    >
      {selectedSeats.map((seat, index) => (
        <Card key={seat.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
          <Card.Body className="p-3">
            <Typography variant="subtitle2" className="mb-2">
              Hành khách {index + 1} - Ghế {seat.number}
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Họ và tên"
                placeholder="Nhập tên hành khách"
                required
                size="small"
                onChange={(e) => {
                  const newInfo = [...passengerInfo];
                  newInfo[index] = { ...newInfo[index], name: e.target.value };
                  setPassengerInfo(newInfo);
                }}
              />
              <Input
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                type="tel"
                required
                size="small"
                onChange={(e) => {
                  const newInfo = [...passengerInfo];
                  newInfo[index] = { ...newInfo[index], phone: e.target.value };
                  setPassengerInfo(newInfo);
                }}
              />
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
      className="space-y-3"
    >
      <Card className="hover:shadow-md transition-shadow duration-300">
        <Card.Body className="p-3">
          <Typography variant="subtitle2" className="mb-2">
            Phương thức thanh toán
          </Typography>
          <Select
            label="Chọn phương thức thanh toán"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
            size="small"
            options={[
              { value: 'credit_card', label: 'Thẻ tín dụng' },
              { value: 'debit_card', label: 'Thẻ ATM' },
              { value: 'bank_transfer', label: 'Chuyển khoản' },
            ]}
          />
        </Card.Body>
      </Card>

      <Card className="hover:shadow-md transition-shadow duration-300">
        <Card.Body className="p-3">
          <Typography variant="subtitle2" className="mb-2">
            Tổng quan đặt vé
          </Typography>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Số ghế đã chọn:
              </span>
              <span className="font-medium">
                {selectedSeats.map((s) => s.number).join(', ')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Tổng tiền:
              </span>
              <span className="font-semibold text-primary-600">
                {totalAmount.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );

  const renderConfirmation = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-3 py-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="flex justify-center mb-4"
      >
        <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center">
          <CheckCircleOutlineIcon className="w-10 h-10 text-success-500" />
        </div>
      </motion.div>
      <Typography variant="h6" className="font-semibold">
        Đặt vé thành công!
      </Typography>
      <Typography variant="body2" className="text-gray-600">
        Vé đã được đặt thành công. Bạn sẽ nhận được email xác nhận trong thời gian sớm nhất.
      </Typography>
    </motion.div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case BookingSteps.PASSENGER_INFO:
        return renderPassengerInfo();
      case BookingSteps.PAYMENT:
        return renderPayment();
      case BookingSteps.CONFIRMATION:
        return renderConfirmation();
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (currentStep === BookingSteps.PASSENGER_INFO) {
      setCurrentStep(BookingSteps.PAYMENT);
    } else if (currentStep === BookingSteps.PAYMENT) {
      onConfirm?.({ passengerInfo, paymentMethod });
      setCurrentStep(BookingSteps.CONFIRMATION);
    }
  };

  const handleBack = () => {
    if (currentStep === BookingSteps.PAYMENT) {
      setCurrentStep(BookingSteps.PASSENGER_INFO);
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
            className={twMerge("modal-content", className)}
          >
            <div className="modal-header">
              <Typography variant="h6" className="font-semibold">
                Đặt vé xe BenXeRe
              </Typography>
              <button onClick={onClose} className="modal-close-button">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body">
              {renderStepIndicator()}
              {renderStepContent()}
            </div>

            <div className="modal-footer">
              {currentStep !== BookingSteps.PASSENGER_INFO && 
               currentStep !== BookingSteps.CONFIRMATION && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 
                           hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Quay lại
                </button>
              )}
              
              {currentStep !== BookingSteps.CONFIRMATION ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 
                           hover:bg-primary-700 rounded-lg ml-3 transition-colors
                           flex items-center gap-1"
                >
                  {currentStep === BookingSteps.PAYMENT ? 'Xác nhận' : 'Tiếp tục'}
                  <ArrowForwardIcon className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 
                           hover:bg-primary-700 rounded-lg ml-3 transition-colors"
                >
                  Hoàn tất
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

BookingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedSeats: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      number: PropTypes.string.isRequired,
      price: PropTypes.number,
    })
  ),
  schedule: PropTypes.shape({
    id: PropTypes.string.isRequired,
    // Add other schedule-related props as needed
  }),
  onConfirm: PropTypes.func,
  className: PropTypes.string,
};

export default BookingModal;