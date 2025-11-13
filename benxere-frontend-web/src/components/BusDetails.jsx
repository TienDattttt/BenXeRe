import React, { useState, useEffect, useContext } from "react";
import Skeleton from "react-loading-skeleton";
import ChatInterface from "./chat/chat-interface";
import { AuthStateContext } from "../contexts/auth";
import { useNavigate } from "react-router-dom";
import "react-loading-skeleton/dist/skeleton.css";
import "../styles/custom-scrollbar.css";
import SeatSelector from "./seat-selector";
import Discounts from "./Discounts";
import PickupLocations from "./PickupLocations";
import DropoffLocations from "./DropoffLocations";
import BusRatings from "./ratings/BusRatings";
import { getSeatsByScheduleId } from "../services/seat-service";
import { getPickUpSchedules, getDropOffSchedules } from "../services/location-service";
import { getCouponByCode } from "../services/coupon-service";
import { getRatingsByBus } from "../services/rating-service";
import { getBusImageUrl } from "../constants/common";

const generateSeatLayout = (capacity, allSeats = []) => {
  const layout = [];
  let seatNumber = 1;

  const seatMap = new Map(allSeats.map(seat => [parseInt(seat.seatNumber), seat]));
  console.log('Seat map:', Object.fromEntries(seatMap));

  // Helper function to create a seat/bed object
  const createSeat = (number, type = 'seat', isDriver = false, isFrontPassenger = false) => ({
    id: number,
    number: String(number).padStart(2, '0'),
    booked: seatMap.get(number)?.booked || false,
    seatId: seatMap.get(number)?.seatId,
    type: type, // 'seat' or 'bed'
    isDriver: isDriver,
    isFrontPassenger: isFrontPassenger,
    unavailable: isDriver || isFrontPassenger // Mark driver and front passenger seats as unavailable
  });

  // Helper function to create an aisle
  const createAisle = () => null;

  // Helper function to create a level indicator
  const createLevelIndicator = (level) => ({
    id: `level-${level}`,
    number: level === 'upper' ? 'Tầng trên' : 'Tầng dưới',
    type: 'level-indicator',
    level: level
  });

  // Generate layout based on capacity
  if (capacity <= 5) {
    // 5-seat configuration (2 + 3)
    layout.push([
      createSeat(seatNumber++, 'seat', true), // Driver
      createSeat(seatNumber++, 'seat', false, true), // Front passenger
    ]);
    layout.push([
      createSeat(seatNumber++, 'seat'),
      createSeat(seatNumber++, 'seat'),
      createSeat(seatNumber++, 'seat'),
    ]);
  } else if (capacity <= 7) {
    // 7-seat configuration (2 + 2/3 + 2)
    layout.push([
      createSeat(seatNumber++, 'seat', true), // Driver
      createSeat(seatNumber++, 'seat', false, true), // Front passenger
    ]);
    layout.push([
      createSeat(seatNumber++, 'seat'),
      createSeat(seatNumber++, 'seat'),
      createAisle(),
      createSeat(seatNumber++, 'seat'),
    ]);
    layout.push([
      createSeat(seatNumber++, 'seat'),
      createSeat(seatNumber++, 'seat'),
    ]);
  } else if (capacity <= 9) {
    // 9-seat configuration (2 + 2 + 2 + 3)
    layout.push([
      createSeat(seatNumber++, 'seat', true), // Driver
      createSeat(seatNumber++, 'seat', false, true), // Front passenger
    ]);
    for (let i = 0; i < 2; i++) {
      layout.push([
        createSeat(seatNumber++, 'seat'),
        createSeat(seatNumber++, 'seat'),
        createAisle(),
        createSeat(seatNumber++, 'seat'),
        createSeat(seatNumber++, 'seat'),
      ]);
    }
    layout.push([
      createSeat(seatNumber++, 'seat'),
      createSeat(seatNumber++, 'seat'),
      createSeat(seatNumber++, 'seat'),
    ]);
  } else if (capacity <= 16) {
    // 16-seat configuration
    // Front row (driver + passenger)
    layout.push([
      createSeat(seatNumber++, 'seat', true), // Driver
      createSeat(seatNumber++, 'seat', false, true), // Front passenger
    ]);
    // Middle rows (3 seats each)
    for (let i = 0; i < 4; i++) {
      layout.push([
        createSeat(seatNumber++, 'seat'),
        createSeat(seatNumber++, 'seat'),
        createAisle(),
        createSeat(seatNumber++, 'seat'),
      ]);
    }
    // Last row (4 seats)
    layout.push([
      createSeat(seatNumber++, 'seat'),
      createSeat(seatNumber++, 'seat'),
      createSeat(seatNumber++, 'seat'),
      createSeat(seatNumber++, 'seat'),
    ]);
  } else if (capacity <= 24) {
    // 24-bed configuration (2 levels, 2 columns)
    // Level indicator for lower floor
    layout.push([createLevelIndicator('lower')]);
    
    // Lower level beds (2 columns)
    for (let i = 0; i < 6; i++) {
      layout.push([
        createSeat(seatNumber++, 'bed'),
        createSeat(seatNumber++, 'bed'),
      ]);
    }

    // Level indicator for upper floor
    layout.push([createLevelIndicator('upper')]);
    
    // Upper level beds (2 columns)
    for (let i = 0; i < 6; i++) {
      layout.push([
        createSeat(seatNumber++, 'bed'),
        createSeat(seatNumber++, 'bed'),
      ]);
    }
  } else if (capacity <= 35) {
    // 29/35-bed configuration (2 levels, 3 columns)
    // Level indicator for lower floor
    layout.push([createLevelIndicator('lower')]);
    
    // Lower level beds (3 columns)
    const lowerRows = capacity <= 29 ? 5 : 6;
    for (let i = 0; i < lowerRows; i++) {
      layout.push([
        createSeat(seatNumber++, 'bed'),
        createSeat(seatNumber++, 'bed'),
        createAisle(),
        createSeat(seatNumber++, 'bed'),
      ]);
    }

    // Level indicator for upper floor
    layout.push([createLevelIndicator('upper')]);
    
    // Upper level beds (3 columns)
    const upperRows = capacity <= 29 ? 5 : 6;
    for (let i = 0; i < upperRows; i++) {
      layout.push([
        createSeat(seatNumber++, 'bed'),
        createSeat(seatNumber++, 'bed'),
        createAisle(),
        createSeat(seatNumber++, 'bed'),
      ]);
    }
  } else {
    // 45-bed configuration (2 levels, 3 columns)
    // Level indicator for lower floor
    layout.push([createLevelIndicator('lower')]);
    
    // Lower level beds (3 columns)
    for (let i = 0; i < 7; i++) {
      layout.push([
        createSeat(seatNumber++, 'bed'),
        createSeat(seatNumber++, 'bed'),
        createAisle(),
        createSeat(seatNumber++, 'bed'),
      ]);
    }

    // Level indicator for upper floor
    layout.push([createLevelIndicator('upper')]);
    
    // Upper level beds (3 columns)
    for (let i = 0; i < 7; i++) {
      layout.push([
        createSeat(seatNumber++, 'bed'),
        createSeat(seatNumber++, 'bed'),
        createAisle(),
        createSeat(seatNumber++, 'bed'),
      ]);
    }
  }

  return layout;
};

const BusDetails = ({
  selectedBus,
  handleSectionClick,
  handleShowSeats,
  handleCloseDetails,
  showSeats,
  activeSection,
  pickupLocations,
  dropoffLocations,
}) => {
  const { isLoggedIn } = useContext(AuthStateContext);
  const [showChat, setShowChat] = useState(false);
  const [seatLayout, setSeatLayout] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [busRating, setBusRating] = useState(null);
  const [loadingRating, setLoadingRating] = useState(false);
  const navigate = useNavigate();

  // Handle opening the chat interface
  const handleChatClick = () => {
    if (!isLoggedIn) {
      navigate('/login', { 
        state: { 
          from: window.location.pathname,
          message: 'Vui lòng đăng nhập để chat với chủ xe' 
        } 
      });
      return;
    }
    setShowChat(true);
  };

  useEffect(() => {
    const fetchSeats = async () => {
      if (!selectedBus?.scheduleId) return;
      setLoadingSeats(true);
      try {
        const seats = await getSeatsByScheduleId(selectedBus.scheduleId);
        console.log('Raw seats data:', seats);
        const bookedSeats = seats.filter(s => s.booked);
        console.log('Booked seats:', bookedSeats);
        const layout = generateSeatLayout(selectedBus.capacity, seats);
        const bookedInLayout = layout.flat()
          .filter(seat => seat && seat.booked)
          .map(seat => ({
            id: seat.id,
            number: seat.number,
            seatId: seat.seatId,
            booked: seat.isBooked
          }));
        console.log('Booked seats in layout:', bookedInLayout);

        setSeatLayout(layout);
      } catch (error) {
        console.error("Error fetching seats:", error);
      } finally {
        setLoadingSeats(false);
      }
    };

    if (showSeats) {
      fetchSeats();
    }
  }, [selectedBus, showSeats]);

  useEffect(() => {
    if (selectedBus?.busId) {
      fetchBusRatings();
    }
  }, [selectedBus?.busId]);

  // Fetch bus ratings
  const fetchBusRatings = async () => {
    if (!selectedBus?.busId) return;
    
    setLoadingRating(true);
    try {
      const ratingData = await getRatingsByBus(selectedBus.busId, 0, 5);
      setBusRating(ratingData);
    } catch (error) {
      console.error("Error fetching bus ratings:", error);
    } finally {
      setLoadingRating(false);
    }
  };

  const handleSeatSelect = (seats) => {
    setSelectedSeats(seats);
    console.log('Selected seats:', seats);
  };

  const calculateTotalFare = () => {
    if (!selectedBus?.pricePerSeat || selectedSeats.length === 0) return 0;
    
    const basePrice = selectedBus.pricePerSeat * selectedSeats.length;
    
    if (!coupon) return basePrice;
    
    if (coupon.discountPercentage !== undefined && coupon.discountPercentage !== null) {
      const discountAmount = basePrice * (coupon.discountPercentage / 100);
      const maxDiscount = coupon.maxDiscountAmount || Infinity;
      return basePrice - Math.min(discountAmount, maxDiscount);
    } 
    else if (coupon.discountFixed !== undefined && coupon.discountFixed !== null) {
      return basePrice - Math.min(coupon.discountFixed, basePrice);
    }
    else if (coupon.discountType === 'PERCENTAGE') {
      const discountAmount = basePrice * (coupon.discountValue / 100);
      return basePrice - Math.min(discountAmount, coupon.maxDiscountAmount || Infinity);
    } else {
      return basePrice - Math.min(coupon.discountValue || 0, basePrice);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Vui lòng nhập mã giảm giá");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");

    try {
      const response = await getCouponByCode(couponCode);
      console.log('Coupon response:', response);
      
      const couponData = response.result || response;
      
      const now = new Date();
      const startDate = new Date(couponData.validFrom || couponData.startDate);
      const endDate = new Date(couponData.validTo || couponData.endDate);
      
      if (now < startDate) {
        setCouponError("Mã giảm giá chưa có hiệu lực");
      } else if (now > endDate) {
        setCouponError("Mã giảm giá đã hết hạn");
      } else if ((couponData.remainingUses !== undefined && couponData.remainingUses <= 0) || 
                 (couponData.usageLimit !== undefined && couponData.usageCount >= couponData.usageLimit && couponData.usageLimit > 0)) {
        setCouponError("Mã giảm giá đã hết lượt sử dụng");
      } else if (couponData.minBookingAmount && selectedBus.pricePerSeat * selectedSeats.length < couponData.minBookingAmount) {
        setCouponError(`Đơn hàng tối thiểu phải từ ${formatCurrency(couponData.minBookingAmount)}`);
      } else if (!couponData.active) {
        setCouponError("Mã giảm giá không hoạt động");
      } else {
        setCoupon(couponData);
        setCouponError("");
      }
    } catch (error) {
      setCouponError("Mã giảm giá không hợp lệ hoặc không tồn tại");
      console.error("Error validating coupon:", error);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleClearCoupon = () => {
    setCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleBooking = () => {
    if (!pickupLocation || !dropoffLocation) {
      alert("Vui lòng chọn điểm đón và điểm trả");
      return;
    }

    if (!selectedBus.pricePerSeat) {
      alert("Không tìm thấy thông tin giá vé. Vui lòng thử lại sau.");
      return;
    }

    console.log('Selected bus details:', selectedBus);

    const selectedSeatDetails = seatLayout.flat()
      .filter(s => s && selectedSeats.includes(s.id))
      .map(seat => ({
        id: seat.seatId || seat.id,
        number: seat.number
      }));

    const selectedPickupLocation = (pickupLocations || []).find(loc => loc.locationId === pickupLocation);
    const selectedDropoffLocation = (dropoffLocations || []).find(loc => loc.locationId === dropoffLocation);
    
    console.log('Selected locations:', { pickup: selectedPickupLocation, dropoff: selectedDropoffLocation });
    
    const scheduleData = {
      id: selectedBus.scheduleId,
      pickUpLocationId: pickupLocation,
      dropOffLocationId: dropoffLocation,
      route: selectedBus.route,
      departureTime: selectedBus.departureTime,
      arrivalTime: selectedBus.arrivalTime,
      fare: selectedBus.pricePerSeat,
      companyName: selectedBus.companyName,
      bus: selectedBus,
      pickUpLocation: selectedPickupLocation,
      dropOffLocation: selectedDropoffLocation
    };
    console.log('Preparing schedule data:', scheduleData);
    
    navigate('/booking/confirm', {
      state: {
        selectedSeats: selectedSeatDetails,
        schedule: scheduleData,
        coupon: coupon ? {
          couponId: coupon.id,
          code: coupon.code,
          discountAmount: calculateTotalFare() - (selectedBus.pricePerSeat * selectedSeats.length),
          totalFare: calculateTotalFare()
        } : null,
        totalFare: calculateTotalFare()
      }
    });
  };

  if (!selectedBus) return null;

  return (
    <div className="p-4">
      <div className="mt-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h4 className="text-xl font-bold text-gray-800 mb-4">
            Số xe: {selectedBus.busNumber}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-gray-600">
            <p>Loại xe: {selectedBus.busType}</p>
            <p>Sức chứa: {selectedBus.capacity} chỗ</p>
            <p>Nhà xe: {selectedBus.companyName}</p>
            <p className="font-medium text-green-600">
              Giá vé: {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(selectedBus.pricePerSeat || 0)}
            </p>
            
            {/* Rating summary */}
            <div className="col-span-2 mt-2 mb-2">
              <div className="flex items-center">
                <span className="mr-2 font-medium">Đánh giá:</span>
                {loadingRating ? (
                  <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
                ) : busRating && typeof busRating.averageRating !== 'undefined' ? (
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(busRating.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-blue-600 mr-2">
                      {(busRating.averageRating || 0).toFixed(1)}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({busRating.totalRatings || 0} đánh giá)
                    </span>
                    <button 
                      onClick={() => handleSectionClick("reviews")}
                      className="ml-3 text-blue-500 text-sm hover:underline"
                    >
                      Xem đánh giá
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-500">Chưa có đánh giá</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p>Chủ xe: {selectedBus.owner.firstName} {selectedBus.owner.lastName}</p>
              <button
                onClick={handleChatClick}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
                title={isLoggedIn ? "Nhắn tin với chủ xe" : "Đăng nhập để nhắn tin"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm4 0h-2v2h2V9zm4 0h-2v2h2V9z" clipRule="evenodd" />
                </svg>
                Nhắn tin
              </button>
            </div>
          </div>
        </div>

        {selectedBus.images && selectedBus.images.length > 0 && (
          <div className="mt-4 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Hình ảnh</h3>
            <div className="grid grid-cols-3 gap-4">
              {selectedBus.images.map((image, index) => (
                <div key={index} className="relative overflow-hidden rounded-lg h-48">
                  <img
                    src={getBusImageUrl(image.imageUrl || image.imageName)}
                    alt={image.imageName || "Bus image"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-bus.jpg';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-6">
          {["discounts", "pickupDropoff", "seats", "policies", "reviews"].map((section) => (
            <button
              key={section}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300
                ${activeSection === section || (section === 'seats' && showSeats)
                  ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-500'
                }`}
              onClick={() => section === 'seats' ? handleShowSeats() : handleSectionClick(section)}
            >
              {section === 'seats' ? 'Chọn ghế' :
               section === 'discounts' ? 'Giảm giá' :
               section === 'pickupDropoff' ? 'Đón/trả' :
               section === 'policies' ? 'Chính sách' : 'Đánh giá'}
            </button>
          ))}
        </div>

        {showSeats && (
          <div className="mt-6">
            {loadingSeats ? (
              <Skeleton height={400} />
            ) : (
              <SeatSelector
                layout={seatLayout}
                selectedSeats={selectedSeats}
                maxSelections={5}
                onSeatSelect={handleSeatSelect}
              />
            )}
          </div>
        )}

        {activeSection === "discounts" && <Discounts />}
        {activeSection === "pickupDropoff" && (
          <div className="mt-6 grid grid-cols-2 gap-6">
            <PickupLocations
              locations={pickupLocations || []}
              selected={pickupLocation}
              onSelect={setPickupLocation}
            />
            <DropoffLocations
              locations={dropoffLocations || []}
              selected={dropoffLocation}
              onSelect={setDropoffLocation}
            />
          </div>
        )}

        {activeSection === "reviews" && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            {isLoggedIn && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-800">Chia sẻ đánh giá của bạn</h3>
                  <button
                    onClick={() => navigate('/account/review', { 
                      state: { 
                        busId: selectedBus.busId,
                        busNumber: selectedBus.busNumber,
                        companyName: selectedBus.companyName,
                        scheduleId: selectedBus.scheduleId 
                      } 
                    })}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Viết đánh giá
                  </button>
                </div>
                <p className="mt-2 text-gray-600 text-sm">
                  Chia sẻ trải nghiệm của bạn về dịch vụ và giúp những người khác có quyết định đúng đắn.
                </p>
              </div>
            )}
            <BusRatings busId={selectedBus.busId} busNumber={selectedBus.busNumber} />
          </div>
        )}

        {selectedSeats.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Xác nhận đặt vé</h3>
              <div className="text-sm text-gray-600">
                Đã chọn {selectedSeats.length} ghế
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>
                    {pickupLocation ?
                      (pickupLocations || []).find(loc => loc.locationId === pickupLocation)?.name || 'Vị trí không xác định' :
                      'Chưa chọn điểm đón'
                    }
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>
                    {dropoffLocation ?
                      (dropoffLocations || []).find(loc => loc.locationId === dropoffLocation)?.name || 'Vị trí không xác định' :
                      'Chưa chọn điểm trả'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <label className="text-gray-700 font-medium">Mã giảm giá (nếu có)</label>
              </div>
              
              {coupon ? (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-green-700">{coupon.code}</span>
                      <p className="text-sm text-green-600">
                        {coupon.discountPercentage !== undefined && coupon.discountPercentage !== null
                          ? `Giảm ${coupon.discountPercentage}% ${coupon.maxDiscountAmount ? `(tối đa ${formatCurrency(coupon.maxDiscountAmount)})` : ''}`
                          : coupon.discountFixed !== undefined && coupon.discountFixed !== null
                            ? `Giảm ${formatCurrency(coupon.discountFixed)}`
                            : coupon.discountType === 'PERCENTAGE' 
                              ? `Giảm ${coupon.discountValue}% (tối đa ${formatCurrency(coupon.maxDiscountAmount)})` 
                              : `Giảm ${formatCurrency(coupon.discountValue)}`}
                      </p>
                    </div>
                    <button 
                      onClick={handleClearCoupon}
                      className="text-red-500 hover:text-red-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <input
                    type="text"
                    className="flex-grow p-3 border rounded-l-lg focus:ring-2 focus:ring-blue-500 transition-all"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Nhập mã giảm giá của bạn"
                    disabled={validatingCoupon}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className={`px-4 py-3 rounded-r-lg font-medium text-white 
                      ${validatingCoupon || !couponCode.trim() 
                        ? 'bg-gray-400' 
                        : 'bg-blue-500 hover:bg-blue-600'}`}
                  >
                    {validatingCoupon ? 'Đang xử lý...' : 'Áp dụng'}
                  </button>
                </div>
              )}
              
              {couponError && (
                <p className="mt-2 text-red-500 text-sm">{couponError}</p>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-700 mb-3">Chi tiết thanh toán</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá vé x {selectedSeats.length}</span>
                  <span>{formatCurrency(selectedBus.pricePerSeat * selectedSeats.length)}</span>
                </div>
                
                {coupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatCurrency(Math.abs(calculateTotalFare() - (selectedBus.pricePerSeat * selectedSeats.length)))}</span>
                  </div>
                )}
                
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Tổng thanh toán</span>
                  <span className="text-blue-600">{formatCurrency(calculateTotalFare())}</span>
                </div>
              </div>
            </div>

            <button
              className={`w-full px-6 py-3 rounded-lg font-bold text-white shadow-lg
                transition-all duration-300 transform hover:scale-105
                focus:outline-none focus:ring-4 focus:ring-opacity-50
                ${(!pickupLocation || !dropoffLocation)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 focus:ring-blue-500'
                }`}
              onClick={handleBooking}
              disabled={!pickupLocation || !dropoffLocation}
            >
              {!pickupLocation || !dropoffLocation
                ? 'Vui lòng chọn điểm đón/trả'
                : 'Xác nhận đặt vé'
              }
            </button>
          </div>
        )}

        <button
          className="mt-6 w-full bg-red-500 text-white px-6 py-3 rounded-lg font-bold
            transform transition-all duration-300 hover:bg-red-600 hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          onClick={handleCloseDetails}
        >
          Đóng
        </button>
      </div>
      
      {showChat && (
        <ChatInterface
          bus={selectedBus}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default BusDetails;