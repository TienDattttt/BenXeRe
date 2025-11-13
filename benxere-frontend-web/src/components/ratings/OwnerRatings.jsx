import React from 'react';
import HistoricalRatings, { RatingTypes } from './HistoricalRatings';

/**
 * Component for displaying ratings for a specific bus owner
 * @param {Object} props
 * @param {number} props.ownerId - ID of the bus owner
 * @param {string} props.ownerName - Owner name (for display purposes)
 */
const OwnerRatings = ({ ownerId, ownerName }) => {
  if (!ownerId) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
        <p>Vui lòng cung cấp ID chủ xe để xem đánh giá.</p>
      </div>
    );
  }

  return (
    <div className="owner-ratings">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Đánh giá về Chủ xe {ownerName || `#${ownerId}`}
      </h2>
      
      <HistoricalRatings 
        type={RatingTypes.OWNER} 
        identifier={ownerId} 
      />
    </div>
  );
};

export default OwnerRatings;