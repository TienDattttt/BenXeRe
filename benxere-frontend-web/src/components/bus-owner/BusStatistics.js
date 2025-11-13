import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Rating,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Bus, Star, Calendar } from 'lucide-react';
import { statisticsService } from '../../services/statistics-service';

const BusStatistics = ({ busId }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await statisticsService.getBusStatistics(busId);
        setStatistics(response.result);
      } catch (error) {
        setError('Failed to load bus statistics');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (busId) {
      fetchStatistics();
    }
  }, [busId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Bus size={24} />
          Thống kê xe
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Đánh giá trung bình
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating 
                    value={statistics.averageRating || 0} 
                    precision={0.1} 
                    readOnly 
                  />
                  <Typography variant="h6">
                    {statistics.averageRating?.toFixed(1) || 0}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Tổng số đánh giá: {statistics.totalRatings || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Lịch trình
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Calendar size={24} />
                  <Typography variant="h6">
                    {statistics.totalSchedules || 0}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Tổng số chuyến xe
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BusStatistics; 