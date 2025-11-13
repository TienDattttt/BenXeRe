import React from 'react';

const TripDetails = ({ tripInfo, couponInfo }) => {
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  return (
    <div className="space-y-4">
      {/* Trip Image with Gradient Overlay */}
      <div className="relative rounded-lg overflow-hidden">
        <img
          src={tripInfo.image || '/benxeso.webp'}
          alt={tripInfo.operator || "Chuyến đi"}
          className="w-full h-44 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <div className="p-4 text-white">
            <h3 className="font-bold text-xl">{tripInfo.operator}</h3>
            <div className="flex items-center text-sm opacity-90">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {tripInfo.departureTime}
            </div>
          </div>
        </div>
      </div>
      
      {/* Trip Details with Icons */}
      <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center">
          <div className="bg-blue-50 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Nhà xe</div>
            <div className="font-medium">{tripInfo.operator || "Không có thông tin"}</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-green-50 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Điểm đón</div>
            <div className="font-medium">{tripInfo.pickup || "Không có thông tin"}</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-red-50 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Điểm đến</div>
            <div className="font-medium">{tripInfo.dropoff || "Không có thông tin"}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center">
            <div className="bg-yellow-50 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500">Khởi hành</div>
              <div className="font-medium">{tripInfo.departureTime || "Chưa xác định"}</div>
            </div>
          </div>
        </div>
        
        {/* Seats Information */}
        {tripInfo.seats && tripInfo.seats.length > 0 && (
          <div className="mt-2 pt-3 border-t border-gray-100">
            <div className="text-sm text-gray-500 mb-2">Ghế đã chọn ({tripInfo.seats.length})</div>
            <div className="flex flex-wrap gap-2">
              {tripInfo.seats.map(seat => (
                <span key={seat.id || seat.number} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                  {seat.number}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Payment Details Card */}
      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2" />
          </svg>
          Chi tiết thanh toán
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-gray-600">Giá vé x {tripInfo.seats?.length || 0}</div>
            <div>{formatCurrency(tripInfo.originalFare)}</div>
          </div>
          
          {couponInfo && couponInfo.code && (
            <div className="flex justify-between items-center text-green-600">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>Giảm giá ({couponInfo.code})</span>
              </div>
              <span>-{formatCurrency(Math.abs(couponInfo.discountAmount || 0))}</span>
            </div>
          )}
          
          <div className="pt-2 mt-1 border-t border-gray-100 flex justify-between items-center">
            <div className="font-semibold text-gray-800">Tổng thanh toán</div>
            <div className="font-bold text-lg text-blue-600">{formatCurrency(tripInfo.totalFare)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;