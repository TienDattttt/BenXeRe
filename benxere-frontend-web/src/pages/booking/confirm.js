import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthStateContext } from '../../contexts/auth';
import { createBooking } from '../../services/booking-service';
import TripDetails from './components/TripDetails';
import { getBusImageUrl } from '../../constants/common';

const BookingConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const { isLoggedIn } = useContext(AuthStateContext);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  
  const selectedSeats = useMemo(() => state?.selectedSeats || [], [state]);
  const schedule = useMemo(() => {
    if (!state?.schedule) return {};
    const scheduleData = {
      ...state.schedule,
      departureTime: state.schedule.departureTime,
      arrivalTime: state.schedule.arrivalTime
    };
    console.log('Processed schedule data:', scheduleData);
    return scheduleData;
  }, [state]);
  const coupon = useMemo(() => state?.coupon || null, [state]);
  const totalFare = useMemo(() => state?.totalFare || 0, [state]);
  
  const originalFare = useMemo(() => 
    schedule.fare * selectedSeats.length,
    [schedule.fare, selectedSeats.length]
  );

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth', { state: { from: location.pathname } });
      return;
    }
    
    if (!schedule.id || selectedSeats.length === 0) {
      navigate('/');
    }
  }, [isLoggedIn, navigate, location.pathname, schedule, selectedSeats]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const bookingData = {
        scheduleId: schedule.id,
        seatIds: selectedSeats.map(seat => seat.id),
        pickUpLocationId: schedule.pickUpLocationId,
        dropOffLocationId: schedule.dropOffLocationId,
        status: 'PENDING',
        paymentMethod,
        returnUrl: window.location.origin + '/booking-result'
      };

      // Add coupon code if exists
      if (coupon?.code) {
        bookingData.couponCode = coupon.code;
      }
      console.log('Creating booking with data:', bookingData);
      const { booking, payment } = await createBooking(bookingData);
      
      if (paymentMethod === 'CASH') {
        navigate('/booking-result', {
          state: {
            bookingId: booking.bookingId,
            success: true,
            message: 'Đặt vé thành công!'
          }
        });
      } else {
        if (payment?.paymentUrl) {
          console.log('Redirecting to payment URL:', payment.paymentUrl);
          // Store booking and payment IDs before redirecting
          localStorage.setItem('lastBookingId', booking.bookingId);
          localStorage.setItem('lastPaymentId', payment.paymentId);
          window.location.href = payment.paymentUrl;
        } else {
          console.error('Payment response:', payment);
          throw new Error('Không nhận được url thanh toán. Vui lòng thử lại.');
        }
      }
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.message || 'Đã xảy ra lỗi khi đặt vé. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };


  const tripInfo = useMemo(() => {
    console.log('Full schedule data:', schedule);
    const busCompanyName = schedule.bus?.companyName || schedule.companyName || 'Chưa có thông tin';
    
    const formatTime = (timeStr) => {
      console.log('Formatting time value:', timeStr);
      if (!timeStr) return 'Chưa xác định';
      
      try {
        const time = new Date(timeStr);
        if (isNaN(time.getTime())) {
          console.error('Invalid date value:', timeStr);
          return 'Chưa xác định';
        }
        const formattedTime = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')} ${time.toLocaleDateString('vi-VN')}`;
        console.log('Formatted time result:', formattedTime);
        return formattedTime;
      } catch (error) {
        console.error('Error formatting time:', error);
        return 'Chưa xác định';
      }
    };
    
    return {
      operator: busCompanyName,
      pickup: schedule.pickUpLocation?.name || 'N/A',
      dropoff: schedule.dropOffLocation?.name || 'N/A',
      departureTime: formatTime(schedule.departureTime || null),
      arrivalTime: formatTime(schedule.arrivalTime || null),
      image: schedule.route?.bus?.images && schedule.route.bus.images.length > 0 
        ? (schedule.route.bus.images[0].imageUrl || getBusImageUrl(schedule.route.bus.images[0].imageName))
        : '/images/default-bus.jpg',
      seats: selectedSeats,
      originalFare,
      totalFare
    };
  }, [schedule, selectedSeats, originalFare, totalFare]);

  // Coupon information to display
  const couponInfo = useMemo(() => coupon ? {
    code: coupon.code,
    discountAmount: Math.abs(originalFare - totalFare)
  } : null, [coupon, originalFare, totalFare]);

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 text-white">
          <h1 className="text-3xl font-bold">Xác nhận đặt vé</h1>
          <p className="text-sm opacity-90 mt-1">Kiểm tra thông tin và chọn phương thức thanh toán</p>
        </div>
        
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Trip Details */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Thông tin chuyến đi
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <TripDetails 
                  tripInfo={tripInfo} 
                  couponInfo={couponInfo} 
                />
              </div>
            </div>
            
            {/* Booking Form */}
            <div className="md:col-span-3">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2" />
                </svg>
                Phương thức thanh toán
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seats information */}
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Thông tin ghế đã chọn
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedSeats.map(seat => (
                      <span 
                        key={seat.id} 
                        className="px-3 py-1.5 bg-white border border-blue-200 text-blue-800 rounded-full text-sm font-medium shadow-sm"
                      >
                        Ghế {seat.number}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Payment Methods */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <h3 className="font-medium p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    Chọn phương thức thanh toán
                  </h3>
                  <div className="p-4 space-y-3">
                    <label className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${paymentMethod === 'CASH' ? 'border-blue-400 bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="CASH"
                        checked={paymentMethod === 'CASH'}
                        onChange={() => setPaymentMethod('CASH')}
                        className="mr-3 h-4 w-4 text-blue-600"
                      />
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Tiền mặt</div>
                          <div className="text-sm text-gray-500">Thanh toán khi lên xe</div>
                        </div>
                      </div>
                    </label>
                    
                    <label className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${paymentMethod === 'ZALOPAY' ? 'border-blue-400 bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="ZALOPAY"
                        checked={paymentMethod === 'ZALOPAY'}
                        onChange={() => setPaymentMethod('ZALOPAY')}
                        className="mr-3 h-4 w-4 text-blue-600"
                      />
                      <div className="flex items-center">
                        <img 
                          src="/payment-logos/zalopay.png" 
                          alt="ZaloPay" 
                          className="h-10 w-10 mr-3 object-contain" 
                        />
                        <div>
                          <div className="font-medium">ZaloPay</div>
                          <div className="text-sm text-gray-500">Thanh toán qua cổng ZaloPay</div>
                        </div>
                      </div>
                    </label>
                    
                    <label className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${paymentMethod === 'MOMO' ? 'border-blue-400 bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="MOMO"
                        checked={paymentMethod === 'MOMO'}
                        onChange={() => setPaymentMethod('MOMO')}
                        className="mr-3 h-4 w-4 text-blue-600"
                      />
                      <div className="flex items-center">
                        <img 
                          src="/payment-logos/momo.svg" 
                          alt="MoMo" 
                          className="h-10 w-10 mr-3 object-contain" 
                        />
                        <div>
                          <div className="font-medium">MoMo</div>
                          <div className="text-sm text-gray-500">Thanh toán qua ví MoMo</div>
                        </div>
                      </div>
                    </label>
                    
                    <label className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${paymentMethod === 'VNPAY' ? 'border-blue-400 bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="VNPAY"
                        checked={paymentMethod === 'VNPAY'}
                        onChange={() => setPaymentMethod('VNPAY')}
                        className="mr-3 h-4 w-4 text-blue-600"
                      />
                      <div className="flex items-center">
                        <img 
                          src="/payment-logos/vnpay.jpg" 
                          alt="VNPay" 
                          className="h-10 w-10 mr-3 object-contain rounded" 
                        />
                        <div>
                          <div className="font-medium">VNPay</div>
                          <div className="text-sm text-gray-500">Thanh toán qua cổng VNPAY</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                
                {error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 bg-gray-100 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 px-6 py-3 rounded-lg font-bold text-white flex items-center justify-center ${
                      isLoading 
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md'
                    } transition-colors`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Xác nhận đặt vé
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirm;