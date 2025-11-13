import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import Typography from './core/typography';

const SEAT_STATUS = {
  AVAILABLE: 'available',
  SELECTED: 'selected',
  RESERVED: 'reserved',
  UNAVAILABLE: 'unavailable',
};

const seatStatusClasses = {
  [SEAT_STATUS.AVAILABLE]: 'bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-400 cursor-pointer transform hover:scale-105',
  [SEAT_STATUS.SELECTED]: 'bg-blue-500 text-white border-blue-600 transform scale-105 shadow-lg',
  [SEAT_STATUS.RESERVED]: 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50',
  [SEAT_STATUS.UNAVAILABLE]: 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-50',
};

const SeatSVG = ({ status, type = 'seat' }) => {
  if (type === 'bed') {
    return (
      <svg
        viewBox="0 0 24 24"
        className={`w-8 h-8 ${status === SEAT_STATUS.SELECTED ? 'text-white' : 'text-gray-600'}`}
        fill="currentColor"
      >
        <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-8 h-8 ${status === SEAT_STATUS.SELECTED ? 'text-white' : 'text-gray-600'}`}
      fill="currentColor"
    >
      <path d="M4 18v3h3v-3h10v3h3v-6H4v3zm15-8h3v3h-3v-3zM2 10h3v3H2v-3zm15 3H7V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v8z"/>
    </svg>
  );
};

const SteeringWheel = () => (
  <div className="w-20 h-20 rounded-full bg-gray-100 border-4 border-gray-300 flex items-center justify-center transform rotate-45 transition-transform duration-300 hover:rotate-90">
    <svg viewBox="0 0 24 24" className="w-12 h-12 text-gray-600">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
      />
    </svg>
  </div>
);

const SeatLegend = () => (
  <div className="flex items-center justify-center gap-6 mt-6 bg-white p-4 rounded-lg shadow-md">
    {Object.entries(SEAT_STATUS).map(([key, value]) => (
      <div key={key} className="flex items-center gap-2 transform hover:scale-105 transition-transform duration-300">
        <div className={twMerge(
          'w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all duration-300',
          seatStatusClasses[value]
        )}>
          <SeatSVG status={value} />
        </div>
        <Typography variant="caption" className="capitalize">
          {key.toLowerCase()}
        </Typography>
      </div>
    ))}
  </div>
);

const LevelIndicator = ({ level }) => (
  <div className="w-full py-4 flex items-center justify-center cursor-not-allowed">
    <div className={`h-1 w-full rounded-full ${level === 'upper' ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
  </div>
);

const Seat = ({
  id,
  status = SEAT_STATUS.AVAILABLE,
  selected = false,
  onClick,
  seatNumber,
  price,
  type = 'seat',
  isDriver = false,
  isFrontPassenger = false,
  unavailable = false,
  className = '',
}) => {
  if (type === 'level-indicator') {
    return <LevelIndicator level={id.split('-')[1]} />;
  }

  const isDisabled = [SEAT_STATUS.RESERVED, SEAT_STATUS.UNAVAILABLE].includes(status) || unavailable;
  const currentStatus = selected ? SEAT_STATUS.SELECTED : status;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => !isDisabled && onClick?.(id)}
      className={twMerge(
        'relative w-14 h-14 rounded-lg border-2 transition-all duration-300 group mx-8',
        seatStatusClasses[currentStatus],
        type === 'bed' ? 'bg-gray-50' : '',
        isDisabled ? 'opacity-50 cursor-not-allowed' : '',
        className
      )}
      aria-label={`${type === 'bed' ? 'Giường' : 'Ghế'} ${seatNumber}${isDriver ? ' (Tài xế)' : isFrontPassenger ? ' (Ghế phụ)' : ''}`}
      title={`${type === 'bed' ? 'Giường' : 'Ghế'} ${seatNumber}${isDriver ? ' (Tài xế)' : isFrontPassenger ? ' (Ghế phụ)' : ''}${isDisabled ? ' - Không khả dụng' : ''}`}
    >
      <div className="flex flex-col items-center justify-center">
        <SeatSVG status={currentStatus} type={type} />
        <Typography
          variant="caption"
          className={twMerge(
            'absolute -bottom-6 transition-opacity duration-300 opacity-0 group-hover:opacity-100',
            selected ? 'text-blue-600' : 'text-gray-700'
          )}
        >
          {seatNumber}
          {isDriver && ' (TX)'}
          {isFrontPassenger && ' (GP)'}
        </Typography>
        {price && (
          <div className={twMerge(
            'absolute -right-2 -top-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full transform scale-0 transition-transform duration-300 group-hover:scale-100',
            selected ? 'bg-blue-200' : ''
          )}>
            {price.toLocaleString()}đ
          </div>
        )}
      </div>
    </button>
  );
};

const SeatSelector = ({
  layout = [],
  selectedSeats = [],
  reservedSeats = [],
  unavailableSeats = [],
  maxSelections = 5,
  onSeatSelect,
  className = '',
}) => {
  const [internalSelected, setInternalSelected] = useState(selectedSeats);

  useEffect(() => {
    setInternalSelected(selectedSeats);
  }, [selectedSeats]);

  const getSeatStatus = (seatId) => {
    if (reservedSeats.includes(seatId)) return SEAT_STATUS.RESERVED;
    if (unavailableSeats.includes(seatId)) return SEAT_STATUS.UNAVAILABLE;
    if (internalSelected.includes(seatId)) return SEAT_STATUS.SELECTED;
    return SEAT_STATUS.AVAILABLE;
  };

  const handleSeatClick = (seatId) => {
    // Prevent selection of level indicators
    if (seatId.startsWith('level-')) return;

    const isSelected = internalSelected.includes(seatId);
    let newSelected;

    if (isSelected) {
      newSelected = internalSelected.filter((id) => id !== seatId);
    } else if (internalSelected.length < maxSelections) {
      newSelected = [...internalSelected, seatId];
    } else {
      alert(`Bạn chỉ có thể chọn tối đa ${maxSelections} ${layout[0]?.[0]?.type === 'bed' ? 'giường' : 'ghế'}`);
      return;
    }

    setInternalSelected(newSelected);
    onSeatSelect?.(newSelected);
  };

  // Split layout into lower and upper floors
  const lowerFloor = layout.filter(row => 
    row.some(seat => seat && seat.type === 'level-indicator' && seat.id === 'level-lower')
  );
  const upperFloor = layout.filter(row => 
    row.some(seat => seat && seat.type === 'level-indicator' && seat.id === 'level-upper')
  );

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
                const seatCount = row.filter(seat => seat !== null).length;
                return (
                  <div
                    key={rowIndex}
                    className={
                      seatCount === 2
                        ? 'flex items-center justify-center gap-x-16 w-full'
                        : 'flex items-center justify-evenly w-full'
                    }
                    style={{ animationDelay: `${rowIndex * 100}ms` }}
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
                const seatCount = row.filter(seat => seat !== null).length;
                return (
                  <div
                    key={rowIndex + lowerFloor.length}
                    className={
                      seatCount === 2
                        ? 'flex items-center justify-center gap-x-16 w-full'
                        : 'flex items-center justify-evenly w-full'
                    }
                    style={{ animationDelay: `${(rowIndex + lowerFloor.length) * 100}ms` }}
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
                        />
                      );
                    })}
                  </div>
                );
              })}
          </div>
        </div>
        {/* Dashed separator between floors */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full border-l-2 border-dashed border-gray-400 pointer-events-none"></div>
      </div>

      {maxSelections > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <Typography variant="body2" className="text-center text-blue-700">
            Bạn có thể chọn tối đa {maxSelections} {layout[0]?.[0]?.type === 'bed' ? 'giường' : 'ghế'}
            {internalSelected.length > 0 && ` (Đã chọn ${internalSelected.length})`}
          </Typography>
        </div>
      )}

      <SeatLegend />
    </div>
  );
};

export default SeatSelector;