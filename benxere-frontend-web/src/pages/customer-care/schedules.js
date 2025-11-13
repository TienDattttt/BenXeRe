import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  FormHelperText,
  CircularProgress,
  Container,
  Card,
  CardContent,
  Snackbar,
  useTheme,
  alpha,
} from '@mui/material';
import { Search, Calendar, MapPin, Clock, Users, Bus, User, Phone, Plus, ArrowLeftRight, CreditCard, Banknote, Wallet, XIcon, MessageSquare, Filter } from 'lucide-react';
import SidebarLayout from '../../components/layouts/customer-care/sidebar-layout';
import { getSchedulesByCustomerCare, createBookingForCustomer, changeCustomerSeats } from '../../services/customer-care/customer-care-api';
import { getPickUpSchedules, getDropOffSchedules } from '../../services/location-service';
import { getLocationNameByCode } from '../../utils/load-location';
import { getAllUsers } from '../../services/user-service';
import BookingDialog from '../../components/customer-care/booking-dialog';
import SeatChangeDialog from '../../components/customer-care/seat-change-dialog';
import { chatService } from '../../services/chat-service';
import ChatInterfaceV2 from '../../components/chat/chat-interface-v2';
import { getScheduleIssues, getScheduleStatus } from '../../services/schedule-service';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

const SchedulesPage = () => {
  const theme = useTheme();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showSeatChangeDialog, setShowSeatChangeDialog] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    scheduleId: null,
    seatIds: [],
    userId: null,
    pickUpLocationId: null,
    dropOffLocationId: null,
    paymentMethod: 'CASH',
  });
  const [seatChangeForm, setSeatChangeForm] = useState({
    bookingId: null,
    oldSeatIds: [],
    newSeatIds: [],
  });
  const [message, setMessage] = useState({ open: false, text: '', severity: 'success' });
  const [pickUpLocations, setPickUpLocations] = useState([]);
  const [dropOffLocations, setDropOffLocations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filterBus, setFilterBus] = useState('');
  const [filterRoute, setFilterRoute] = useState('');
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [scheduleIssues, setScheduleIssues] = useState([]);
  const [scheduleStatus, setScheduleStatus] = useState(null);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  useEffect(() => {
    fetchSchedules();
    loadUsers();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSchedulesByCustomerCare();
      const sortedSchedules = Array.isArray(response?.result) ? 
        response.result.sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime)) : [];
      setSchedules(sortedSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('Failed to load schedules. Please try again later.');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await getAllUsers();
      setAllUsers(response.result || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage({ open: true, text: 'Không thể tải danh sách người dùng', severity: 'error' });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Get unique buses and routes for filter dropdowns
  const busOptions = Array.from(new Set(schedules.map(s => s.bus?.busNumber).filter(Boolean)));
  const routeOptions = Array.from(new Set(schedules.map(s => {
    const originName = getLocationNameByCode(s.route?.origin);
    const destName = getLocationNameByCode(s.route?.destination);
    return originName && destName ? `${originName} → ${destName}` : null;
  }).filter(Boolean)));

  // Filter schedules based on search query and filters
  const filteredSchedules = schedules.filter((schedule) => {
    const searchMatch = Object.values(schedule).some((value) =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    const busMatch = filterBus ? schedule.bus?.busNumber === filterBus : true;
    const routeString = `${getLocationNameByCode(schedule.route?.origin)} → ${getLocationNameByCode(schedule.route?.destination)}`;
    const routeMatch = filterRoute ? routeString === filterRoute : true;
    return searchMatch && busMatch && routeMatch;
  });

  const getScheduleStatus = (departureTime) => {
    const now = new Date();
    const departure = new Date(departureTime);
    
    if (departure < now) return 'COMPLETED';
    if (departure.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return 'UPCOMING';
    return 'SCHEDULED';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return theme.palette.grey[500];
      case 'UPCOMING': return theme.palette.warning.main;
      case 'SCHEDULED': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'COMPLETED': return 'Đã hoàn thành';
      case 'UPCOMING': return 'Sắp khởi hành';
      case 'SCHEDULED': return 'Đã lên lịch';
      default: return status;
    }
  };

  const getStatusChip = (status) => {
    const statusColor = getStatusColor(status);
    const statusLabel = getStatusLabel(status);
    
    // Use predefined color values instead of theme values directly
    let chipProps = {};
    
    switch (status) {
      case 'COMPLETED':
        chipProps = { 
          color: 'default',
          sx: { backgroundColor: '#9e9e9e', color: '#fff' } 
        };
        break;
      case 'UPCOMING':
        chipProps = { 
          color: 'warning',
          sx: { backgroundColor: '#ed6c02', color: '#fff' } 
        };
        break;
      case 'SCHEDULED':
        chipProps = { 
          color: 'success',
          sx: { backgroundColor: '#2e7d32', color: '#fff' } 
        };
        break;
      default:
        chipProps = { 
          color: 'default',
          sx: { backgroundColor: '#9e9e9e', color: '#fff' } 
        };
    }
    
    return (
      <Chip
        label={statusLabel}
        size="small"
        {...chipProps}
      />
    );
  };

  const handleViewDetails = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDetailsDialog(true);
    fetchScheduleIssues(schedule.scheduleId);
    fetchScheduleStatus(schedule.scheduleId);
  };

  const handleCloseDetails = () => {
    setShowDetailsDialog(false);
    setSelectedSchedule(null);
  };

  const handleOpenBookingDialog = async (schedule) => {
    try {
      setSelectedSchedule(schedule);
      setBookingForm({
        scheduleId: schedule.scheduleId,
        seatIds: [],
        userId: null,
        pickUpLocationId: null,
        dropOffLocationId: null,
        paymentMethod: 'CASH',
      });
      await loadLocations(schedule.scheduleId);
      setShowBookingDialog(true);
    } catch (error) {
      console.error('Error opening booking dialog:', error);
      setMessage({
        open: true,
        text: error.message || 'Không thể tải thông tin điểm đón/trả. Vui lòng thử lại',
        severity: 'error'
      });
    }
  };

  const handleCloseBookingDialog = () => {
    setShowBookingDialog(false);
    setSelectedSchedule(null);
    setPickUpLocations([]);
    setDropOffLocations([]);
    setBookingForm({
      scheduleId: null,
      seatIds: [],
      userId: null,
      pickUpLocationId: null,
      dropOffLocationId: null,
      paymentMethod: 'CASH',
    });
  };

  const handleCreateBooking = async () => {
    setLoadingLocations(true);
    try {
      if (!bookingForm.scheduleId || !bookingForm.userId ||
          !bookingForm.seatIds.length || !bookingForm.pickUpLocationId ||
          !bookingForm.dropOffLocationId || !bookingForm.paymentMethod) {
        throw new Error('Vui lòng điền đầy đủ thông tin đặt chỗ');
      }

      const bookingData = {
        scheduleId: bookingForm.scheduleId,
        seatIds: bookingForm.seatIds,
        pickUpLocationId: bookingForm.pickUpLocationId,
        dropOffLocationId: bookingForm.dropOffLocationId,
        userId: bookingForm.userId,
        couponId: 0,
        couponCode: "",
        status: "PENDING",
        paymentMethod: bookingForm.paymentMethod,
        returnUrl: "http://localhost:3000/payment/return"
      };

      const response = await createBookingForCustomer(bookingData);
      
      if (response.code === 1000) {
        setMessage({
          open: true,
          text: 'Tạo đặt chỗ thành công',
          severity: 'success'
        });
        
        console.log('Booking created:', {
          bookingId: response.result.bookingId,
          userId: response.result.userId,
          scheduleId: response.result.scheduleId,
          originalPrice: response.result.originalPrice,
          totalPrice: response.result.totalPrice,
          status: response.result.status,
          seatIds: response.result.seatIds,
          pickUpLocationId: response.result.pickUpLocationId,
          dropOffLocationId: response.result.dropOffLocationId
        });

        handleCloseBookingDialog();
        fetchSchedules();
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra khi tạo đặt chỗ');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setMessage({
        open: true,
        text: error.message || 'Có lỗi xảy ra khi tạo đặt chỗ',
        severity: 'error'
      });
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleChangeSeats = async () => {
    setLoadingLocations(true);
    try {
      if (!seatChangeForm.bookingId || !seatChangeForm.oldSeatIds.length || !seatChangeForm.newSeatIds.length) {
        throw new Error('Vui lòng điền đầy đủ thông tin đổi ghế');
      }

      await changeCustomerSeats(seatChangeForm);
      
      setMessage({
        open: true,
        text: 'Đổi ghế thành công',
        severity: 'success'
      });
      
      setShowSeatChangeDialog(false);
      setSeatChangeForm({
        bookingId: null,
        oldSeatIds: [],
        newSeatIds: [],
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error changing seats:', error);
      setMessage({
        open: true,
        text: error.message || 'Có lỗi xảy ra khi đổi ghế',
        severity: 'error'
      });
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadLocations = async (scheduleId) => {
    setLoadingLocations(true);
    try {
      const [pickUpResponse, dropOffResponse] = await Promise.all([
        getPickUpSchedules(scheduleId),
        getDropOffSchedules(scheduleId)
      ]);

      const pickUpLocations = Array.isArray(pickUpResponse) ? pickUpResponse :
                            pickUpResponse.result || pickUpResponse.data || [];
      const dropOffLocations = Array.isArray(dropOffResponse) ? dropOffResponse :
                              dropOffResponse.result || dropOffResponse.data || [];

      setPickUpLocations(pickUpLocations);
      setDropOffLocations(dropOffLocations);
    } catch (error) {
      console.error('Error loading locations:', error);
      throw new Error('Không thể tải danh sách điểm đón/trả');
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleOpenChat = (user) => {
    setSelectedChatUser({
      userId: user.userId,
      email: user.email
    });
    setShowChatInterface(true);
  };

  const fetchScheduleIssues = async (scheduleId) => {
    if (!scheduleId) return;
    
    console.log(`Customer-care page: Fetching issues for schedule ${scheduleId}`);
    try {
      setLoadingIssues(true);
      const issues = await getScheduleIssues(scheduleId);
      console.log('Customer-care page: Got schedule issues:', issues);
      setScheduleIssues(Array.isArray(issues) ? issues : []);
    } catch (error) {
      console.error('Customer-care page: Error fetching schedule issues:', error);
      setMessage({ open: true, text: 'Không thể tải thông tin sự cố', severity: 'error' });
    } finally {
      setLoadingIssues(false);
    }
  };
  
  const fetchScheduleStatus = async (scheduleId) => {
    if (!scheduleId) return;
    
    console.log(`Customer-care page: Fetching status for schedule ${scheduleId}`);
    try {
      setLoadingStatus(true);
      const status = await getScheduleStatus(scheduleId);
      console.log('Customer-care page: Got schedule status:', status);
      setScheduleStatus(status);
    } catch (error) {
      console.error('Customer-care page: Error fetching schedule status:', error);
      setMessage({ open: true, text: 'Không thể tải thông tin trạng thái', severity: 'error' });
    } finally {
      setLoadingStatus(false);
    }
  };

  const getIssueTypeLabel = (issueType) => {
    switch (issueType) {
      case 'MECHANICAL': return 'Sự cố kỹ thuật';
      case 'ACCIDENT': return 'Tai nạn';
      case 'DELAY': return 'Chậm trễ';
      case 'PASSENGER': return 'Vấn đề hành khách';
      case 'WEATHER': return 'Thời tiết xấu';
      case 'OTHER': return 'Khác';
      default: return issueType;
    }
  };
  
  const getIssueStatusClass = (status) => {
    // Return fixed color values instead of theme properties
    switch (status) {
      case 'REPORTED': return '#f44336'; // red
      case 'IN_PROGRESS': return '#ff9800'; // orange 
      case 'RESOLVED': return '#4caf50'; // green
      default: return '#9e9e9e'; // grey
    }
  };
  
  const getIssueStatusLabel = (status) => {
    switch (status) {
      case 'REPORTED': return 'Đã báo cáo';
      case 'IN_PROGRESS': return 'Đang xử lý';
      case 'RESOLVED': return 'Đã giải quyết';
      default: return status;
    }
  };
  
  const getScheduleStatusLabel = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'Đã lên lịch';
      case 'STARTED': return 'Đã bắt đầu';
      case 'COMPLETED': return 'Đã hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      case 'DELAYED': return 'Bị trễ';
      default: return status;
    }
  };
  
  const getScheduleStatusColor = (status) => {
    // Return fixed color values instead of theme properties
    switch (status) {
      case 'SCHEDULED': return '#2196f3'; // blue
      case 'STARTED': return '#4caf50'; // green
      case 'COMPLETED': return '#9c27b0'; // purple
      case 'CANCELLED': return '#f44336'; // red
      case 'DELAYED': return '#ff9800'; // orange
      default: return '#9e9e9e'; // grey
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Quản lý Lịch trình
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Tìm kiếm lịch trình..."
                  value={searchQuery}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.paper,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Filter />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{ borderRadius: 2 }}
                  >
                    Bộ lọc
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Plus />}
                    onClick={() => {
                      setSelectedSchedule(null);
                      setBookingForm({
                        scheduleId: null,
                        seatIds: [],
                        userId: null,
                        pickUpLocationId: null,
                        dropOffLocationId: null,
                        paymentMethod: 'CASH',
                      });
                      setShowBookingDialog(true);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    Đặt vé mới
                  </Button>
                </Box>
              </Grid>
            </Grid>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper sx={{ mt: 2, p: 2, borderRadius: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Xe bus</InputLabel>
                          <Select
                            value={filterBus}
                            onChange={(e) => setFilterBus(e.target.value)}
                            label="Xe bus"
                          >
                            <MenuItem value="">Tất cả</MenuItem>
                            {busOptions.map((bus) => (
                              <MenuItem key={bus} value={bus}>{bus}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Tuyến đường</InputLabel>
                          <Select
                            value={filterRoute}
                            onChange={(e) => setFilterRoute(e.target.value)}
                            label="Tuyến đường"
                          >
                            <MenuItem value="">Tất cả</MenuItem>
                            {routeOptions.map((route) => (
                              <MenuItem key={route} value={route}>{route}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </motion.div>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              {filteredSchedules.map((schedule) => {
                const status = getScheduleStatus(schedule.departureTime);
                return (
                  <Grid item xs={12} md={6} lg={4} key={schedule.scheduleId}>
                    <motion.div variants={cardVariants}>
                      <Card
                        sx={{
                          borderRadius: 2,
                          boxShadow: theme.shadows[2],
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[8],
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {getStatusChip(status)}
                            <Typography variant="caption" color="text.secondary">
                              {new Date(schedule.departureTime).toLocaleDateString()}
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              {getLocationNameByCode(schedule.route?.origin)} →{' '}
                              {getLocationNameByCode(schedule.route?.destination)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Xe: {schedule.bus?.busNumber}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Clock size={16} />
                              <Typography variant="body2">
                                {new Date(schedule.departureTime).toLocaleTimeString()}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Users size={16} />
                              <Typography variant="body2">
                                {schedule.seats?.filter(seat => seat.booked).length || 0}/{schedule.seats?.length || 0} ghế đã đặt
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Plus />}
                              onClick={() => {
                                setSelectedSchedule(schedule);
                                setBookingForm({
                                  scheduleId: schedule.scheduleId,
                                  seatIds: [],
                                  userId: null,
                                  pickUpLocationId: null,
                                  dropOffLocationId: null,
                                  paymentMethod: 'CASH',
                                });
                                handleOpenBookingDialog(schedule);
                              }}
                              sx={{ borderRadius: 2, flex: 1 }}
                            >
                              Đặt vé
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<MessageSquare />}
                              onClick={() => {
                                setSelectedSchedule(schedule);
                                setShowDetailsDialog(true);
                              }}
                              sx={{ borderRadius: 2, flex: 1 }}
                            >
                              Chi tiết
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>
          </motion.div>
        )}

        <BookingDialog
          open={showBookingDialog}
          onClose={handleCloseBookingDialog}
          schedule={selectedSchedule}
          bookingForm={bookingForm}
          setBookingForm={setBookingForm}
          allUsers={allUsers}
          pickUpLocations={pickUpLocations}
          dropOffLocations={dropOffLocations}
          availableSeats={selectedSchedule?.seats?.filter(seat => !seat.booked) || []}
          onSubmit={handleCreateBooking}
          onLoadLocations={loadLocations}
        />

        <SeatChangeDialog
          open={showSeatChangeDialog}
          onClose={() => setShowSeatChangeDialog(false)}
          seatChangeForm={seatChangeForm}
          setSeatChangeForm={setSeatChangeForm}
          onSubmit={handleChangeSeats}
        />

        <Snackbar
          open={message.open}
          autoHideDuration={6000}
          onClose={() => setMessage({ ...message, open: false })}
        >
          <Alert severity={message.severity} onClose={() => setMessage({ ...message, open: false })}>
            {message.text}
          </Alert>
        </Snackbar>

        {/* Details Dialog */}
        <Dialog
          open={showDetailsDialog}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Chi tiết lịch trình</Typography>
              <IconButton onClick={handleCloseDetails} size="small">
                <XIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedSchedule && (
              <Grid container spacing={3}>
                {/* Add Schedule Status Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <InfoIcon sx={{ mr: 1 }} fontSize="small" />
                    Trạng thái Chuyến Xe
                  </Typography>
                  {loadingStatus ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : scheduleStatus ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                        <Chip
                          label={getScheduleStatusLabel(scheduleStatus.status)}
                          size="small"
                          sx={{
                            backgroundColor: alpha(getScheduleStatusColor(scheduleStatus.status), 0.1),
                            color: getScheduleStatusColor(scheduleStatus.status),
                            fontWeight: 'medium',
                            mt: 0.5,
                            '& .MuiChip-label': {
                              color: getScheduleStatusColor(scheduleStatus.status)
                            }
                          }}
                        />
                      </Grid>
                      {scheduleStatus.actualStartTime && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">Thời gian bắt đầu thực tế:</Typography>
                          <Typography variant="body1">
                            {new Date(scheduleStatus.actualStartTime).toLocaleString('vi-VN')}
                          </Typography>
                        </Grid>
                      )}
                      {scheduleStatus.actualEndTime && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">Thời gian kết thúc thực tế:</Typography>
                          <Typography variant="body1">
                            {new Date(scheduleStatus.actualEndTime).toLocaleString('vi-VN')}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="text.secondary">Không có thông tin trạng thái</Typography>
                  )}
                </Grid>
                
                {/* Add Schedule Issues Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <WarningIcon sx={{ mr: 1 }} fontSize="small" />
                    Sự cố đã báo cáo
                  </Typography>
                  {loadingIssues ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : scheduleIssues.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {scheduleIssues.map((issue) => (
                        <Paper 
                          key={issue.issueId} 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="subtitle2">
                              {getIssueTypeLabel(issue.issueType)}
                            </Typography>
                            <Chip
                              label={getIssueStatusLabel(issue.status)}
                              size="small"
                              sx={{
                                backgroundColor: alpha(getIssueStatusClass(issue.status), 0.1),
                                color: getIssueStatusClass(issue.status),
                                '& .MuiChip-label': {
                                  color: getIssueStatusClass(issue.status)
                                }
                              }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {issue.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Báo cáo lúc: {new Date(issue.reportedAt).toLocaleString('vi-VN')}
                          </Typography>
                          {issue.resolution && (
                            <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                              <Typography variant="body2" fontWeight="medium">Cách giải quyết:</Typography>
                              <Typography variant="body2">{issue.resolution}</Typography>
                            </Box>
                          )}
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                      Không có sự cố nào được báo cáo
                    </Typography>
                  )}
                </Grid>
                
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Thông tin cơ bản
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Mã chuyến:</Typography>
                      <Typography variant="body1">{selectedSchedule.scheduleId}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                      {getStatusChip(getScheduleStatus(selectedSchedule.departureTime))}
                    </Grid>
                  </Grid>
                </Grid>

                {/* Bus Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Thông tin xe
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Biển số xe:</Typography>
                      <Typography variant="body1">{selectedSchedule.bus?.busNumber}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Loại xe:</Typography>
                      <Typography variant="body1">{selectedSchedule.bus?.busType}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Sức chứa:</Typography>
                      <Typography variant="body1">{selectedSchedule.bus?.capacity} chỗ</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Công ty:</Typography>
                      <Typography variant="body1">{selectedSchedule.bus?.companyName}</Typography>
                    </Grid>
                    {selectedSchedule.bus?.images && selectedSchedule.bus.images.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Hình ảnh xe:</Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          {selectedSchedule.bus.images.map((image) => (
                            <Box
                              key={image.imageId}
                              component="img"
                              src={image.imageUrl}
                              alt={image.imageName}
                              sx={{
                                width: 150,
                                height: 100,
                                objectFit: 'cover',
                                borderRadius: 1,
                                border: '1px solid #e0e0e0'
                              }}
                            />
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Grid>

                {/* Route Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Thông tin tuyến đường
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Điểm đi:</Typography>
                      <Typography variant="body1">{getLocationNameByCode(selectedSchedule.route?.origin)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Điểm đến:</Typography>
                      <Typography variant="body1">{getLocationNameByCode(selectedSchedule.route?.destination)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Khoảng cách:</Typography>
                      <Typography variant="body1">{selectedSchedule.route?.distanceKm} km</Typography>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Time Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Thông tin thời gian
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Thời gian khởi hành:</Typography>
                      <Typography variant="body1">
                        {new Date(selectedSchedule.departureTime).toLocaleString('vi-VN')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Thời gian đến:</Typography>
                      <Typography variant="body1">
                        {new Date(selectedSchedule.arrivalTime).toLocaleString('vi-VN')}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Staff Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Thông tin nhân viên
                  </Typography>
                  <Grid container spacing={2}>
                    {/* Main Driver */}
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>Tài xế chính:</Typography>
                      <Box sx={{ pl: 2, mt: 1 }}>
                        <Typography variant="body2">
                          {selectedSchedule.driver ? 
                            `${selectedSchedule.driver.firstName} ${selectedSchedule.driver.lastName}` : 
                            'Chưa có'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          SĐT: {selectedSchedule.driver?.phoneNumber || 'Chưa có'}
                        </Typography>
                        {selectedSchedule.driver && (
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              href={`tel:${selectedSchedule.driver.phoneNumber}`}
                              startIcon={<Phone size={16} />}
                              disabled={!selectedSchedule.driver.phoneNumber}
                            >
                              Gọi
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleOpenChat(selectedSchedule.driver)}
                              startIcon={<MessageSquare size={16} />}
                              disabled={!selectedSchedule.driver.userId}
                            >
                              Nhắn tin
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </Grid>

                    {/* Second Driver */}
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>Tài xế phụ:</Typography>
                      <Box sx={{ pl: 2, mt: 1 }}>
                        <Typography variant="body2">
                          {selectedSchedule.secondDriver ? 
                            `${selectedSchedule.secondDriver.firstName} ${selectedSchedule.secondDriver.lastName}` : 
                            'Chưa có'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          SĐT: {selectedSchedule.secondDriver?.phoneNumber || 'Chưa có'}
                        </Typography>
                        {selectedSchedule.secondDriver && (
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              href={`tel:${selectedSchedule.secondDriver.phoneNumber}`}
                              startIcon={<Phone size={16} />}
                              disabled={!selectedSchedule.secondDriver.phoneNumber}
                            >
                              Gọi
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleOpenChat(selectedSchedule.secondDriver)}
                              startIcon={<MessageSquare size={16} />}
                              disabled={!selectedSchedule.secondDriver.userId}
                            >
                              Nhắn tin
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </Grid>

                    {/* Assistant */}
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>Phụ xe:</Typography>
                      <Box sx={{ pl: 2, mt: 1 }}>
                        <Typography variant="body2">
                          {selectedSchedule.assistant ? 
                            `${selectedSchedule.assistant.firstName} ${selectedSchedule.assistant.lastName}` : 
                            'Chưa có'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          SĐT: {selectedSchedule.assistant?.phoneNumber || 'Chưa có'}
                        </Typography>
                        {selectedSchedule.assistant && (
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              href={`tel:${selectedSchedule.assistant.phoneNumber}`}
                              startIcon={<Phone size={16} />}
                              disabled={!selectedSchedule.assistant.phoneNumber}
                            >
                              Gọi
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleOpenChat(selectedSchedule.assistant)}
                              startIcon={<MessageSquare size={16} />}
                              disabled={!selectedSchedule.assistant.userId}
                            >
                              Nhắn tin
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Seat Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Thông tin ghế
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Tổng số ghế:</Typography>
                      <Typography variant="body1">{selectedSchedule.seats?.length || 0}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Ghế đã đặt:</Typography>
                      <Typography variant="body1">
                        {selectedSchedule.seats?.filter(seat => seat.booked).length || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Danh sách ghế đã đặt:</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {selectedSchedule.seats?.filter(seat => seat.booked).map((seat) => (
                          <Paper 
                            key={seat.seatId} 
                            elevation={0} 
                            sx={{ 
                              p: 2, 
                              bgcolor: 'background.default',
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                                  Ghế {seat.seatNumber}
                                </Typography>
                                {seat.user && (
                                  <>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                      <strong>Hành khách:</strong> {seat.user.firstName} {seat.user.lastName}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                      <strong>Số điện thoại:</strong> {seat.user.phoneNumber || 'Chưa có'}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Email:</strong> {seat.user.email || 'Chưa có'}
                                    </Typography>
                                  </>
                                )}
                              </Box>
                              {seat.user?.phoneNumber && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    href={`tel:${seat.user.phoneNumber}`}
                                    startIcon={<Phone size={16} />}
                                    color="primary"
                                  >
                                    Gọi
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleOpenChat(seat.user)}
                                    startIcon={<MessageSquare size={16} />}
                                    color="secondary"
                                  >
                                    Nhắn tin
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Additional Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Thông tin bổ sung
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Giá vé:</Typography>
                      <Typography variant="body1">
                        {selectedSchedule.pricePerSeat?.toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails}>Đóng</Button>
          </DialogActions>
        </Dialog>

        {/* Chat Interface */}
        {showChatInterface && selectedChatUser && (
          <ChatInterfaceV2
            receiverId={selectedChatUser.userId}
            receiverEmail={selectedChatUser.email}
            onClose={() => {
              setShowChatInterface(false);
              setSelectedChatUser(null);
            }}
          />
        )}
      </Container>
    </SidebarLayout>
  );
};

export default SchedulesPage;
