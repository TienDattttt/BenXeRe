import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBusesByCurrentOwner } from '../../services/bus-owner/bus-owner-api';
import { getOwnerRatings } from '../../services/rating-service';
import SidebarLayout from '../../components/layouts/bus-owner/sidebar-layout';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import PersonIcon from '@mui/icons-material/Person';
import Typography from '../../components/core/typography';
import { getLocationNameByCode } from '../../utils/load-location';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';


const formatImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  return `${API_BASE_URL}/${imageUrl}`;
};

const ManageReviews = () => {
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allReviews, setAllReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const busesData = await getBusesByCurrentOwner();
        setBuses(busesData);
        
        const reviewsData = await getOwnerRatings();
        console.log('Received owner ratings:', reviewsData);
        setAllReviews(reviewsData);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBusClick = (busId) => {
    setSelectedBusId(busId);
    const filteredReviews = allReviews.filter(review => review.busId === busId);
    setReviews(filteredReviews);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const calculateAverageRating = (busId) => {
    const busReviews = allReviews.filter(review => review.busId === busId);
    if (busReviews.length === 0) return 0;
    const sum = busReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / busReviews.length).toFixed(1);
  };

  const getReviewCount = (busId) => {
    return allReviews.filter(review => review.busId === busId).length;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <Typography variant="h4" className="font-semibold text-gray-800 mb-6">
          Quản Lý Đánh Giá
        </Typography>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {buses.map((bus) => (
            <motion.div
              key={bus.busId}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 bg-white rounded-lg shadow-sm cursor-pointer border transition-colors
                ${selectedBusId === bus.busId ? 'border-primary-500' : 'border-transparent'}`}
              onClick={() => handleBusClick(bus.busId)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-primary-600">
                  <DirectionsBusIcon className="w-5 h-5" />
                  <span className="font-medium">
                    {bus.busNumber} - {bus.companyName}
                  </span>
                </div>
                <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  <StarIcon className="w-3 h-3 mr-1" />
                  <span>{calculateAverageRating(bus.busId)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <AirlineSeatReclineNormalIcon className="w-4 h-4" />
                <span>{bus.capacity} chỗ ngồi</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {getReviewCount(bus.busId)} đánh giá
                </span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {bus.busType}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedBusId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 space-y-4"
            >
              <Typography variant="h5" className="font-semibold text-gray-800">
                Danh Sách Đánh Giá
              </Typography>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-100 p-2 rounded-full">
                            <PersonIcon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {review.userEmail}
                            </p>
                            <div className="flex items-center gap-0.5 mt-1">
                              {[...Array(5)].map((_, index) => (
                                index < review.rating ? (
                                  <StarIcon key={index} className="w-4 h-4 text-yellow-400" />
                                ) : (
                                  <StarBorderIcon key={index} className="w-4 h-4 text-gray-300" />
                                )
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Không có ngày'}
                        </div>
                      </div>

                      <p className="mt-3 text-gray-600 text-sm">
                        {review.comment || 'Không có nhận xét'}
                      </p>

                      <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                          Mã chuyến: #{review.scheduleId || 'N/A'}
                        </span>
                        <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full">
                          Công ty: {review.companyName || 'Không có thông tin'}
                        </span>
                      </div>

                      {review.imageUrl && (
                        <div className="mt-3">
                          <img
                            src={formatImageUrl(review.imageUrl)}
                            alt="Ảnh đánh giá"
                            className="w-full max-w-[200px] rounded-lg border border-gray-100"
                            onError={(e) => {
                              console.error(`Failed to load image: ${review.imageUrl}`);
                              e.target.src = '/logo.webp'; // Fallback image
                              e.target.style.opacity = 0.5;
                            }}
                          />
                          <div className="mt-1 text-xs text-gray-500">URL: {formatImageUrl(review.imageUrl)}</div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
                  <Typography variant="body1" color="muted">
                    Chưa có đánh giá nào cho xe này.
                  </Typography>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <SidebarLayout>
      {renderContent()}
    </SidebarLayout>
  );
};

export default ManageReviews;
