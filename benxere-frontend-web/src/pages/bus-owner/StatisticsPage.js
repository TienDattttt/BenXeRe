import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  Paper,
  Fade,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Bus, 
  Users, 
  AlertCircle,
  RefreshCcw,
  Calendar,
  Star,
} from 'lucide-react';
import BusStatistics from '../../components/bus-owner/BusStatistics';
import EmployeeStatistics from '../../components/bus-owner/EmployeeStatistics';
import { getBusesByCurrentUser } from '../../services/bus-service';
import { getMyEmployees } from '../../services/user-service';
import SidebarLayout from "../../components/layouts/bus-owner/sidebar-layout";

const StatisticsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [buses, setBuses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      setRefreshing(true);
      const [busesResponse, employeesResponse] = await Promise.all([
        getBusesByCurrentUser(),
        getMyEmployees(),
      ]);
      setBuses(busesResponse || []);
      setEmployees(employeesResponse || []);
      
      // Set initial selection
      if (activeTab === 0 && busesResponse?.length > 0) {
        setSelectedItemId(busesResponse[0].busId);
      } else if (activeTab === 1 && employeesResponse?.length > 0) {
        setSelectedItemId(employeesResponse[0].userId);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedItemId(null);
  };

  const handleItemSelect = (id) => {
    setSelectedItemId(id);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
            Thống kê
          </Typography>
          <Tooltip title="Làm mới dữ liệu">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshCcw className={refreshing ? 'animate-spin' : ''} />
            </IconButton>
          </Tooltip>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => setError(null)}
              >
                <AlertCircle />
              </IconButton>
            }
          >
            {error}
          </Alert>
        )}

        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ 
              px: 2, 
              pt: 1,
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: '1rem',
              }
            }}
          >
            <Tab 
              icon={<Bus size={20} />} 
              iconPosition="start" 
              label="Thống kê xe" 
            />
            <Tab 
              icon={<Users size={20} />} 
              iconPosition="start" 
              label="Thống kê nhân viên" 
            />
          </Tabs>
        </Paper>

        <Grid container spacing={3}>
          {/* List Panel */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              variant="outlined" 
              sx={{ 
                borderRadius: 2,
                height: '100%',
                backgroundColor: 'background.paper'
              }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                  {activeTab === 0 ? 'Danh sách xe' : 'Danh sách nhân viên'}
                </Typography>
              </Box>
              {((activeTab === 0 && buses.length === 0) || 
                (activeTab === 1 && employees.length === 0)) ? (
                <Box p={3}>
                  {renderEmptyState()}
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {activeTab === 0 ? (
                    // Buses List
                    buses.map((bus) => (
                      <Fade in key={bus.busId}>
                        <div>
                          <ListItemButton 
                            selected={selectedItemId === bus.busId}
                            onClick={() => handleItemSelect(bus.busId)}
                            sx={{ 
                              '&.Mui-selected': {
                                backgroundColor: 'primary.light',
                                '&:hover': {
                                  backgroundColor: 'primary.light',
                                }
                              }
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <Bus />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={
                                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                  {bus.busNumber}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                  <Typography variant="body2" color="textSecondary">
                                    {bus.type}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">•</Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    {bus.capacity} chỗ
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItemButton>
                          <Divider component="li" />
                        </div>
                      </Fade>
                    ))
                  ) : (
                    // Employees List
                    employees.map((employee) => (
                      <Fade in key={employee.userId}>
                        <div>
                          <ListItemButton
                            selected={selectedItemId === employee.userId}
                            onClick={() => handleItemSelect(employee.userId)}
                            sx={{ 
                              '&.Mui-selected': {
                                backgroundColor: 'primary.light',
                                '&:hover': {
                                  backgroundColor: 'primary.light',
                                }
                              }
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <Users />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={
                                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                  {employee.firstName} {employee.lastName}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" color="textSecondary">
                                  {employee.email}
                                </Typography>
                              }
                            />
                          </ListItemButton>
                          <Divider component="li" />
                        </div>
                      </Fade>
                    ))
                  )}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Details Panel */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0} 
              variant="outlined" 
              sx={{ 
                borderRadius: 2,
                height: '100%',
                minHeight: '400px',
                backgroundColor: 'background.paper'
              }}
            >
              {selectedItemId ? (
                activeTab === 0 ? (
                  <BusStatistics busId={selectedItemId} />
                ) : (
                  <EmployeeStatistics employeeId={selectedItemId} />
                )
              ) : (
                <Box 
                  display="flex" 
                  justifyContent="center" 
                  alignItems="center"
                  flexDirection="column"
                  p={6}
                  minHeight="400px"
                >
                  {activeTab === 0 ? <Bus size={40} color="#ccc" /> : <Users size={40} color="#ccc" />}
                  <Typography variant="h6" sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>
                    {activeTab === 0 ? 'Chọn xe để xem thống kê' : 'Chọn nhân viên để xem thống kê'}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  };

  const renderEmptyState = () => (
    <Paper 
      sx={{ 
        p: 3, 
        textAlign: 'center',
        backgroundColor: 'grey.50',
        borderRadius: 2
      }}
    >
      <AlertCircle size={48} color="#666" style={{ marginBottom: 16 }} />
      <Typography variant="h6" gutterBottom>
        {activeTab === 0 ? 'Chưa có xe nào' : 'Chưa có nhân viên nào'}
      </Typography>
      <Typography color="textSecondary">
        {activeTab === 0 
          ? 'Thêm xe để xem thống kê chi tiết' 
          : 'Thêm nhân viên để xem thống kê chi tiết'}
      </Typography>
    </Paper>
  );

  return (
    <SidebarLayout>
      {renderContent()}
    </SidebarLayout>
  );
};

export default StatisticsPage; 