import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { getPaymentStatus, PAYMENT_STATUS } from '../../services/payment-service';
import api from '../../services/api';

const VNPayCallbackHandler = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const processVNPayCallback = async () => {
      try {
        // Get query parameters from URL
        const queryParams = new URLSearchParams(location.search);
        const responseCode = queryParams.get('vnp_ResponseCode');
        const transactionNo = queryParams.get('vnp_TransactionNo');
        const amount = queryParams.get('vnp_Amount');
        const orderInfo = queryParams.get('vnp_OrderInfo');
        const txnRef = queryParams.get('vnp_TxnRef');

        console.log('VNPay callback params:', {
          responseCode,
          transactionNo,
          txnRef,
          amount,
          orderInfo
        });

        if (!responseCode) {
          setStatus('error');
          setMessage('Không nhận được thông tin từ cổng thanh toán VNPay');
          return;
        }

        // Call the API to process the payment result
        const response = await api.get('/api/payments/process-result', {
          params: {
            orderId: txnRef || transactionNo,
            resultCode: responseCode,
            message: responseCode === '00' ? 'Thành công' : 'Giao dịch không thành công',
            amount: amount ? parseInt(amount) / 100 : 0
          }
        });

        console.log('Process result response:', response.data);

        if (responseCode === '00') {
          setStatus('success');
          setMessage('Thanh toán thành công!');
          setPaymentDetails(response.data.result);
          
          // Clear any payment-related localStorage data
          localStorage.removeItem('vnpay_redirect_time');
          localStorage.removeItem('lastPaymentId');
        } else {
          setStatus('failed');
          setMessage('Giao dịch không thành công hoặc đã bị hủy bỏ');
        }
      } catch (error) {
        console.error('Error processing VNPay callback:', error);
        setStatus('error');
        setMessage('Đã xảy ra lỗi khi xử lý kết quả thanh toán');
      }
    };

    processVNPayCallback();
  }, [location]);

  const handleViewOrderDetails = () => {
    navigate('/account/orders');
  };

  const handleReturnToHome = () => {
    navigate('/');
  };

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              {message}
            </Typography>
          </Box>
        );
      
      case 'success':
        return (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 80 }} />
            <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
              {message}
            </Typography>
            
            {paymentDetails && (
              <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto', my: 3 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Số tiền:</strong> {paymentDetails.amount?.toLocaleString('vi-VN')} VND
                </Typography>
                {paymentDetails.transId && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Mã giao dịch:</strong> {paymentDetails.transId}
                  </Typography>
                )}
              </Paper>
            )}
            
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleViewOrderDetails}
                sx={{ mx: 1 }}
              >
                Xem chi tiết đơn hàng
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleReturnToHome}
                sx={{ mx: 1, mt: { xs: 2, sm: 0 } }}
              >
                Quay lại trang chủ
              </Button>
            </Box>
          </Box>
        );
      
      case 'failed':
      case 'error':
        return (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <CancelIcon color="error" sx={{ fontSize: 80 }} />
            <Typography variant="h5" sx={{ mt: 2, mb: 3 }}>
              {message}
            </Typography>
            
            <Alert severity="info" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
              Nếu tiền đã bị trừ từ tài khoản của bạn nhưng hệ thống không ghi nhận, 
              vui lòng liên hệ với Bến Xe Số qua hotline để được hỗ trợ.
            </Alert>
            
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleReturnToHome}
                sx={{ mx: 1 }}
              >
                Quay lại trang chủ
              </Button>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
        Kết quả thanh toán VNPay
      </Typography>
      
      {renderContent()}
    </Box>
  );
};

export default VNPayCallbackHandler;