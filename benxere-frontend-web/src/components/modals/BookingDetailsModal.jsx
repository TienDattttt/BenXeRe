import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import Typography from '../core/typography';
import SeatSelector from '../seat-selector';
import RealTimeChat from '../chat/RealTimeChat';
import { getLocationNameByCode } from '../../utils/load-location';
import websocketService from '../../services/websocket-service';
import { getAvailableCustomerCare } from '../../services/user-service';
import { getScheduleIssues, getScheduleStatus } from '../../services/schedule-service';

const BookingDetailsModal = ({
  isOpen,
  onClose,
  booking,
  scheduleDetails,
  seatDetails,
  className = '',
}) => {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [supportAgent, setSupportAgent] = useState(null);
  const [scheduleIssues, setScheduleIssues] = useState([]);
  const [scheduleStatus, setScheduleStatus] = useState(null);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  
  const ownerId = scheduleDetails?.bus?.owner?.userId;
  
  useEffect(() => {
    if (isOpen && scheduleDetails?.scheduleId) {
      fetchScheduleIssues();
      fetchScheduleStatus();
    }
  }, [isOpen, scheduleDetails]);
  
  const fetchScheduleIssues = async () => {
    if (!scheduleDetails?.scheduleId) return;
    
    try {
      setLoadingIssues(true);
      const issues = await getScheduleIssues(scheduleDetails.scheduleId);
      setScheduleIssues(Array.isArray(issues) ? issues : []);
    } catch (error) {
      console.error('Error fetching schedule issues:', error);
    } finally {
      setLoadingIssues(false);
    }
  };
  
  const fetchScheduleStatus = async () => {
    if (!scheduleDetails?.scheduleId) return;
    
    try {
      setLoadingStatus(true);
      const status = await getScheduleStatus(scheduleDetails.scheduleId);
      setScheduleStatus(status);
    } catch (error) {
      console.error('Error fetching schedule status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };
  
  if (!isOpen || !booking) return null;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const createSeatLayout = () => {
    if (!scheduleDetails?.bus?.capacity) return [];
    
    const capacity = scheduleDetails.bus.capacity;
    const rows = Math.ceil(capacity / 4); 
    const layout = [];
    
    let seatCount = 0;
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < 2; j++) {
        if (seatCount < capacity) {
          const seatNumber = (seatCount + 1).toString();
          const seat = seatDetails.find(seat => seat.seatNumber === seatNumber);
          const seatId = seat ? seat.seatId : `seat-${seatCount + 1}`;
          row.push({ id: seatId, number: seatNumber });
          seatCount++;
        } else {
          row.push(null);
        }
      }
      
        row.push(null);
      
      for (let j = 0; j < 2; j++) {
        if (seatCount < capacity) {
          const seatNumber = (seatCount + 1).toString();
          const seat = seatDetails.find(seat => seat.seatNumber === seatNumber);
          const seatId = seat ? seat.seatId : `seat-${seatCount + 1}`;
          row.push({ id: seatId, number: seatNumber });
          seatCount++;
        } else {
          row.push(null);
        }
      }
      
      layout.push(row);
    }
    
    return layout;
  };

  const handleContactSupport = async () => {
    try {
      setIsLoading(true);
      setChatError(null);
      
      if (!ownerId) {
        throw new Error('Không thể xác định chủ xe.');
      }
      
      const agent = await getAvailableCustomerCare(ownerId);
      
      if (!agent || !agent.userId) {
        throw new Error('Không thể tìm thấy nhân viên hỗ trợ.');
      }
      
      // Set the support agent and show chat
      setSupportAgent(agent);
      setShowChat(true);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setChatError(error.message || 'Không thể kết nối đến hệ thống chat. Vui lòng thử lại sau.');
      setIsLoading(false);
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSupportAgent(null);
  };

  // Get the recipient name (for chat title)
  const getRecipientName = () => {
    if (!supportAgent) return '';
    
    const name = `${supportAgent.firstName || ''} ${supportAgent.lastName || ''}`.trim();
    const role = supportAgent.role === 'CUSTOMER_CARE' ? 'CSKH' : 'Chủ xe';
    
    return `${name} (${role})`;
  };

  // Add Schedule Status and Issues display to the modal
  const renderScheduleStatusInfo = () => {
    if (loadingStatus) {
      return <div className="text-center py-4">Đang tải thông tin trạng thái...</div>;
    }
    
    if (!scheduleStatus) {
      return null;
    }
    
    const getStatusClass = (status) => {
      switch (status) {
        case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
        case 'STARTED': return 'bg-green-100 text-green-800';
        case 'COMPLETED': return 'bg-purple-100 text-purple-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        case 'DELAYED': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };
    
    const getStatusLabel = (status) => {
      switch (status) {
        case 'SCHEDULED': return 'Đã lên lịch';
        case 'STARTED': return 'Đã bắt đầu';
        case 'COMPLETED': return 'Đã hoàn thành';
        case 'CANCELLED': return 'Đã hủy';
        case 'DELAYED': return 'Bị trễ';
        default: return status;
      }
    };
    
    return (
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <Typography variant="subtitle1" className="font-medium mb-3 flex items-center">
          <InfoIcon className="w-5 h-5 mr-2" />
          Trạng thái Chuyến đi
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Trạng thái</p>
            <span className={`px-2 py-1 rounded-full text-sm font-medium inline-block mt-1 ${getStatusClass(scheduleStatus.status)}`}>
              {getStatusLabel(scheduleStatus.status)}
            </span>
          </div>
          {scheduleStatus.actualStartTime && (
            <div>
              <p className="text-sm text-gray-500">Thời gian bắt đầu thực tế</p>
              <p className="font-medium">{formatDate(scheduleStatus.actualStartTime)} {formatTime(scheduleStatus.actualStartTime)}</p>
            </div>
          )}
          {scheduleStatus.actualEndTime && (
            <div>
              <p className="text-sm text-gray-500">Thời gian kết thúc thực tế</p>
              <p className="font-medium">{formatDate(scheduleStatus.actualEndTime)} {formatTime(scheduleStatus.actualEndTime)}</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderScheduleIssues = () => {
    if (loadingIssues) {
      return <div className="text-center py-4">Đang tải thông tin sự cố...</div>;
    }
    
    if (!scheduleIssues.length) {
      return (
        <div className="text-center py-4 text-gray-500">
          <p>Không có sự cố nào được báo cáo</p>
        </div>
      );
    }
    
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
      switch (status) {
        case 'REPORTED': return 'bg-red-100 text-red-800';
        case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
        case 'RESOLVED': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
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
    
    return (
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <Typography variant="subtitle1" className="font-medium mb-3 flex items-center">
          <WarningIcon className="w-5 h-5 mr-2" />
          Sự cố đã báo cáo
        </Typography>
        <div className="space-y-4">
          {scheduleIssues.map((issue) => (
            <div key={issue.issueId} className="border border-gray-200 rounded-lg p-3 bg-white">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-900">
                  {getIssueTypeLabel(issue.issueType)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIssueStatusClass(issue.status)}`}>
                  {getIssueStatusLabel(issue.status)}
                </span>
              </div>
              <p className="text-gray-700 mb-2">{issue.description}</p>
              <div className="text-xs text-gray-500">
                <span>Báo cáo lúc: {formatDate(issue.createdAt)}      Cập nhật lúc:  {formatTime(issue.updatedAt)}</span>
              </div>
              <div className="text-xs text-gray-500">
                <span> Chi tiết sự cố: {issue.issueDescription}</span>
              </div>
              <div className="text-xs text-gray-500">
                <span> Địa điểm : {issue.locationDescription}</span>
              </div>
              <div className="text-xs text-gray-500">
                <span>Kinh độ: {issue.locationLatitude} | Vĩ độ:  {issue.locationLongitude}</span>
              </div>
              {issue.resolution && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700">Cách giải quyết:</p>
                  <p className="text-sm text-gray-600">{issue.resolution}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={twMerge("bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto", className)}
          >
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b bg-white z-10">
              <Typography variant="h5" className="font-semibold">
                Chi tiết đơn hàng #{booking.bookingId}
              </Typography>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Booking Status */}
              <div className="mb-6 flex justify-between items-center">
                <Typography variant="h6" className="font-medium">
                  Trạng thái đơn hàng
                </Typography>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {booking.status === 'COMPLETED' ? 'Hoàn thành' :
                   booking.status === 'Pending' ? 'Đang chờ' :
                   booking.status === 'CANCELLED' ? 'Đã hủy' :
                   booking.status}
                </div>
              </div>

              {/* Booking Info */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <Typography variant="subtitle1" className="font-medium mb-3">
                  Thông tin đặt vé
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Mã đặt vé</p>
                    <p className="font-medium">#{booking.bookingId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày đặt</p>
                    <p className="font-medium">{formatDate(booking.bookingDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tổng giá</p>
                    <p className="font-medium text-blue-600">{booking.totalPrice ? booking.totalPrice.toLocaleString('vi-VN') : '0'} ₫</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                    <p className="font-medium">{booking?.payment?.paymentMethod || 'Không có thông tin'}</p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              {booking.payment && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <Typography variant="subtitle1" className="font-medium mb-3">
                    Thông tin thanh toán
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Mã thanh toán</p>
                      <p className="font-medium">#{booking.payment.paymentId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Trạng thái</p>
                      <p className={`font-medium ${
                        booking.payment.status === 'COMPLETED' || booking.payment.status === 'PAID' ? 'text-green-600' :
                        booking.payment.status === 'PENDING' ? 'text-yellow-600' :
                        booking.payment.status === 'FAILED' || booking.payment.status === 'CANCELLED' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {booking.payment.paymentMethod === 'CASH' ? 'Thanh toán khi lên xe' : 
                        booking.payment.status === 'COMPLETED' || booking.payment.status === 'PAID' ? 'Đã thanh toán' :
                         booking.payment.status === 'PENDING' ? 'Đang xử lý' :
                         booking.payment.status === 'FAILED' ? 'Thanh toán thất bại' :
                         booking.payment.status === 'CANCELLED' ? 'Đã hủy' :
                         booking.payment.status || 'Chưa thanh toán'}
                      </p>
                    </div>
                    
                    {booking.payment.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500">Ngày thanh toán</p>
                        <p className="font-medium">{formatDate(booking.payment.createdAt)}</p>
                      </div>
                    )}
                    
                    {booking.payment.updatedAt && booking.payment.updatedAt !== booking.payment.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500">Cập nhật lúc</p>
                        <p className="font-medium">{formatDate(booking.payment.updatedAt)}</p>
                      </div>
                    )}
                    
                    {booking.payment.originalAmount && booking.payment.discountAmount && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">Giá gốc</p>
                          <p className="font-medium line-through text-gray-500">
                            {booking.payment.originalAmount ? booking.payment.originalAmount.toLocaleString('vi-VN') : '0'} ₫
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Giảm giá</p>
                          <p className="font-medium text-green-600">
                            -{booking.payment.discountAmount ? booking.payment.discountAmount.toLocaleString('vi-VN') : '0'} ₫
                          </p>
                        </div>
                      </>
                    )}
                    
                    {booking.payment.couponCode && (
                      <div>
                        <p className="text-sm text-gray-500">Mã giảm giá</p>
                        <p className="font-medium text-blue-600">{booking.payment.couponCode}</p>
                      </div>
                    )}
                    
                    {booking.payment.transactionId && (
                      <div>
                        <p className="text-sm text-gray-500">Mã giao dịch</p>
                        <p className="font-medium">{booking.payment.transactionId}</p>
                      </div>
                    )}
                    
                    {booking.payment.paymentUrl && booking.payment.status === 'PENDING' && (
                      <div className="col-span-2 mt-2">
                        <a 
                          href={booking.payment.paymentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Tiếp tục thanh toán
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Trip Info */}
              {scheduleDetails && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <Typography variant="subtitle1" className="font-medium mb-3">
                    Thông tin chuyến đi
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nhà xe</p>
                      <p className="font-medium">{scheduleDetails.bus?.companyName || 'Không có thông tin'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Loại xe</p>
                      <p className="font-medium">{scheduleDetails.bus?.busType || 'Không có thông tin'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Từ</p>
                      <p className="font-medium">{getLocationNameByCode(scheduleDetails.route?.originName) || getLocationNameByCode(scheduleDetails.route?.origin) || 'Không có thông tin'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Đến</p>
                      <p className="font-medium">{getLocationNameByCode(scheduleDetails.route?.destinationName) || getLocationNameByCode(scheduleDetails.route?.destination )|| 'Không có thông tin'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Thời gian khởi hành</p>
                      <p className="font-medium">{formatDate(scheduleDetails.departureTime)} {formatTime(scheduleDetails.departureTime)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Thời gian đến</p>
                      <p className="font-medium">{formatDate(scheduleDetails.arrivalTime)} {formatTime(scheduleDetails.arrivalTime)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Seat Details */}
              <div className="mb-6">
                <Typography variant="subtitle1" className="font-medium mb-3">
                  Thông tin ghế đã đặt
                </Typography>
                <div className="flex flex-wrap gap-2 mb-4">
                  {seatDetails.map(seat => (
                    <div 
                      key={seat.seatId} 
                      className={`px-3 py-2 rounded-lg flex items-center cursor-pointer transition-colors ${
                        selectedSeat === seat.seatId 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                      onClick={() => setSelectedSeat(seat.seatId === selectedSeat ? null : seat.seatId)}
                    >
                      <span className="font-medium">Ghế {seat.seatNumber}</span>
                    </div>
                  ))}
                </div>

                {/* QR Code Display */}
                {selectedSeat && (
                  <motion.div 
                    className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Typography variant="subtitle2" className="font-medium mb-3 text-center">
                      Mã QR cho ghế {seatDetails.find(s => s.seatId === selectedSeat)?.seatNumber}
                    </Typography>
                    <div className="flex flex-col items-center">
                      {seatDetails.find(s => s.seatId === selectedSeat)?.qrCodeData ? (
                        <div className="relative">
                          <img 
                            src={`data:image/png;base64,${seatDetails.find(s => s.seatId === selectedSeat).qrCodeData}`} 
                            alt={`QR Code for seat ${seatDetails.find(s => s.seatId === selectedSeat).seatNumber}`}
                            className="w-56 h-56 mx-auto border border-gray-200 rounded-lg" 
                          />
                          <p className="text-sm text-center mt-2 text-gray-600">
                            Mã QR này được sử dụng để lên xe. Vui lòng xuất trình khi lên xe.
                          </p>
                        </div>
                      ) : (
                        <p className="text-center text-gray-500">Không tìm thấy mã QR cho ghế này</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Detailed Seat Information */}
                {selectedSeat && (
                  <motion.div 
                    className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Typography variant="subtitle2" className="font-medium mb-3">
                      Thông tin chi tiết ghế {seatDetails.find(s => s.seatId === selectedSeat)?.seatNumber}
                    </Typography>
                    
                    {/* Find the seat details */}
                    {(() => {
                      const seat = seatDetails.find(s => s.seatId === selectedSeat);
                      if (!seat) return <p>Không tìm thấy thông tin chi tiết.</p>;
                      
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Trạng thái</p>
                            <p className={`font-medium ${
                                seat.passengerStatus === 'ĐÃ LÊN XE' ? 'text-green-600' :
                                seat.passengerStatus === 'ĐÃ XUỐNG XE' ? 'text-purple-600' :
                                seat.passengerStatus === 'ĐÃ HỦY' ? 'text-red-600' : 'text-blue-600'
                              }`}>
                              {seat.passengerStatus || 'Chưa lên xe'}
                            </p>
                          </div>
                          
                          {seat.user && (
                            <div>
                              <p className="text-sm text-gray-500">Khách hàng</p>
                              <p className="font-medium">{seat.user.firstName} {seat.user.lastName}</p>
                            </div>
                          )}
                          
                          {seat.checkInTime && (
                            <div>
                              <p className="text-sm text-gray-500">Thời gian lên xe</p>
                              <p className="font-medium">{formatTime(seat.checkInTime)}</p>
                              <p className="text-xs text-gray-500">{formatDate(seat.checkInTime)}</p>
                            </div>
                          )}
                          
                          {seat.checkOutTime && (
                            <div>
                              <p className="text-sm text-gray-500">Thời gian xuống xe</p>
                              <p className="font-medium">{formatTime(seat.checkOutTime)}</p>
                              <p className="text-xs text-gray-500">{formatDate(seat.checkOutTime)}</p>
                            </div>
                          )}
                          
                          {seat.lastQrScanTime && (
                            <div>
                              <p className="text-sm text-gray-500">Lần quét QR cuối</p>
                              <p className="font-medium">{formatTime(seat.lastQrScanTime)}</p>
                              <p className="text-xs text-gray-500">{formatDate(seat.lastQrScanTime)}</p>
                            </div>
                          )}
                          
                          {seat.qrCodeScannedCount !== undefined && (
                            <div>
                              <p className="text-sm text-gray-500">Số lần quét QR</p>
                              <p className="font-medium">{seat.qrCodeScannedCount}</p>
                            </div>
                          )}
                          
                          {seat.baggageCount !== undefined && seat.baggageCount !== null && (
                            <div>
                              <p className="text-sm text-gray-500">Số hành lý</p>
                              <p className="font-medium">{seat.baggageCount} kiện</p>
                            </div>
                          )}
                          
                          {seat.driverNotes && (
                            <div className="col-span-2">
                              <p className="text-sm text-gray-500">Ghi chú từ tài xế</p>
                              <p className="font-medium">{seat.driverNotes}</p>
                            </div>
                          )}
                          
                          {seat.lastUpdatedAt && (
                            <div>
                              <p className="text-sm text-gray-500">Cập nhật lúc</p>
                              <p className="font-medium">{formatTime(seat.lastUpdatedAt)}</p>
                              <p className="text-xs text-gray-500">{formatDate(seat.lastUpdatedAt)}</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {/* Seat layout visualization */}
                <div className="mt-6 border rounded-lg p-4">
                  <Typography variant="subtitle2" className="font-medium mb-4 text-center">
                    Sơ đồ ghế (ghế bạn đã đặt được đánh dấu)
                  </Typography>
                  
                  <SeatSelector
                    layout={createSeatLayout()}
                    selectedSeats={seatDetails.map(seat => seat.seatId)}
                    reservedSeats={[]}
                    unavailableSeats={[]}
                    maxSelections={0} 
                    onSeatSelect={() => {}} 
                  />
                </div>
              </div>

              {/* Passenger info */}
              {booking.passenger && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <Typography variant="subtitle1" className="font-medium mb-3">
                    Thông tin hành khách
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Họ tên</p>
                      <p className="font-medium">{booking.passenger.name || 'Không có thông tin'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số điện thoại</p>
                      <p className="font-medium">{booking.passenger.phone || 'Không có thông tin'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{booking.passenger.email || 'Không có thông tin'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {booking.notes && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <Typography variant="subtitle1" className="font-medium mb-2">
                    Ghi chú
                  </Typography>
                  <p>{booking.notes}</p>
                </div>
              )}

              {/* Add Status and Issues sections */}
              {scheduleDetails && renderScheduleStatusInfo()}
              {scheduleDetails && renderScheduleIssues()}

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-8">
                {/* Chat button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleContactSupport}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                      Đang kết nối...
                    </>
                  ) : (
                    <>
                      <ChatIcon className="w-5 h-5 mr-2" />
                      Liên hệ hỗ trợ
                    </>
                  )}
                </motion.button>
                
                {booking.status === 'Pending' && (
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Hủy đặt vé
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
            
            {/* Add error toast/message if there's a chat error */}
            {chatError && (
              <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
                <strong className="font-bold">Lỗi!</strong>
                <span className="block sm:inline"> {chatError}</span>
              </div>
            )}

            {/* Chat overlay */}
            <AnimatePresence>
              {showChat && supportAgent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                >
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col"
                  >
                    <RealTimeChat 
                      otherUserId={supportAgent.userId}
                      title={`Hỗ trợ đặt vé #${booking.bookingId} - ${getRecipientName()}`}
                      onClose={handleCloseChat}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingDetailsModal;