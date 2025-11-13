import React from 'react';
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
} from '@mui/material';

const SeatChangeDialog = React.memo(({ 
  schedule, 
  open, 
  onClose, 
  seatChangeForm, 
  setSeatChangeForm,
  onSubmit 
}) => {
  if (!schedule) return null;

  const bookedSeats = schedule.seats?.filter(seat => seat.booked) || [];
  const availableSeats = schedule.seats?.filter(seat => !seat.booked) || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Đổi chỗ hành khách</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="ID Đặt chỗ"
              type="number"
              value={seatChangeForm.bookingId || ''}
              onChange={(e) => setSeatChangeForm(prev => ({ 
                ...prev, 
                bookingId: parseInt(e.target.value) 
              }))}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Ghế hiện tại</InputLabel>
              <Select
                multiple
                value={seatChangeForm.oldSeatIds}
                onChange={(e) => setSeatChangeForm(prev => ({ 
                  ...prev, 
                  oldSeatIds: e.target.value 
                }))}
                renderValue={(selected) => selected.join(', ')}
              >
                {bookedSeats.map((seat) => (
                  <MenuItem key={seat.seatId} value={seat.seatId}>
                    Ghế {seat.seatNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Ghế mới</InputLabel>
              <Select
                multiple
                value={seatChangeForm.newSeatIds}
                onChange={(e) => setSeatChangeForm(prev => ({ 
                  ...prev, 
                  newSeatIds: e.target.value 
                }))}
                renderValue={(selected) => selected.join(', ')}
              >
                {availableSeats.map((seat) => (
                  <MenuItem key={seat.seatId} value={seat.seatId}>
                    Ghế {seat.seatNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button 
          onClick={onSubmit}
          variant="contained"
          disabled={!seatChangeForm.bookingId || !seatChangeForm.oldSeatIds.length || !seatChangeForm.newSeatIds.length}
        >
          Đổi chỗ
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default SeatChangeDialog; 