import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * RatingCard component to display an individual review/rating
 * This is designed to work with the new API response format
 */
const RatingCard = ({ rating }) => {
  // Format the rating timestamp to relative time (e.g., "2 days ago")
  const formattedTime = rating.createdAt ? 
    formatDistanceToNow(new Date(rating.createdAt), {
      addSuffix: true,
      locale: vi
    }) : '';

  // Generate rating stars display
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg 
          key={i}
          className={`h-5 w-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center mb-1">
            {renderStars(rating.rating)}
            <span className="ml-2 text-gray-600 text-sm">{rating.rating}/5</span>
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium">{rating.userEmail || 'Ẩn danh'}</span> • {formattedTime}
          </div>
        </div>
        {rating.scheduleDate && (
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Chuyến đi: {new Date(rating.scheduleDate).toLocaleDateString('vi-VN')}
          </div>
        )}
      </div>
      
      <p className="text-gray-700 mb-4">{rating.comment || 'Không có bình luận'}</p>
      
      {rating.imageUrl && (
        <div className="mt-2">
          <img
            src={rating.imageUrl}
            alt="Hình ảnh đánh giá"
            className="h-40 w-auto object-cover rounded-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/logo.webp';
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default RatingCard;