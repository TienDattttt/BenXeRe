import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getRatingsByCompany, getRatingsByBus, getRatingsByOwner } from '../../services/rating-service';
import { RatingTypes } from '../../types/rating';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Component for visualizing historical rating trends
 * @param {Object} props
 * @param {string} props.type - Type of rating (company, bus, owner)
 * @param {string|number} props.identifier - Company name, bus ID, or owner ID
 * @param {string} props.title - Chart title
 * @param {number} props.months - Number of months to display (default: 6)
 */
const HistoricalRatingChart = ({ type, identifier, title, months = 6 }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRatingHistory = async () => {
      if (!identifier) {
        setError('No identifier provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch a large set of ratings to ensure we have enough data for the chart
        let response;
        
        switch (type) {
          case RatingTypes.COMPANY:
            response = await getRatingsByCompany(identifier, 0, 100);
            break;
          case RatingTypes.BUS:
            response = await getRatingsByBus(identifier, 0, 100);
            break;
          case RatingTypes.OWNER:
            response = await getRatingsByOwner(identifier, 0, 100);
            break;
          default:
            throw new Error('Invalid rating type');
        }

        if (!response || !response.content || response.content.length === 0) {
          setChartData(null);
          setLoading(false);
          return;
        }

        // Process data for the chart
        const processedData = processRatingData(response.content, months);
        setChartData(processedData);
      } catch (err) {
        console.error('Error fetching rating history:', err);
        setError('Failed to load rating history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRatingHistory();
  }, [type, identifier, months]);

  // Process rating data for chart visualization
  const processRatingData = (ratings, monthsToShow) => {
    // Get the date range for the last N months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsToShow);

    // Group ratings by month
    const monthlyData = {};
    
    // Initialize all months with null values
    for (let i = 0; i < monthsToShow; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthlyData[monthKey] = { sum: 0, count: 0 };
    }

    // Aggregate ratings by month
    ratings.forEach(rating => {
      const ratingDate = new Date(rating.createdAt);
      
      // Skip ratings older than our start date
      if (ratingDate < startDate) return;
      
      const monthKey = `${ratingDate.getMonth() + 1}/${ratingDate.getFullYear()}`;
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].sum += rating.rating;
        monthlyData[monthKey].count += 1;
      }
    });

    // Calculate averages and prepare chart data
    const labels = [];
    const data = [];
    
    // Sort months in chronological order
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.split('/').map(Number);
      const [monthB, yearB] = b.split('/').map(Number);
      
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

    // Generate labels and data points
    sortedMonths.forEach(month => {
      labels.push(month);
      const { sum, count } = monthlyData[month];
      data.push(count > 0 ? (sum / count).toFixed(1) : null);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Điểm đánh giá trung bình',
          data,
          fill: false,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.2,
        },
      ],
    };
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: !!title,
        text: title || 'Lịch sử đánh giá',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Điểm trung bình: ${context.raw || 'N/A'}`;
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Điểm đánh giá'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Tháng'
        }
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <p>{error}</p>
      </div>
    );
  }

  // No data state
  if (!chartData || chartData.datasets[0].data.every(value => value === null)) {
    return (
      <div className="p-4 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 text-center">
        <p>Không có đủ dữ liệu đánh giá để hiển thị biểu đồ.</p>
      </div>
    );
  }

  return (
    <div className="historical-rating-chart bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <Line options={options} data={chartData} />
    </div>
  );
};

export default HistoricalRatingChart;