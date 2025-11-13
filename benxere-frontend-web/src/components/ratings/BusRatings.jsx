import React, { useState } from 'react';
import HistoricalRatings, { RatingTypes } from './HistoricalRatings';

/**
 * Component for displaying ratings for a specific bus
 * @param {Object} props
 * @param {number} props.busId - ID of the bus
 * @param {string} props.busNumber - Bus number or name (for display purposes)
 */
const BusRatings = ({ busId, busNumber }) => {
  const [error, setError] = useState(null);

  // Handle error case
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <p>{error}</p>
      </div>
    );
  }

  // Handle missing busId
  if (!busId) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
        <p>Vui lòng cung cấp ID xe để xem đánh giá.</p>
      </div>
    );
  }

  return (
    <div className="bus-ratings">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
        Đánh giá về Xe {busNumber || `#${busId}`}
      </h2>
      
      <div className="error-boundary">
        <HistoricalRatings 
          type={RatingTypes.BUS} 
          identifier={busId} 
        />
      </div>
    </div>
  );
};

export default BusRatings;