import React, { useEffect, useState } from "react";
import BusDetails from "./BusDetails";
import { loadLocations } from "../utils/load-location";
import LoadingAnimation from "./loading-animation";
import Skeleton from "react-loading-skeleton";
import { getBusImageUrl } from "../constants/common";
import { getRatingsByBus } from "../services/rating-service";

const locations = loadLocations();

const getLocationName = (code) => {
  const location = locations.find((loc) => loc.value === code);
  return location ? location.label : code;
};

const calculateDuration = (departureTime, arrivalTime) => {
  const start = new Date(departureTime);
  const end = new Date(arrivalTime);
  const diff = end - start;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

const SortIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
  </svg>
);

const SeatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const Results = ({
  results,
  selectedBus,
  handleDetailClick,
  handleShowSeats,
  handleSectionClick,
  handleCloseDetails,
  showSeats,
  activeSection,
  pickupLocations,
  dropoffLocations,
  loading,
}) => {
  const [sortBy, setSortBy] = useState('time');
  const [sortOrder, setSortOrder] = useState('asc');
  const [busRatings, setBusRatings] = useState({});
  const [loadingRatings, setLoadingRatings] = useState({});

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'time') {
      return sortOrder === 'asc'
        ? new Date(a.departureTime) - new Date(b.departureTime)
        : new Date(b.departureTime) - new Date(a.departureTime);
    } else if (sortBy === 'price') {
      return sortOrder === 'asc'
        ? a.pricePerSeat - b.pricePerSeat
        : b.pricePerSeat - a.pricePerSeat;
    }
    return 0;
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  useEffect(() => {
    const resultElements = document.querySelectorAll('.result-item');
    resultElements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('animate-slide-in');
      }, index * 150);
    });
  }, [results]);

  // Fetch ratings for each bus in the results
  useEffect(() => {
    const fetchRatings = async () => {
      const newBusRatings = {};
      const newLoadingRatings = {};

      // Get unique bus IDs to avoid duplicate requests
      const uniqueBusIds = [...new Set(results.map(result => result.bus.busId))];
      
      for (const busId of uniqueBusIds) {
        if (!busRatings[busId]) {
          newLoadingRatings[busId] = true;
          try {
            const ratingData = await getRatingsByBus(busId, 0, 5);
            newBusRatings[busId] = ratingData;
          } catch (error) {
            console.error(`Error fetching ratings for bus ${busId}:`, error);
            newBusRatings[busId] = { averageRating: 0, totalRatings: 0 };
          } finally {
            newLoadingRatings[busId] = false;
          }
        }
      }

      if (Object.keys(newBusRatings).length > 0) {
        setBusRatings(prev => ({ ...prev, ...newBusRatings }));
        setLoadingRatings(prev => ({ ...prev, ...newLoadingRatings }));
      }
    };

    if (results.length > 0) {
      fetchRatings();
    }
  }, [results, busRatings]);

  if (loading) {
    return (
      <div className="w-3/4 pl-8">
        <LoadingAnimation />
        <Skeleton />
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="w-3/4 pl-8">
        <div className="text-center p-8 bg-white rounded-lg shadow-md animate-fade-in">
          <div className="mb-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 animate-bounce-bus">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H6.663a2.056 2.056 0 00-1.58.86 17.902 17.902 0 00-3.213 9.193c-.04.62.469 1.124 1.09 1.124H3.75m17.25 0h.008v.008H21v-.008z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có chuyến xe nào</h3>
          <p className="text-gray-500">Vui lòng nhập điểm đi, điểm đến và ngày để bắt đầu tìm kiếm</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-3/4 pl-8">
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              {results.length} chuyến xe
            </span>
            <span className="text-gray-500">|</span>
            <div className="flex items-center gap-2 text-gray-600">
              <MapIcon />
              <span>{getLocationName(results[0].route.origin)} - {getLocationName(results[0].route.destination)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => toggleSort('time')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300
                ${sortBy === 'time' ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-200' : 'bg-gray-50 text-gray-600'}
                hover:bg-blue-50`}
            >
              <ClockIcon />
              <span className="text-sm font-medium">Thời gian {sortBy === 'time' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
            </button>
            <button
              onClick={() => toggleSort('price')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300
                ${sortBy === 'price' ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-200' : 'bg-gray-50 text-gray-600'}
                hover:bg-blue-50`}
            >
              <SortIcon />
              <span className="text-sm font-medium">Giá vé {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
            </button>
          </div>
        </div>
      </div>

      {sortedResults.map((result, index) => (
        <div
          key={result.scheduleId}
          className="result-item bg-white shadow-md rounded-lg mb-6 opacity-0 transform translate-y-4
            transition-all duration-500 ease-out hover:shadow-xl hover:-translate-y-1 cursor-pointer group"
          style={{
            animationDelay: `${index * 150}ms`,
            '--index': index,
          }}
        >
          <div className="relative flex hover:shadow-lg transition-shadow duration-300">
            <div className="relative overflow-hidden h-32 w-32 group">
              <img
                src={getBusImageUrl(result.bus.images && result.bus.images.length > 0 
                  ? result.bus.images[0].imageUrl
                  : null)}
                alt={`${result.bus.busNumber}`}
                className="h-32 w-32 rounded-lg object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/default-bus.jpg';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white text-sm font-medium">Xem thêm ảnh</span>
              </div>
            </div>

            <div className="p-4 flex-1">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span>{result.bus.companyName}</span>
                  <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {result.bus.type}
                  </span>
                </h4>
                <span className="text-red-500 font-bold animate-pulse-price">
                  {result.pricePerSeat.toLocaleString()} VND
                </span>
              </div>

              {/* Rating Stars - NEW */}
              <div className="flex items-center mb-2">
                {loadingRatings[result.bus.busId] ? (
                  <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(busRatings[result.bus.busId]?.averageRating || 0) 
                              ? 'text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {busRatings[result.bus.busId]?.averageRating ? 
                        (busRatings[result.bus.busId].averageRating).toFixed(1) : 
                        "Chưa có đánh giá"}
                    </span>
                    {busRatings[result.bus.busId]?.totalRatings > 0 && (
                      <span className="text-gray-500 text-xs ml-1">
                        ({busRatings[result.bus.busId].totalRatings} đánh giá)
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapIcon />
                <span className="font-medium">{getLocationName(result.route.origin)} → {getLocationName(result.route.destination)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <ClockIcon />
                  <div>
                    <div className="font-medium">{new Date(result.departureTime).toLocaleTimeString()}</div>
                    <div className="text-sm">{new Date(result.departureTime).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <SeatIcon />
                  <div>
                    <div className="font-medium">Còn {result.bus.totalSeats} chỗ</div>
                    <div className="text-sm">{calculateDuration(result.departureTime, result.arrivalTime)}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg
                    transition-all duration-300 transform hover:scale-105
                    hover:shadow-lg hover:ring-2 hover:ring-yellow-300 hover:ring-opacity-50
                    flex items-center justify-center gap-2"
                  onClick={() => handleDetailClick(result)}
                >
                  <span>Thông tin chi tiết</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg
                    transition-all duration-300 transform hover:scale-105
                    hover:shadow-lg hover:ring-2 hover:ring-yellow-300 hover:ring-opacity-50
                    flex items-center gap-2"
                  onClick={handleShowSeats}
                >
                  <span>Đặt vé</span>
                </button>
              </div>
            </div>
          </div>

          {selectedBus && selectedBus.busId === result.bus.busId && (
            <div className="animate-fade-in">
              <BusDetails
                selectedBus={{
                  ...selectedBus,
                  pricePerSeat: result.pricePerSeat,
                  route: result.route,
                  scheduleId: result.scheduleId,
                  departureTime: result.departureTime,
                }}
                handleSectionClick={handleSectionClick}
                handleShowSeats={handleShowSeats}
                handleCloseDetails={handleCloseDetails}
                showSeats={showSeats}
                activeSection={activeSection}
                pickupLocations={pickupLocations}
                dropoffLocations={dropoffLocations}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Results;