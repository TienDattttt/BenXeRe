import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const VNPayPayment = ({ paymentUrl, onError }) => {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (paymentUrl) {
      // Store important data in localStorage before redirecting
      const currentTimestamp = new Date().toISOString();
      localStorage.setItem('vnpay_redirect_time', currentTimestamp);
      
      // Redirect to VNPay payment gateway
      window.location.href = paymentUrl;
    } else {
      onError('Không nhận được đường dẫn thanh toán VNPay');
    }
  }, [paymentUrl, navigate, onError]);

  return (
    <Box sx={{ textAlign: 'center', my: 4 }}>
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Đang chuyển hướng đến cổng thanh toán VNPay...
      </Typography>
      <Alert severity="info" sx={{ mt: 2, maxWidth: 500, mx: 'auto' }}>
        Vui lòng không đóng trình duyệt trong quá trình thanh toán.
      </Alert>
    </Box>
  );
};

VNPayPayment.propTypes = {
  paymentUrl: PropTypes.string.isRequired,
  onError: PropTypes.func.isRequired
};

export default VNPayPayment;