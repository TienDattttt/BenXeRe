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
  Alert,
} from '@mui/material';
import { changeCustomerSeats } from '../../services/customer-care/customer-care-api';

const SeatChangeForm = ({ schedule, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    bookingId: '',
    newSeatIds: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await changeCustomerSeats(formData);
      onSuccess(response);
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi đổi chỗ');
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

    if (name === 'bookingId') {
      const booking = schedule.bookings?.find(b => b.bookingId === value);
      setSelectedBooking(booking);
    }
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

        {/* Booking Selection */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Chọn đặt chỗ</InputLabel>
            <Select
              name="bookingId" 
              value={formData.bookingId || ''}
              onChange={(e) => {
                console.log('Selected booking:', e.target.value);
                handleChange(e);
              }}
              label="Chọn đặt chỗ"
            >
              {Array.isArray(schedule?.bookings) && schedule.bookings.length > 0 ? (
                schedule.bookings.map((booking) => {
                  console.log('Booking option:', booking);
                  return (
                    <MenuItem key={booking.bookingId} value={booking.bookingId}>
                      Đặt chỗ #{booking.bookingId} - {booking.user?.firstName} {booking.user?.lastName}
                    </MenuItem>
                  );
                })
              ) : (
                <MenuItem disabled>Không có đặt chỗ nào</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>

        {/* Current Seats */}
        {selectedBooking && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" className="mb-2">
              Ghế hiện tại:
            </Typography>
            <Box className="p-3 bg-gray-50 rounded-lg">
              {selectedBooking.seats?.map((seat) => (
                <Typography key={seat.seatId} variant="body2" className="text-gray-600">
                  Ghế {seat.seatNumber}
                </Typography>
              ))}
            </Box>
          </Grid>
        )}

        {/* New Seat Selection */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Chọn ghế mới</InputLabel>
            <Select
              multiple
              name="newSeatIds"
              value={formData.newSeatIds}
              onChange={handleChange}
              label="Chọn ghế mới"
            >
              {schedule?.seats?.map((seat) => (
                <MenuItem
                  key={seat.seatId}
                  value={seat.seatId}
                  disabled={seat.booked && !selectedBooking?.seats?.some(s => s.seatId === seat.seatId)}
                >
                  Ghế {seat.seatNumber} {seat.booked && !selectedBooking?.seats?.some(s => s.seatId === seat.seatId) ? '(Đã đặt)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Error Message */}
        {error && (
          <Grid item xs={12}>
            <Alert severity="error" className="text-sm">
              {error}
            </Alert>
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
              disabled={loading || !formData.bookingId || formData.newSeatIds.length === 0}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận đổi chỗ'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default SeatChangeForm; 