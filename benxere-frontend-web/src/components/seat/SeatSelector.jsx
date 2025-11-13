import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import Typography from '../core/typography';

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

const SeatSVG = ({ status }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-8 h-8 ${status === SEAT_STATUS.SELECTED ? 'text-white' : 'text-gray-600'}`}
    fill="currentColor"
  >
    <path d="M4 18v3h3v-3h10v3h3v-6H4v3zm15-8h3v3h-3v-3zM2 10h3v3H2v-3zm15 3H7V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v8z"/>
  </svg>
);

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

const Seat = ({
  id,
  status = SEAT_STATUS.AVAILABLE,
  selected = false,
  onClick,
  seatNumber,
  price,
  className = '',
}) => {
  const isDisabled = [SEAT_STATUS.RESERVED, SEAT_STATUS.UNAVAILABLE].includes(status);
  const currentStatus = selected ? SEAT_STATUS.SELECTED : status;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => !isDisabled && onClick?.(id)}
      className={twMerge(
        'relative w-14 h-14 rounded-lg border-2 transition-all duration-300 group',
        seatStatusClasses[currentStatus],
        className
      )}
      aria-label={`Seat ${seatNumber}`}
      title={`Seat ${seatNumber}${isDisabled ? ' - Not available' : ''}`}
    >
      <div className="flex flex-col items-center justify-center">
        <SeatSVG status={currentStatus} />
        <Typography
          variant="caption"
          className={twMerge(
            'absolute -bottom-6 transition-opacity duration-300 opacity-0 group-hover:opacity-100',
            selected ? 'text-blue-600' : 'text-gray-700'
          )}
        >
          {seatNumber}
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
    const isSelected = internalSelected.includes(seatId);
    let newSelected;

    if (isSelected) {
      newSelected = internalSelected.filter((id) => id !== seatId);
    } else if (internalSelected.length < maxSelections) {
      newSelected = [...internalSelected, seatId];
    } else {
      alert(`You can only select up to ${maxSelections} seats`);
      return;
    }

    setInternalSelected(newSelected);
    onSeatSelect?.(newSelected);
  };

  return (
    <div className={twMerge('w-full max-w-4xl mx-auto', className)}>
      <div className="relative bg-white rounded-xl shadow-lg p-8 mb-8">
        {/* Bus Frame */}
        <div className="absolute inset-0 border-4 border-gray-300 rounded-xl">
          {/* Bus Front */}
          <div className="absolute -left-6 inset-y-0 w-6 bg-gray-300 rounded-l-xl flex items-center justify-center">
            <SteeringWheel />
          </div>
          {/* Bus Windows */}
          <div className="absolute top-0 left-8 right-8 flex justify-around">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-12 h-4 bg-blue-200 rounded-b-lg transform hover:translate-y-1 transition-transform duration-300"
              />
            ))}
          </div>
        </div>

        {/* Seats Grid */}
        <div className="grid gap-8 pt-8">
          {layout.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-center justify-center gap-6 animate-fade-in"
              style={{ animationDelay: `${rowIndex * 100}ms` }}
            >
              {row.map((seat, seatIndex) => {
                if (seat === null) return <div key={seatIndex} className="w-14 h-14" />;
                
                return (
                  <Seat
                    key={seat.id}
                    id={seat.id}
                    status={getSeatStatus(seat.id)}
                    selected={internalSelected.includes(seat.id)}
                    onClick={handleSeatClick}
                    seatNumber={seat.number}
                    price={seat.price}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {maxSelections > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <Typography variant="body2" className="text-center text-blue-700">
            Bạn có thể chọn tối đa {maxSelections} ghế
            {internalSelected.length > 0 && ` (Đã chọn ${internalSelected.length})`}
          </Typography>
        </div>
      )}

      <SeatLegend />
    </div>
  );
};

export default SeatSelector;