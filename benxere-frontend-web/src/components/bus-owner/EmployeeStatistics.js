import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import {
  User,
  Calendar,
  MapPin,
  Star,
  Clock,
  Award,
  ThumbsUp,
  AlertCircle,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  Timer,
  Users,
  Bus,
  MessageCircle,
  Send,
} from 'lucide-react';
import { statisticsService } from '../../services/statistics-service';
import { chatService } from '../../services/chat-service';

const MetricCard = ({ icon: Icon, title, value, subtitle, color = 'primary' }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, mr: 2 }}>
          <Icon size={20} />
        </Avatar>
        <Typography variant="h6" color="textSecondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 'medium' }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const ChatDialog = ({ open, onClose, employeeInfo, employeeId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && employeeId) {
      loadMessages();
    }
  }, [open, employeeId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const history = await chatService.getConversation(employeeId);
      setMessages(history);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const message = await chatService.sendMessage(employeeId, newMessage);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <User size={20} />
          </Avatar>
          <Typography variant="h6">
            {`${employeeInfo?.firstName} ${employeeInfo?.lastName}`}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mb: 2,
            overflowY: 'auto'
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : (
            messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  alignSelf: msg.senderId === employeeId ? 'flex-start' : 'flex-end',
                  maxWidth: '80%',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: msg.senderId === employeeId ? 'grey.100' : 'primary.light',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2">
                    {msg.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(msg.sentAt).toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            ))
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            size="small"
          />
          <IconButton 
            color="primary"
            onClick={handleSend}
            disabled={!newMessage.trim()}
          >
            <Send size={20} />
          </IconButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const EmployeeStatistics = ({ employeeId }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await statisticsService.getEmployeeStatistics(employeeId);
        setStatistics(response.result);
      } catch (error) {
        setError('Failed to load employee statistics');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchStatistics();
    }
  }, [employeeId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const employeeInfo = statistics.employeeInfo;
  const allSchedules = statistics.schedules || [];
  const completedSchedules = allSchedules.filter(s => s.status === 'COMPLETED');
  const averageRating = statistics.averageRating || 0;

  return (
    <Stack spacing={3}>
      {/* Employee Overview Card */}
      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box 
          sx={{ 
            p: 3, 
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            color: 'white'
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80,
                  bgcolor: 'white',
                  color: 'primary.main'
                }}
              >
                <User size={40} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4">
                  {`${employeeInfo.firstName} ${employeeInfo.lastName}`}
                </Typography>
                <IconButton
                  onClick={() => setChatOpen(true)}
                  sx={{ 
                    color: 'white',
                    '&:hover': { 
                      bgcolor: 'rgba(255, 255, 255, 0.1)' 
                    } 
                  }}
                >
                  <MessageCircle size={24} />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Mail size={16} />
                  <Typography>{employeeInfo.email}</Typography>
                </Grid>
                <Grid item sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone size={16} />
                  <Typography>{employeeInfo.phoneNumber || 'Chưa cập nhật'}</Typography>
                </Grid>
                <Grid item sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Briefcase size={16} />
                  <Typography>{employeeInfo.role || 'Nhân viên'}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Key Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={6}>
          <MetricCard
            icon={Calendar}
            title="Tổng chuyến"
            value={allSchedules.length}
            subtitle="Tổng số chuyến đã tham gia"
            color="primary"
          />
        </Grid>
        {averageRating > 0 && (
          <Grid item xs={12} sm={6} md={6}>
            <MetricCard
              icon={Star}
              title="Đánh giá"
              value={averageRating.toFixed(1)}
              subtitle="Điểm đánh giá trung bình"
              color="warning"
            />
          </Grid>
        )}
      </Grid>

      {/* Recent Schedules */}
      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Lịch sử chuyến gần đây</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tuyến đường</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Xe</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allSchedules.slice(0, 5).map((schedule) => (
                <TableRow key={schedule.scheduleId} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MapPin size={16} />
                      <Typography variant="body2">
                        {schedule.route?.origin} → {schedule.route?.destination}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Clock size={16} />
                      <Typography variant="body2">
                        {new Date(schedule.departureTime).toLocaleString('vi-VN')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Bus size={16} />
                      <Typography variant="body2">{schedule.bus?.busNumber}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        schedule.driver?.userId === employeeId ? 'Tài xế' :
                        schedule.secondDriver?.userId === employeeId ? 'Tài xế 2' :
                        'Phụ xe'
                      }
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={schedule.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang chờ'}
                      color={schedule.status === 'COMPLETED' ? 'success' : 'warning'}
                      sx={{ minWidth: 100 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <ChatDialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        employeeInfo={employeeInfo}
        employeeId={employeeId}
      />
    </Stack>
  );
};

export default EmployeeStatistics; 