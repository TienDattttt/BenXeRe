import React, { useState, useEffect } from "react";
import AccountSidebarLayout from "../../components/layouts/account-sidebar-layout";
import { getBookingsByCurrentUser } from "../../services/booking-service";
import { getLocationNameByCode } from "../../utils/load-location";
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import '../../styles/account-modern-theme.css';
import '../../styles/account-content-theme.css';
import { getScheduleById } from "../../services/schedule-service";
import { getSeatById } from "../../services/seat-service";
import BookingDetailsModal from "../../components/modals/BookingDetailsModal";
import { getBusImageUrl } from "../../constants/common";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    Pending: { class: 'warning', label: 'Đang chờ', icon: '⏳' },
    Confirmed: { class: 'info', label: 'Đã xác nhận', icon: '✓' },
    Cancelled: { class: 'error', label: 'Đã hủy', icon: '❌' },
    default: { class: 'default', label: status || 'Không xác định', icon: '❓' }
  };

  const config = statusConfig[status] || statusConfig.default;
  
  return (
    <div className={`status-badge ${config.class}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
};

const OrderCard = ({ booking, index }) => {
  const prefersReducedMotion = useReducedMotion();
  const [scheduleDetails, setScheduleDetails] = useState(null);
  const [seatDetails, setSeatDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Make sure booking has all necessary properties with defaults
  const safeBooking = {
    bookingId: booking?.bookingId || 'N/A',
    status: booking?.status || 'PENDING',
    bookingDate: booking?.bookingDate || new Date().toISOString(),
    totalPrice: booking?.totalPrice || 0,
    scheduleId: booking?.scheduleId,
    seatIds: booking?.seatIds || [],
    payment: booking?.payment || {},
    ...booking
  };
  
  useEffect(() => {
    const fetchScheduleDetails = async () => {
      try {
        if (safeBooking.scheduleId) {
          const details = await getScheduleById(safeBooking.scheduleId);
          setScheduleDetails(details);
        }
      } catch (error) {
        console.error("Error fetching schedule details:", error);
      }
    };
    
    const fetchSeatDetails = async () => {
      try {
        if (safeBooking.seatIds && safeBooking.seatIds.length > 0) {
          const seatPromises = safeBooking.seatIds.map(id => getSeatById(id));
          const seats = await Promise.all(seatPromises);
          setSeatDetails(seats);
          console.log("Fetched seat details:", seats);
        }
      } catch (error) {
        console.error("Error fetching seat details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchScheduleDetails();
    fetchSeatDetails();
  }, [safeBooking.scheduleId, safeBooking.seatIds]);
  
  // Payment information
  const paymentInfo = safeBooking.payment || {};
  
  const getPaymentStatusClass = (status) => {
    if (!status) return 'text-gray-500';
    
    switch(status) {
      case 'COMPLETED':
      case 'PAID':
        return 'text-green-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'FAILED':
      case 'CANCELLED':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };
  
  const getPaymentStatusText = (status) => {
    if (!status) return 'Chưa thanh toán';
    
    switch(status) {
      case 'COMPLETED':
        return 'Đã thanh toán';
      case 'PENDING':
        return 'Đang xử lý';
      case 'FAILED':
        return 'Thanh toán thất bại';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'CASH':
        return 'Thanh toán khi lên xe';
      default:
        return status;
    }
  };
  
  const getPaymentMethodText = (method) => {
    if (!method) return 'Không có thông tin';
    
    switch(method) {
      case 'CASH':
        return 'Tiền mặt';
      case 'ZALOPAY':
        return 'ZaloPay';
      case 'MOMO':
        return 'MoMo';
      case 'BANKCARD':
        return 'Thẻ ngân hàng';
      default:
        return method;
    }
  };
  
  const companyName = scheduleDetails?.bus?.companyName || 'Chưa có thông tin';
  const busImageUrl = scheduleDetails?.bus?.images?.[0]?.imageUrl || null;
  const busType = scheduleDetails?.bus?.busType || 'N/A';
  const origin = scheduleDetails?.route?.origin || 'N/A';
  const destination = scheduleDetails?.route?.destination || 'N/A';
  const departureTime = scheduleDetails?.departureTime ? new Date(scheduleDetails.departureTime) : new Date();
  const arrivalTime = scheduleDetails?.arrivalTime ? new Date(scheduleDetails.arrivalTime) : new Date();

  const seatNumbers = seatDetails.map(seat => seat?.seatNumber || 'N/A').join(', ');

  // Calculate seat statuses
  const totalSeats = seatDetails.length;
  const checkedInSeats = seatDetails.filter(seat => seat.passengerStatus === 'ĐÃ LÊN XE').length;
  const checkedOutSeats = seatDetails.filter(seat => seat.passengerStatus === 'ĐÃ XUỐNG XE').length;
  const cancelledSeats = seatDetails.filter(seat => seat.passengerStatus === 'ĐÃ HỦY').length;
  const pendingSeats = totalSeats - checkedInSeats - checkedOutSeats - cancelledSeats;

  // Helper function to get the status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'ĐÃ LÊN XE': return 'bg-green-100 text-green-800';
      case 'ĐÃ XUỐNG XE': return 'bg-purple-100 text-purple-800';
      case 'ĐÃ HỦY': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <motion.div
        className="content-card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 animate-pulse"></div>
              <div>
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
          <div className="relative py-8">
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 animate-pulse"></div>
            <div className="relative flex justify-between">
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-gray-200 animate-pulse mx-auto mb-3"></div>
                <div className="h-5 bg-gray-200 rounded w-24 animate-pulse mb-2 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse mx-auto"></div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-gray-200 animate-pulse mx-auto mb-3"></div>
                <div className="h-5 bg-gray-200 rounded w-24 animate-pulse mb-2 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="content-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="p-6">
        {/* Bus Image Banner */}
        <div className="w-full h-40 mb-4 rounded-lg overflow-hidden relative">
          {busImageUrl ? (
            <img 
              src={getBusImageUrl(busImageUrl)}
              alt={`${companyName} bus`} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/default-bus.jpg';
              }}
            />
          ) : (
            <img 
              src="/images/default-bus.jpg" 
              alt="Default bus" 
              className="w-full h-full object-cover" 
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <h3 className="font-semibold text-lg text-white">{companyName}</h3>
            <p className="text-white text-sm">{busType}</p>
          </div>
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600 text-sm">
              {new Date(safeBooking.bookingDate).toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <StatusBadge status={safeBooking.status} />
        </div>

        {/* Journey Timeline */}
        <div className="relative py-8">
          {/* Connection Line */}
          <motion.div
            className="absolute left-0 right-0 top-1/2 h-1 bg-blue-100"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          <div className="relative flex justify-between z-10">
            {/* Departure */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center text-2xl mx-auto mb-3 shadow-md">
                🚏
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {getLocationNameByCode(origin)}
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  {departureTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </motion.div>

            {/* Arrival */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center text-2xl mx-auto mb-3 shadow-md">
                🏁
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {getLocationNameByCode(destination)}
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  {arrivalTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Booking details */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Mã đặt vé</p>
              <p className="font-medium">#{safeBooking.bookingId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng giá</p>
              <p className="font-medium">{safeBooking.totalPrice ? safeBooking.totalPrice.toLocaleString('vi-VN') : '0'} ₫</p>
            </div>
            
            {/* Payment Information */}
            <div>
              <p className="text-sm text-gray-500">Thanh toán</p>
              <p className={`font-medium ${getPaymentStatusClass(paymentInfo.status)}`}>
                {getPaymentStatusText(paymentInfo.status)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phương thức</p>
              <p className="font-medium">
                {getPaymentMethodText(paymentInfo.paymentMethod)}
              </p>
            </div>
            
            {paymentInfo.originalAmount && paymentInfo.discountAmount && (
              <>
                <div>
                  <p className="text-sm text-gray-500">Giá gốc</p>
                  <p className="font-medium line-through text-gray-500">
                    {paymentInfo.originalAmount ? paymentInfo.originalAmount.toLocaleString('vi-VN') : '0'} ₫
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Giảm giá</p>
                  <p className="font-medium text-green-600">
                    -{paymentInfo.discountAmount ? paymentInfo.discountAmount.toLocaleString('vi-VN') : '0'} ₫
                  </p>
                </div>
              </>
            )}
            
            {paymentInfo.paymentId && (
              <div>
                <p className="text-sm text-gray-500">Mã thanh toán</p>
                <p className="font-medium">{paymentInfo.paymentId}</p>
              </div>
            )}
            
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Ghế đã đặt</p>
              {safeBooking.seatIds && safeBooking.seatIds.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {safeBooking.seatIds.map(seatId => (
                      <span key={seatId} className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${getStatusColor(seatDetails.find(seat => seat?.seatId === seatId)?.passengerStatus)} font-medium`}>
                        {seatDetails.find(seat => seat?.seatId === seatId)?.seatNumber || '...'}
                      </span>
                    ))}
                  </div>
                  
                  {/* Seat Status Summary */}
                  {totalSeats > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        {checkedInSeats > 0 && (
                          <div className="bg-green-50 p-1 rounded text-center text-green-800">
                            {checkedInSeats} đã lên xe
                          </div>
                        )}
                        {checkedOutSeats > 0 && (
                          <div className="bg-purple-50 p-1 rounded text-center text-purple-800">
                            {checkedOutSeats} đã xuống xe
                          </div>
                        )}
                        {cancelledSeats > 0 && (
                          <div className="bg-red-50 p-1 rounded text-center text-red-800">
                            {cancelledSeats} đã hủy
                          </div>
                        )}
                        {pendingSeats > 0 && (
                          <div className="bg-blue-50 p-1 rounded text-center text-blue-800">
                            {pendingSeats} chưa lên xe
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <span className="text-gray-400">Chưa có thông tin ghế</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <motion.button
            className="content-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsDetailsModalOpen(true)}
          >
            Chi tiết <span>🎫</span>
          </motion.button>
          
          {paymentInfo.paymentUrl && paymentInfo.status === 'PENDING' && (
            <motion.a
              href={paymentInfo.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="content-button bg-green-600 hover:bg-green-700 text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Thanh toán <span>💳</span>
            </motion.a>
          )}
          
          <motion.button
            className="content-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Gọi điện <span>📞</span>
          </motion.button>
        </div>
      </div>
      
      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        booking={safeBooking}
        scheduleDetails={scheduleDetails}
        seatDetails={seatDetails}
      />
    </motion.div>
  );
};

const FilterTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'all', label: 'Tất cả', icon: '🚌' },
    { id: 'current', label: 'Hiện tại', icon: '🎫' },
    { id: 'completed', label: 'Đã đi', icon: '✅' },
    { id: 'cancelled', label: 'Đã hủy', icon: '❌' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`content-card p-4 relative ${activeTab === tab.id ? 'active-tab' : ''}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">{tab.icon}</span>
            <span className={activeTab === tab.id ? 'text-white' : 'text-gray-700'}>
              {tab.label}
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

const MyOrders = () => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setError(null);
        const data = await getBookingsByCurrentUser();
        console.log("Bookings data received:", data);
        
        // Check for valid data structure
        if (Array.isArray(data)) {
          // Additional validation to ensure all items have required fields
          const validBookings = data.filter(booking => {
            // Check if booking has required fields
            const isValid = booking && booking.bookingId !== undefined;
            if (!isValid) {
              console.warn('Invalid booking object found:', booking);
            }
            return isValid;
          });
          
          setBookings(validBookings);
          console.log("Processed bookings:", validBookings);
        } else {
          console.error("Unexpected response format, not an array:", data);
          throw new Error("Unexpected response format");
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings
    .sort((a, b) => new Date(b.bookingDate || new Date()) - new Date(a.bookingDate || new Date())) // Add default date for sorting
    .filter(booking => {
      const status = booking?.status || '';
      if (activeTab === 'current') return status.toUpperCase() === 'PENDING';
      if (activeTab === 'completed') return status.toUpperCase() === 'CONFIRMED' || status.toUpperCase() === 'COMPLETED';
      if (activeTab === 'cancelled') return status.toUpperCase() === 'CANCELLED';
      return true;
    });

  if (loading) {
    return (
      <AccountSidebarLayout>
        <div className="content-loading">
          <div className="loading-spinner"></div>
        </div>
      </AccountSidebarLayout>
    );
  }

  return (
    <AccountSidebarLayout>
      <div className="content-container max-w-4xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">Đơn hàng của tôi</h1>
          <p className="page-description">Quản lý và theo dõi các chuyến đi của bạn</p>
        </div>

        <FilterTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              className="content-card p-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="content-button"
                >
                  Thử lại
                </button>
              </div>
            </motion.div>
          ) : filteredBookings.length === 0 ? (
            <motion.div
              key="empty"
              className="empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="empty-state-icon">🎫</div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                Không có đơn hàng nào
              </h3>
              <p className="text-gray-500">
                Bạn chưa có đơn hàng nào trong mục này
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredBookings.map((booking, index) => (
                <OrderCard key={booking.id} booking={booking} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AccountSidebarLayout>
  );
};

export default MyOrders;