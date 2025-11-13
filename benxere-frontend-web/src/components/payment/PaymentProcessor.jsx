import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { PAYMENT_METHODS } from '../../services/payment-service';
import ZaloPayPayment from './ZaloPayPayment';
import MomoPayment from './MomoPayment';
import VNPayPayment from './VNPayPayment';

const PaymentProcessor = ({ 
  paymentMethod, 
  paymentUrl, 
  onError, 
  onSuccess, 
  paymentDetails 
}) => {
  const [isProcessing, setIsProcessing] = useState(true);
  
  useEffect(() => {
    if (!paymentMethod || !paymentUrl) {
      onError('Thông tin thanh toán không hợp lệ');
      setIsProcessing(false);
    } else {
      setIsProcessing(true);
    }
  }, [paymentMethod, paymentUrl, onError]);

  if (!isProcessing) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Alert severity="error" sx={{ maxWidth: 500, mx: 'auto' }}>
          Không thể khởi tạo thanh toán. Vui lòng thử lại sau.
        </Alert>
      </Box>
    );
  }

  switch (paymentMethod) {
    case PAYMENT_METHODS.ZALOPAY:
      return (
        <ZaloPayPayment 
          paymentUrl={paymentUrl} 
          onError={onError} 
          onSuccess={onSuccess}
          paymentDetails={paymentDetails}
        />
      );
      
    case PAYMENT_METHODS.MOMO:
      return (
        <MomoPayment 
          paymentUrl={paymentUrl} 
          onError={onError}
          paymentDetails={paymentDetails}
        />
      );
      
    case PAYMENT_METHODS.VNPAY:
      return (
        <VNPayPayment
          paymentUrl={paymentUrl}
          onError={onError}
          paymentDetails={paymentDetails}
        />
      );

    default:
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Đang chuẩn bị thanh toán...
          </Typography>
        </Box>
      );
  }
};

PaymentProcessor.propTypes = {
  paymentMethod: PropTypes.string.isRequired,
  paymentUrl: PropTypes.string.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  paymentDetails: PropTypes.object
};

export default PaymentProcessor;