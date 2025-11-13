import React, { useState } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { createBookingForCustomer } from '../../services/customer-care/customer-care-api';

const BookingForm = ({ schedule, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    scheduleId: schedule?.scheduleId || '',
    seatIds: [],
    pickUpLocationId: '',
    dropOffLocationId: '',
    couponId: '',
    couponCode: '',
    paymentMethod: 'CASH',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await createBookingForCustomer(formData);
      onSuccess(response);
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đặt chỗ');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Schedule Info */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" className="font-medium mb-2">
            Thông tin chuyến xe
          </Typography>
          <Box className="p-4 bg-gray-50 rounded-lg">
            <Typography variant="body2" className="text-gray-600">
              {schedule?.route?.origin} → {schedule?.route?.destination}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Khởi hành: {new Date(schedule?.departureTime).toLocaleString('vi-VN')}
            </Typography>
          </Box>
        </Grid>

        {/* Seat Selection */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Chọn ghế</InputLabel>
            <Select
              multiple
              name="seatIds"
              value={formData.seatIds}
              onChange={handleChange}
              label="Chọn ghế"
            >
              {schedule?.seats?.map((seat) => (
                <MenuItem
                  key={seat.seatId}
                  value={seat.seatId}
                  disabled={seat.booked}
                >
                  Ghế {seat.seatNumber} {seat.booked ? '(Đã đặt)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Pickup/Dropoff Locations */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Điểm đón</InputLabel>
            <Select
              name="pickUpLocationId"
              value={formData.pickUpLocationId}
              onChange={handleChange}
              label="Điểm đón"
            >
              {schedule?.pickUpLocations?.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Điểm trả</InputLabel>
            <Select
              name="dropOffLocationId"
              value={formData.dropOffLocationId}
              onChange={handleChange}
              label="Điểm trả"
            >
              {schedule?.dropOffLocations?.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Coupon */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="couponCode"
            label="Mã giảm giá"
            value={formData.couponCode}
            onChange={handleChange}
          />
        </Grid>

        {/* Payment Method */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Phương thức thanh toán</InputLabel>
            <Select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              label="Phương thức thanh toán"
            >
              <MenuItem value="CASH">Tiền mặt</MenuItem>
              <MenuItem value="BANK_TRANSFER">Chuyển khoản</MenuItem>
              <MenuItem value="CREDIT_CARD">Thẻ tín dụng</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Error Message */}
        {error && (
          <Grid item xs={12}>
            <Typography color="error" className="text-sm">
              {error}
            </Typography>
          </Grid>
        )}

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box className="flex justify-end gap-2">
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Tạo đặt chỗ'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default BookingForm; 