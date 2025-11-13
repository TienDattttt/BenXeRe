import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import Typography from './core/typography';
import './seat-selector.css';

const SEAT_STATUS = {
  AVAILABLE: 'available',
  SELECTED: 'selected',
  BOOKED: 'booked',
  UNAVAILABLE: 'unavailable',
};

const seatStatusClasses = {
  [SEAT_STATUS.AVAILABLE]: `
    seat-available seat-hover
    border-gray-300 hover:border-blue-400 
    cursor-pointer shadow-sm hover:shadow-md
  `,
  [SEAT_STATUS.SELECTED]: `
    seat-selected seat-pulse
    border-blue-600 shadow-lg
    ring-2 ring-blue-300 ring-opacity-50
  `,
  [SEAT_STATUS.BOOKED]: `
    bg-red-100 border-red-300
    cursor-not-allowed opacity-75
  `,
  [SEAT_STATUS.UNAVAILABLE]: `
    bg-gray-200 border-gray-300
    cursor-not-allowed opacity-50
  `,
};

const SeatIcon = ({ isSelected, isBooked }) => (
  <div className={`
    relative w-full h-full flex flex-col items-center justify-center
    transition-all duration-300 ease-out
    ${isBooked ? 'opacity-75' : ''}
    ${isSelected ? 'seat-glow' : ''}
  `}>
    <div className={`
      w-10 h-6 rounded-t-lg 
      ${isSelected ? 'bg-blue-600' : isBooked ? 'bg-red-400' : 'bg-gray-600'}
      transform-gpu transition-transform duration-300
    `}></div>
    <div className={`
      w-12 h-8 rounded-b-lg 
      ${isSelected ? 'bg-blue-500' : isBooked ? 'bg-red-300' : 'bg-gray-500'}
      shadow-inner
    `}></div>
    {isBooked && (
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500 opacity-75" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
    )}
  </div>
);

const BusLayout = () => (
  <div className="relative w-full h-20 mb-8 bus-layout">
    <div className="absolute inset-0 bg-gray-800 rounded-t-3xl">
      <div className="flex justify-around px-4 pt-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-12 h-6 rounded-t-lg bus-window"
          />
        ))}
      </div>
    </div>
    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2
      w-24 h-8 bg-blue-400 rounded-t-full opacity-50" />
  </div>
);

const SeatLegend = () => (
  <div className="flex items-center justify-center gap-6 mt-6 p-4 rounded-xl bg-white shadow-lg">
    {Object.entries(SEAT_STATUS).map(([key, value]) => (
      <div key={key} className="legend-item flex items-center gap-3 p-2 rounded-lg">
        <div className={twMerge(
          'w-10 h-12 rounded-lg border-2 transition-all duration-300',
          seatStatusClasses[value]
        )}>
          <SeatIcon 
            isSelected={value === SEAT_STATUS.SELECTED}
            isBooked={value === SEAT_STATUS.BOOKED}
          />
        </div>
        <Typography variant="caption" className="capitalize whitespace-nowrap">
          {key.toLowerCase().replace('_', ' ')}
        </Typography>
      </div>
    ))}
  </div>
);

const Seat = ({
  id,
  status = SEAT_STATUS.AVAILABLE,
  selected = false,
  onClick,
  seatNumber,
  price,
  className = '',
  booked = false,
  isCompact = false,
}) => {
  const isBooked = booked;
  const currentStatus = isBooked ? SEAT_STATUS.BOOKED :
                       selected ? SEAT_STATUS.SELECTED :
                       status;
  
  // Adjust sizes for compact layout
  const sizeClasses = isCompact 
    ? 'w-10 h-12' // Smaller seat for 45-seat bus
    : 'w-14 h-16'; // Default size

  return (
    <button
      type="button"
      disabled={isBooked}
      onClick={() => !isBooked && onClick?.(id)}
      className={twMerge(
        `group relative ${sizeClasses} rounded-lg border-2 
         transition-all duration-300 ease-out`,
        seatStatusClasses[currentStatus],
        className
      )}
      aria-label={`Ghế số ${seatNumber}`}
      title={`Ghế số ${seatNumber}${isBooked ? ' - Đã được đặt' : ''}`}
    >
      <SeatIcon isSelected={selected} isBooked={isBooked} />
      
      {!isBooked && (
        <>
          <div className={`
            absolute -bottom-6 left-1/2 transform -translate-x-1/2
            px-2 py-1 rounded-full text-xs font-medium
            transition-all duration-300
            ${selected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}
            opacity-0 group-hover:opacity-100
          `}>
            {seatNumber}
          </div>

          {price && (
            <div className={`
              price-tag absolute -right-2 -top-2 
              px-2 py-1 rounded-full text-xs font-bold
              opacity-0 group-hover:opacity-100
              ${selected ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}
            `}>
              {price.toLocaleString()}đ
            </div>
          )}
        </>
      )}
    </button>
  );
};

const SeatSelector = ({
  layout = [],
  selectedSeats = [],
  maxSelections = 5,
  onSeatSelect,
  className = '',
}) => {
  const [internalSelected, setInternalSelected] = useState(selectedSeats);
  const [showAlert, setShowAlert] = useState(false);
  
  // Count actual seats (not nulls or indicators)
  const seatCount = layout.flat().filter(seat => seat && seat.id && typeof seat.id === 'number').length;
  
  // Determine if this is a large capacity bus (more than 35 seats)
  const isLargeCapacity = seatCount > 35;
  
  // Determine if this is a small car (7 seats or less)
  const isSmallCar = seatCount <= 7;

  useEffect(() => {
    setInternalSelected(selectedSeats);
  }, [selectedSeats]);
  
  const handleSeatClick = (seatId) => {
    // Find the seat in the layout
    const seat = layout.flat().find(s => s && s.id === seatId);
    
    // If seat is booked, don't allow selection
    if (seat && seat.booked) {
      return;
    }

    const isSelected = internalSelected.includes(seatId);
    let newSelected;

    if (isSelected) {
      newSelected = internalSelected.filter((id) => id !== seatId);
    } else if (internalSelected.length < maxSelections) {
      newSelected = [...internalSelected, seatId];
    } else {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    setInternalSelected(newSelected);
    onSeatSelect?.(newSelected);
  };

  // Find indices that might contain level indicators or level transitions
  const isLevelIndicator = (seat) => seat && typeof seat.number === 'string' && 
    (seat.number.toLowerCase().includes('tầng') || seat.type === 'level-indicator');
  
  // For small cars, don't split the layout
  let lowerFloor = layout;
  let upperFloor = [];
  
  // Only apply floor splitting for larger vehicles
  if (!isSmallCar) {
    // Find the midpoint between lower and upper floors
    let midPoint = 0;
    for (let i = 0; i < layout.length; i++) {
      if (layout[i].some(seat => isLevelIndicator(seat) && 
          (seat.number.toLowerCase().includes('tầng trên') || 
           (seat.id && seat.id.includes('level-upper'))))) {
        midPoint = i;
        break;
      }
    }
    
    // If no level indicator found, just split in the middle
    if (midPoint === 0 && layout.length > 1) {
      midPoint = Math.ceil(layout.length / 2);
    }
    
    // Split layout into lower and upper floors
    lowerFloor = layout.slice(0, midPoint);
    upperFloor = layout.slice(midPoint);
  }

  // Render small car layout in a single column
  if (isSmallCar) {
    return (
      <div className={twMerge('w-full max-w-md mx-auto', className)}>
        <div className="relative bg-white rounded-xl shadow-xl p-8 mb-8">
          <BusLayout />

          {showAlert && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 
              bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium
              animate-bounce z-50">
              Bạn chỉ có thể chọn tối đa {maxSelections} ghế!
            </div>
          )}
          
          <div className="flex flex-col items-center gap-y-6 pt-4">
            {layout
              .filter(row => !row.some(seat => isLevelIndicator(seat)))
              .map((row, rowIndex) => {
                const rowSeatCount = row.filter(seat => seat !== null).length;
                
                return (
                  <div
                    key={rowIndex}
                    className={`seat-container flex items-center justify-center gap-x-3`}
                    style={{
                      animationDelay: `${rowIndex * 100}ms`
                    }}
                  >
                    {row.map((seat, seatIndex) => {
                      if (seat === null) return (
                        <div key={seatIndex} className="w-10 h-16" />
                      );
                      
                      return (
                        <Seat
                          key={seat.id}
                          id={seat.id}
                          status={SEAT_STATUS.AVAILABLE}
                          selected={internalSelected.includes(seat.id)}
                          onClick={handleSeatClick}
                          seatNumber={seat.number}
                          price={seat.price}
                          booked={seat.booked}
                          className="mx-1"
                        />
                      );
                    })}
                  </div>
                );
              })}
          </div>
        </div>

        {maxSelections > 0 && (
          <div className={`
            bg-gradient-to-r from-blue-50 to-indigo-50 
            border border-blue-100 rounded-lg p-4 mb-6
            transform transition-all duration-300
            ${internalSelected.length > 0 ? 'scale-105' : 'scale-100'}
          `}>
            <Typography variant="body2" className="text-center text-blue-700">
              Bạn có thể chọn tối đa {maxSelections} ghế
              {internalSelected.length > 0 && ` (Đã chọn ${internalSelected.length} ghế)`}
            </Typography>
          </div>
        )}

        <SeatLegend />
      </div>
    );
  }
  
  // Regular bus layout with double floors
  return (
    <div className={twMerge('w-full max-w-4xl mx-auto', className)}>
      <div className="relative bg-white rounded-xl shadow-xl p-8 mb-8">
        <BusLayout />

        {showAlert && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 
            bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium
            animate-bounce z-50">
            Bạn chỉ có thể chọn tối đa {maxSelections} ghế!
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-x-8 pt-4">
          {/* Left side - Lower Floor */}
          <div className="flex flex-col gap-y-6">
            <div className="flex justify-center mb-2">
              <div className="h-1 w-1/2 rounded-full bg-gray-400 relative">
                <span className="absolute -top-6 text-sm font-medium text-gray-600">
                  Tầng dưới
                </span>
              </div>
            </div>
            {lowerFloor
              .filter(row => !row.some(seat => isLevelIndicator(seat)))
              .map((row, rowIndex) => {
                // Determine if this is a 2-seat layout (for 24-seat buses)
                const isTwoSeatLayout = row.filter(seat => seat !== null).length <= 2;
                
                // Determine the gap size based on vehicle type and capacity
                const gapClass = isLargeCapacity ? 'gap-x-2' : 
                                 isTwoSeatLayout ? 'gap-x-6' : 'gap-x-4';
                
                return (
                  <div
                    key={rowIndex}
                    className={`seat-container flex items-center justify-center ${gapClass}`}
                    style={{
                      animationDelay: `${rowIndex * 100}ms`
                    }}
                  >
                    {row.map((seat, seatIndex) => {
                      if (seat === null) return (
                        <div key={seatIndex} className={isLargeCapacity ? "w-6 h-12" : "w-10 h-16"} />
                      );
                      
                      // Adjust spacing based on layout
                      const spacingClass = isLargeCapacity ? 'mx-1' : 
                                         isTwoSeatLayout ? 'mx-4' : 'mx-2';
                      
                      return (
                        <Seat
                          key={seat.id}
                          id={seat.id}
                          status={SEAT_STATUS.AVAILABLE}
                          selected={internalSelected.includes(seat.id)}
                          onClick={handleSeatClick}
                          seatNumber={seat.number}
                          price={seat.price}
                          booked={seat.booked}
                          className={spacingClass}
                          isCompact={isLargeCapacity}
                        />
                      );
                    })}
                  </div>
                );
              })}
          </div>
          
          {/* Right side - Upper Floor */}
          <div className="flex flex-col gap-y-6">
            <div className="flex justify-center mb-2">
              <div className="h-1 w-1/2 rounded-full bg-blue-400 relative">
                <span className="absolute -top-6 text-sm font-medium text-blue-600">
                  Tầng trên
                </span>
              </div>
            </div>
            {upperFloor
              .filter(row => !row.some(seat => isLevelIndicator(seat)))
              .map((row, rowIndex) => {
                // Determine if this is a 2-seat layout (for 24-seat buses)
                const isTwoSeatLayout = row.filter(seat => seat !== null).length <= 2;
                
                // Determine the gap size based on vehicle type and capacity
                const gapClass = isLargeCapacity ? 'gap-x-2' : 
                                 isTwoSeatLayout ? 'gap-x-6' : 'gap-x-4';
                
                return (
                  <div
                    key={rowIndex + lowerFloor.length}
                    className={`seat-container flex items-center justify-center ${gapClass}`}
                    style={{
                      animationDelay: `${(rowIndex + lowerFloor.length) * 100}ms`
                    }}
                  >
                    {row.map((seat, seatIndex) => {
                      if (seat === null) return (
                        <div key={seatIndex} className={isLargeCapacity ? "w-6 h-12" : "w-10 h-16"} />
                      );
                      
                      // Adjust spacing based on layout
                      const spacingClass = isLargeCapacity ? 'mx-1' : 
                                         isTwoSeatLayout ? 'mx-4' : 'mx-2';
                      
                      return (
                        <Seat
                          key={seat.id}
                          id={seat.id}
                          status={SEAT_STATUS.AVAILABLE}
                          selected={internalSelected.includes(seat.id)}
                          onClick={handleSeatClick}
                          seatNumber={seat.number}
                          price={seat.price}
                          booked={seat.booked}
                          className={spacingClass}
                          isCompact={isLargeCapacity}
                        />
                      );
                    })}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {maxSelections > 0 && (
        <div className={`
          bg-gradient-to-r from-blue-50 to-indigo-50 
          border border-blue-100 rounded-lg p-4 mb-6
          transform transition-all duration-300
          ${internalSelected.length > 0 ? 'scale-105' : 'scale-100'}
        `}>
          <Typography variant="body2" className="text-center text-blue-700">
            Bạn có thể chọn tối đa {maxSelections} ghế
            {internalSelected.length > 0 && ` (Đã chọn ${internalSelected.length} ghế)`}
          </Typography>
        </div>
      )}

      <SeatLegend />
    </div>
  );
};

export default SeatSelector;