import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import AccountSidebarLayout from '../../components/layouts/account-sidebar-layout';
import { getLocationNameByCode } from '../../utils/load-location';
import { createReview, getUserRatings } from '../../services/rating-service';
import { getBookingsByCurrentUser } from '../../services/booking-service';
import { getScheduleById } from '../../services/schedule-service';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import EventIcon from '@mui/icons-material/Event';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PlaceIcon from '@mui/icons-material/Place';
import '../../styles/account-modern-theme.css';

const StarRating = ({ rating, setRating }) => {
  const prefersReducedMotion = useReducedMotion();
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onHoverStart={() => setHoveredRating(star)}
          onHoverEnd={() => setHoveredRating(0)}
          whileHover={{ scale: !prefersReducedMotion && 1.2 }}
          whileTap={{ scale: !prefersReducedMotion && 0.9 }}
          className="relative"
        >
          {(rating >= star || hoveredRating >= star) ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-4xl text-yellow-400"
            >
              <StarIcon fontSize="inherit" />
              <motion.div
                className="absolute inset-0 bg-yellow-400 opacity-20 rounded-full blur-lg"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-4xl text-gray-300"
            >
              <StarBorderIcon fontSize="inherit" />
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
};

const ReviewPage = () => {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(1);
  const [image, setImage] = useState(null);
  const [scheduleId, setScheduleId] = useState('');  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [scheduleDetails, setScheduleDetails] = useState({});
  const [userRatings, setUserRatings] = useState([]);
  useEffect(() => {
    const fetchSchedulesAndRatings = async () => {
      try {
        setError(null);
        
        console.log("Starting to fetch bookings and ratings...");
        
        // Fetch bookings first
        let bookings = [];
        try {
          bookings = await getBookingsByCurrentUser();
          console.log("Bookings data:", bookings);
          
          if (!Array.isArray(bookings)) {
            console.warn("Bookings response is not an array:", bookings);
            bookings = [];
          }
        } catch (bookingError) {
          console.error("Error fetching bookings:", bookingError);
          setError('Không thể tải danh sách chuyến đi. Vui lòng kiểm tra đăng nhập và thử lại.');
          setLoading(false);
          return;
        }
        
        // Fetch user ratings
        let ratings = [];
        try {
          ratings = await getUserRatings();
          console.log("User ratings data:", ratings);
          
          if (!Array.isArray(ratings)) {
            console.warn("Ratings response is not an array:", ratings);
            ratings = [];
          }
        } catch (ratingsError) {
          console.error("Error fetching user ratings:", ratingsError);
          // Don't fail completely if ratings can't be loaded, just log and continue
          console.warn("Continuing without filtering by existing ratings");
          ratings = [];
        }
        
        setUserRatings(ratings);
        
        // Get schedule IDs that the user has already rated
        const ratedScheduleIds = new Set(ratings.map(rating => rating.scheduleId).filter(id => id != null));
        
        // Filter out bookings for schedules that have already been rated
        const unratedBookings = bookings.filter(booking => 
          booking && 
          booking.scheduleId && 
          !ratedScheduleIds.has(booking.scheduleId)
        );
        
        console.log("Rated schedule IDs:", Array.from(ratedScheduleIds));
        console.log("Filtered unrated bookings:", unratedBookings);
        
        setSchedules(unratedBookings);
      } catch (error) {
        console.error("Unexpected error fetching data:", error);
        setError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedulesAndRatings();
  }, []);

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      if (!scheduleId) return;
      
      try {
        const details = await getScheduleById(scheduleId);
        setScheduleDetails(details);
          const booking = schedules.find(b => b.scheduleId === scheduleId);
        setSelectedBooking(booking);
      } catch (error) {
        console.error("Error fetching schedule details:", error);
      }
    };
    
    fetchScheduleDetails();
  }, [scheduleId, schedules]);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setImage(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
    maxFiles: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Make sure we have the schedule details
      if (!scheduleDetails) {
        throw new Error('Không thể tải thông tin chi tiết chuyến đi. Vui lòng thử lại sau.');
      }

      // Make sure we have the busId from schedule details
      if (!scheduleDetails.bus || !scheduleDetails.bus.busId) {
        throw new Error('Không thể xác định ID xe buýt cho đánh giá. Vui lòng thử lại sau.');
      }

      console.log("Schedule details:", scheduleDetails);
      console.log("Bus ID for rating:", scheduleDetails.bus.busId);      // Create the review with the required fields
      await createReview({
        scheduleId: parseInt(scheduleId, 10),
        busId: scheduleDetails.bus.busId,
        comment: comment.trim(),
        rating: rating, // Rating is minimum 1 from StarRating component
        image: image
      });
      
      setSuccess(true);
      setComment('');
      setRating(1);
      setImage(null);
      setScheduleId('');
      
      // Refresh the schedules list to remove the newly rated schedule
      try {
        const [bookings, ratings] = await Promise.all([
          getBookingsByCurrentUser(),
          getUserRatings()
        ]);
        
        if (Array.isArray(bookings) && Array.isArray(ratings)) {
          const ratedScheduleIds = new Set(ratings.map(rating => rating.scheduleId));
          const unratedBookings = bookings.filter(booking => 
            booking && 
            booking.scheduleId && 
            !ratedScheduleIds.has(booking.scheduleId)
          );
          setSchedules(unratedBookings);
          setUserRatings(ratings);
        }
      } catch (refreshError) {
        console.error("Error refreshing schedules:", refreshError);
        // Don't show error to user as the rating was successful
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      
      // Handle specific error messages from the backend
      if (error && typeof error === 'object') {
        if (error.message === 'Bus ID is required') {
          setError('Không thể xác định ID xe buýt. Vui lòng chọn chuyến đi khác.');
        } else if (error.message === 'Rating must be between 1 and 5') {
          setError('Đánh giá phải từ 1 đến 5 sao.');
        } else {
          setError(error.message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.');
        }
      } else {
        setError('Không thể gửi đánh giá. Vui lòng kiểm tra kết nối mạng và thử lại sau.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AccountSidebarLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="neo-spinner"></div>
        </div>
      </AccountSidebarLayout>
    );
  }

  return (
    <AccountSidebarLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="neo-card overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header with Modern Design */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 p-8">
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              style={{
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
                backgroundSize: '200% 200%',
                animation: 'pulse 4s ease-in-out infinite'
              }}
            />
            <div className="relative z-10">
              <motion.h2 
                className="text-2xl font-bold text-white mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Đánh Giá Chuyến Đi
              </motion.h2>
              <motion.p 
                className="text-blue-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Chia sẻ trải nghiệm của bạn
              </motion.p>
            </div>
          </div>

          <div className="p-8">
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="neo-card bg-red-50 mb-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <p className="p-4 text-red-600">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div 
                  className="neo-card bg-green-50 mb-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <div className="p-4">
                    <h3 className="text-green-600 font-medium mb-1">Cảm ơn bạn đã đánh giá! ✨</h3>
                    <p className="text-green-500 text-sm">Phản hồi của bạn sẽ giúp chúng tôi cải thiện dịch vụ</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>            {/* No schedules available message */}
            {schedules.length === 0 && !loading && (
              <motion.div 
                className="neo-card bg-gray-50 border border-gray-200 text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-gray-400 mb-4">
                  <DirectionsBusIcon style={{ fontSize: '4rem' }} />
                </div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  Không có chuyến đi nào để đánh giá
                </h3>
                <p className="text-gray-500">
                  Bạn đã đánh giá tất cả các chuyến đi của mình hoặc chưa có chuyến đi nào hoàn thành.
                </p>
              </motion.div>
            )}

            {/* Rating Form - only show when there are unrated schedules */}
            {schedules.length > 0 && (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Trip Selection */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Chọn Chuyến Đi
                  </label>
                  <motion.select
                    value={scheduleId}
                    onChange={(e) => setScheduleId(e.target.value)}
                    className="neo-input w-full py-3"
                    required
                    whileFocus={{ scale: !prefersReducedMotion && 1.01 }}
                  >
                    <option value="" disabled>Chọn chuyến đi chưa đánh giá</option>
                    {schedules.map((booking) => (
                      <option key={booking.scheduleId} value={booking.scheduleId}>
                        Mã đặt: #{booking.bookingId} - {new Date(booking.bookingDate).toLocaleDateString('vi-VN')} - {booking.totalPrice.toLocaleString('vi-VN')}₫ - {booking.seatIds?.length || 0} ghế
                      </option>
                    ))}
                  </motion.select>

                {/* Trip Details Card */}
                <AnimatePresence>
                  {selectedBooking && (
                    <motion.div 
                      className="neo-card bg-blue-50 border border-blue-100 overflow-hidden"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-blue-800">Chi tiết chuyến đi</h3>
                          <div className="px-2 py-1 bg-blue-100 rounded-full text-xs font-medium text-blue-700">
                            {selectedBooking.status || 'Đã hoàn thành'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <ConfirmationNumberIcon className="text-blue-600 mr-2" fontSize="small" />
                            <div>
                              <div className="text-gray-500">Mã đặt vé</div>
                              <div className="font-medium">{selectedBooking.bookingId}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <EventIcon className="text-blue-600 mr-2" fontSize="small" />
                            <div>
                              <div className="text-gray-500">Ngày đặt</div>
                              <div className="font-medium">{new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <DirectionsBusIcon className="text-blue-600 mr-2" fontSize="small" />
                            <div>
                              <div className="text-gray-500">Tuyến đường</div>
                              <div className="font-medium">
                                {scheduleDetails?.route ? 
                                  `${getLocationNameByCode(scheduleDetails.route.origin)} → ${getLocationNameByCode(scheduleDetails.route.destination)}` : 
                                  'Đang tải...'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <PlaceIcon className="text-blue-600 mr-2" fontSize="small" />
                            <div>
                              <div className="text-gray-500">Điểm đón / trả</div>
                              <div className="font-medium">
                                {selectedBooking.pickUpLocationId && selectedBooking.dropOffLocationId ? 
                                  `${getLocationNameByCode(selectedBooking.pickUpLocationId)} → ${getLocationNameByCode(selectedBooking.dropOffLocationId)}` : 
                                  'Đang tải...'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex justify-between items-center border-t border-blue-100 pt-3">
                          <div>
                            <span className="text-gray-500 text-sm">Tổng thanh toán:</span>
                            <span className="ml-2 font-bold text-blue-700">{selectedBooking.totalPrice.toLocaleString('vi-VN')}₫</span>
                            {selectedBooking.discountAmount > 0 && (
                              <span className="ml-2 text-xs text-green-500">
                                (Giảm {selectedBooking.discountAmount.toLocaleString('vi-VN')}₫)
                              </span>
                            )}
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Số ghế:</span>
                            <span className="ml-2 font-medium">{selectedBooking.seatIds?.length || 0} ghế</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}                </AnimatePresence>
                </div>

                {/* Star Rating */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Đánh Giá Sao
                  </label>
                  <StarRating rating={rating} setRating={setRating} />
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nhận Xét
                  </label>
                  <motion.textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="neo-input w-full min-h-[120px] resize-none"
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    required
                    whileFocus={{ scale: !prefersReducedMotion && 1.01 }}
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Hình Ảnh
                  </label>
                  <motion.div 
                    {...getRootProps()} 
                    className="neo-card p-8 text-center cursor-pointer"
                    whileHover={{ scale: !prefersReducedMotion && 1.02 }}
                    whileTap={{ scale: !prefersReducedMotion && 0.98 }}
                  >
                    <input {...getInputProps()} />
                    <CloudUploadIcon className="text-blue-500 text-4xl mb-2" />
                    <p className="text-gray-600">Kéo thả hoặc nhấp để chọn ảnh</p>
                  </motion.div>
                  
                  <AnimatePresence>
                    {image && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="mt-4 relative inline-block"
                      >
                        <div className="neo-card p-2">
                          <img
                            src={URL.createObjectURL(image)}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <motion.button
                            type="button"
                            onClick={() => setImage(null)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <CloseIcon fontSize="small" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit Button */}
                <motion.div 
                  className="flex justify-end"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    className="neo-button"
                    whileHover={{ scale: !prefersReducedMotion && 1.02 }}
                    whileTap={{ scale: !prefersReducedMotion && 0.98 }}
                  >
                    {submitting ? (
                      <span className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang gửi...</span>
                      </span>
                    ) : (
                      <span>Gửi Đánh Giá ✨</span>
                    )}
                  </motion.button>
                </motion.div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AccountSidebarLayout>
  );
};

export default ReviewPage;