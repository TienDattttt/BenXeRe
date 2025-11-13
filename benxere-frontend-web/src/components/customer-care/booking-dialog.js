import React, { memo, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  IconButton,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import { Search, User, MapPin, CreditCard, Banknote, Wallet, X as XIcon, CheckCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLocationNameByCode } from '../../utils/load-location';
import { getUserByEmail } from '../../services/user-service';

const BookingDialog = memo(({
  schedule,
  open,
  onClose,
  bookingForm,
  setBookingForm,
  allUsers,
  pickUpLocations,
  dropOffLocations,
  availableSeats,
  onSubmit,
  onLoadLocations,
}) => {
  const navigate = useNavigate();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [email, setEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasLoadedLocations, setHasLoadedLocations] = useState(false);

  useEffect(() => {
    if (open && schedule && !hasLoadedLocations) {
      onLoadLocations(schedule.scheduleId);
      setHasLoadedLocations(true);
    }
  }, [open, schedule, hasLoadedLocations, onLoadLocations]);

  useEffect(() => {
    if (!open) {
      setHasLoadedLocations(false);
    }
  }, [open]);

  const handleClose = () => {
    setEmail('');
    setSelectedUser(null);
    setEmailError('');
    setBookingSuccess(false);
    setBookingId(null);
    setHasLoadedLocations(false);
    onClose();
  };

  const handleEmailSearch = async (e) => {
    e.preventDefault(); // Prevent form submission
    if (!email) {
      setEmailError('Vui lòng nhập email');
      return;
    }

    try {
      setIsSearching(true);
      setEmailError('');
      const response = await getUserByEmail(email);
      if (response?.result) {
        setSelectedUser(response.result);
        setBookingForm(prev => ({
          ...prev,
          userId: response.result.userId
        }));
      }
    } catch (error) {
      console.error('Error searching user:', error);
      setEmailError('Không tìm thấy khách hàng với email này');
      setSelectedUser(null);
      setBookingForm(prev => ({
        ...prev,
        userId: null
      }));
    } finally {
      setIsSearching(false);
    }
  };

  const handleSeatChange = (event) => {
    setBookingForm(prev => ({
      ...prev,
      seatIds: event.target.value
    }));
  };

  const handleLocationChange = (type, value) => {
    setBookingForm(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handlePaymentMethodChange = (event) => {
    setBookingForm(prev => ({
      ...prev,
      paymentMethod: event.target.value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await onSubmit();
      if (response?.result?.bookingId) {
        setBookingSuccess(true);
        setBookingId(response.result.bookingId);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const handleViewBooking = () => {
    if (bookingId) {
      navigate(`/customer-care/bookings/${bookingId}`);
      onClose();
    }
  };

  const isFormValid = () => {
    return bookingForm.userId &&
           bookingForm.seatIds.length > 0 &&
           bookingForm.pickUpLocationId &&
           bookingForm.dropOffLocationId &&
           bookingForm.paymentMethod;
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'CASH':
        return <Banknote size={20} />;
      case 'CREDIT_CARD':
        return <CreditCard size={20} />;
      case 'WALLET':
        return <Wallet size={20} />;
      default:
        return null;
    }
  };

  const renderBookingForm = () => (
    <Grid container spacing={3}>
      {/* Schedule Information */}
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Thông tin chuyến xe
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Tuyến đường:</Typography>
              <Typography variant="body1">
                {schedule.route?.origin} → {schedule.route?.destination}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Thời gian khởi hành:</Typography>
              <Typography variant="body1">
                {new Date(schedule.departureTime).toLocaleString('vi-VN')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Biển số xe:</Typography>
              <Typography variant="body1">{schedule.bus?.busNumber}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Giá vé:</Typography>
              <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                {schedule.pricePerSeat?.toLocaleString('vi-VN')} VNĐ
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Customer Selection */}
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Thông tin khách hàng
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <form onSubmit={handleEmailSearch} style={{ display: 'flex', gap: '8px' }}>
                <TextField
                  fullWidth
                  label="Email khách hàng"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  error={!!emailError}
                  helperText={emailError}
                  placeholder="Nhập email khách hàng..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={20} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSearching || !email}
                  sx={{ minWidth: '120px' }}
                >
                  {isSearching ? <CircularProgress size={24} /> : 'Tìm kiếm'}
                </Button>
              </form>
            </Grid>
            
            {selectedUser && (
              <Grid item xs={12}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    bgcolor: 'primary.light',
                    borderRadius: 2,
                    color: 'primary.contrastText'
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>Họ tên:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {selectedUser.firstName} {selectedUser.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>Số điện thoại:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {selectedUser.phoneNumber || 'Chưa có'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>Email:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {selectedUser.email}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>

      {/* Seat Selection */}
      <Grid item xs={12}>
        <FormControl fullWidth required>
          <InputLabel>Chọn ghế</InputLabel>
          <Select
            multiple
            value={bookingForm.seatIds}
            onChange={handleSeatChange}
            label="Chọn ghế"
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((seatId) => {
                  const seat = schedule.seats.find(s => s.seatId === seatId);
                  return (
                    <Chip
                      key={seatId}
                      label={`Ghế ${seat?.seatNumber}`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  );
                })}
              </Box>
            )}
          >
            {schedule.seats?.map((seat) => (
              <MenuItem 
                key={seat.seatId} 
                value={seat.seatId}
                disabled={seat.booked}
                sx={{
                  opacity: seat.booked ? 0.7 : 1,
                  '&.Mui-disabled': {
                    color: 'text.secondary'
                  }
                }}
              >
                Ghế {seat.seatNumber} {seat.booked ? '(Đã đặt)' : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Pick-up Location */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Điểm đón</InputLabel>
          <Select
            value={bookingForm.pickUpLocationId || ''}
            onChange={(e) => handleLocationChange('pickUpLocationId', e.target.value)}
            label="Điểm đón"
            startAdornment={
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <MapPin size={20} />
              </Box>
            }
          >
            {pickUpLocations?.map((location) => (
              <MenuItem key={location.locationId} value={location.locationId}>
                {location.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Drop-off Location */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Điểm trả</InputLabel>
          <Select
            value={bookingForm.dropOffLocationId || ''}
            onChange={(e) => handleLocationChange('dropOffLocationId', e.target.value)}
            label="Điểm trả"
            startAdornment={
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <MapPin size={20} />
              </Box>
            }
          >
            {dropOffLocations?.map((location) => (
              <MenuItem key={location.locationId} value={location.locationId}>
                {location.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Payment Method */}
      <Grid item xs={12}>
        <FormControl fullWidth required>
          <InputLabel>Phương thức thanh toán</InputLabel>
          <Select
            value={bookingForm.paymentMethod || ''}
            onChange={handlePaymentMethodChange}
            label="Phương thức thanh toán"
          >
            <MenuItem value="CASH">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Banknote size={20} />
                <Typography>Tiền mặt</Typography>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Booking Summary */}
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Tổng kết đặt chỗ
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Số ghế đã chọn:</Typography>
                <Typography variant="body2">
                  {bookingForm.seatIds.length} ghế
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Giá vé:</Typography>
                <Typography variant="body2">
                  {schedule.pricePerSeat?.toLocaleString('vi-VN')} VNĐ/ghế
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Tổng tiền:</Typography>
                <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                  {(schedule.pricePerSeat * bookingForm.seatIds.length)?.toLocaleString('vi-VN')} VNĐ
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEnforceFocus
      disableAutoFocus
      keepMounted={false}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {bookingSuccess ? 'Đặt chỗ thành công' : 'Tạo đặt chỗ mới'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <XIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {bookingSuccess ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle size={64} color="#4CAF50" style={{ marginBottom: '1rem' }} />
            <Typography variant="h6" gutterBottom>
              Đặt chỗ thành công!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Mã đặt chỗ của bạn là: <strong>{bookingId}</strong>
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleViewBooking}
              startIcon={<ExternalLink />}
              sx={{ mt: 2 }}
            >
              Xem chi tiết đặt chỗ
            </Button>
          </Box>
        ) : (
          schedule && renderBookingForm()
        )}
      </DialogContent>

      {!bookingSuccess && (
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleClose} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!isFormValid()}
            startIcon={!isFormValid() && <CircularProgress size={20} />}
          >
            Xác nhận đặt chỗ
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
});

export default BookingDialog; 