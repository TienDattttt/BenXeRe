import React from 'react';
import HistoricalRatings, { RatingTypes } from './HistoricalRatings';

/**
 * Component for displaying ratings for a specific bus company
 * @param {Object} props
 * @param {string} props.companyName - Name of the company
 */
const BusCompanyRatings = ({ companyName }) => {
  if (!companyName) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
        <p>Vui lòng cung cấp tên công ty để xem đánh giá.</p>
      </div>
    );
  }

  return (
    <div className="bus-company-ratings">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Đánh giá về {companyName}
      </h2>
      
      <HistoricalRatings 
        type={RatingTypes.COMPANY} 
        identifier={companyName} 
      />
    </div>
  );
};

export default BusCompanyRatings;