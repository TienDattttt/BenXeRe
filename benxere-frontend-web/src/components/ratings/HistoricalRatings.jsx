import React, { useState, useEffect } from 'react';
import { getRatingsByCompany, getRatingsByBus, getRatingsByOwner } from '../../services/rating-service';
import RatingCard from './RatingCard';

// Rating types for filtering
export const RatingTypes = {
  BUS: 'bus',
  COMPANY: 'company',
  OWNER: 'owner'
};

/**
 * Component for displaying historical ratings with pagination
 * Can be used for company, bus, or owner ratings
 * 
 * @param {Object} props
 * @param {string} props.type - Type of rating (bus, company, owner)
 * @param {string|number} props.identifier - Company name, bus ID, or owner ID
 * @param {number} props.initialPage - Initial page to display (default: 0)
 * @param {number} props.pageSize - Number of ratings per page (default: 10)
 */
const HistoricalRatings = ({ type, identifier, initialPage = 0, pageSize = 10 }) => {
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!identifier) {
        setError('Không có thông tin định danh được cung cấp');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let response;
        
        switch (type) {
          case RatingTypes.COMPANY:
            response = await getRatingsByCompany(identifier, currentPage, pageSize);
            break;
          case RatingTypes.BUS:
            response = await getRatingsByBus(identifier, currentPage, pageSize);
            break;
          case RatingTypes.OWNER:
            response = await getRatingsByOwner(identifier, currentPage, pageSize);
            break;
          default:
            throw new Error('Loại đánh giá không hợp lệ');
        }

        setRatings(response);
      } catch (err) {
        console.error('Error fetching ratings:', err);
        setError('Không thể tải đánh giá. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [type, identifier, currentPage, pageSize]);

  // Generate pagination buttons
  const renderPagination = () => {
    // Skip pagination if there are no ratings, no totalPages property, or only one page
    if (!ratings || !ratings.totalPages || ratings.totalPages <= 1 || ratings.totalElements <= pageSize) return null;

    const pages = [];
    const maxVisiblePages = 5; // Number of visible page buttons
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(0, currentPage - halfVisiblePages);
    let endPage = Math.min(ratings.totalPages - 1, startPage + maxVisiblePages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
        disabled={currentPage === 0}
        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md mr-1 disabled:opacity-50"
        aria-label="Trang trước"
      >
        &laquo;
      </button>
    );

    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-md mx-1 ${
            i === currentPage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {i + 1}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => setCurrentPage(prev => Math.min(ratings.totalPages - 1, prev + 1))}
        disabled={currentPage === ratings.totalPages - 1}
        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md ml-1 disabled:opacity-50"
        aria-label="Trang sau"
      >
        &raquo;
      </button>
    );

    return (
      <div className="flex justify-center mt-6">
        {pages}
      </div>
    );
  };

  // Loading state
  if (loading && !ratings) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <p>{error}</p>
      </div>
    );
  }

  // Empty state
  if (!ratings || !ratings.content || ratings.content.length === 0 || ratings.totalElements === 0) {
    return (
      <div className="p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Không có đánh giá</h3>
        <p className="mt-1 text-sm text-gray-500">Chưa có đánh giá nào được tìm thấy.</p>
      </div>
    );
  }

  return (
    <div className="ratings-list">
      {/* Rating statistics */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center">
          <div className="mr-4">
            <div className="text-3xl font-bold text-blue-600">
              {(ratings?.averageRating !== undefined ? ratings.averageRating : 0).toFixed(1)}
            </div>
            <div className="flex mt-1">
              {[1, 2, 3, 4, 5].map(star => (
                <svg
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(ratings?.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Dựa trên</div>
            <div className="font-medium">{ratings?.totalRatings || 0} đánh giá</div>
          </div>
        </div>
      </div>

      {/* Ratings list */}
      <div>
        {ratings?.content?.map(rating => (
          <RatingCard key={rating.id} rating={rating} />
        )) || []}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default HistoricalRatings;