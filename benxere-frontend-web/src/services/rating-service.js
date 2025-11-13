import API from "./api";
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Create a rating with optional image upload
 * @param {Object} reviewData - Rating data with optional image
 * @returns {Promise<Object>} Created rating
 */
export const createReview = (reviewData) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  // Ensure required fields match what the backend expects
  const busId = reviewData.busId;
  const scheduleId = reviewData.scheduleId;
  const comment = reviewData.comment || '';
  const rating = Math.max(1, Math.min(5, reviewData.rating || 1)); // Ensure rating is between 1-5

  console.log('Submitting rating request:', {
    scheduleId, 
    busId, 
    comment,
    rating
  });

  // Create FormData for multipart request
  const formData = new FormData();
  
  // Add the form parameters directly
  formData.append('busId', busId);
  formData.append('scheduleId', scheduleId);
  formData.append('rating', rating);
  formData.append('comment', comment);
  
  // Add image if provided
  if (reviewData.image) {
    formData.append('image', reviewData.image);
  }

  return API.post('/api/ratings', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(res => {
    console.log('Rating submitted successfully:', res.data);
    return res.data;
  })
  .catch(error => {
    console.error('Rating submission error:', error?.response?.data);
    throw error?.response?.data || { message: 'Failed to submit rating. Server error or connectivity issue.' };
  });
};

export const getAllReviews = async () => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get('/api/ratings', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const getReviewById = async (id) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get(`/api/ratings/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const updateReview = async (id, reviewData) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  // Ensure required fields match what the backend expects
  const busId = reviewData.busId;
  const scheduleId = reviewData.scheduleId;
  const comment = reviewData.comment || '';
  const rating = Math.max(1, Math.min(5, reviewData.rating || 1)); // Ensure rating is between 1-5

  console.log('Updating rating request:', {
    id,
    scheduleId, 
    busId, 
    comment,
    rating
  });

  // Create FormData for multipart request
  const formData = new FormData();
  
  // Add the form parameters directly
  formData.append('busId', busId);
  formData.append('scheduleId', scheduleId);
  formData.append('rating', rating);
  formData.append('comment', comment);
  
  // Add image if provided
  if (reviewData.image) {
    formData.append('image', reviewData.image);
  }

  return API.put(`/api/ratings/${id}`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(res => {
    console.log('Rating updated successfully:', res.data);
    return res.data;
  })
  .catch(error => {
    console.error('Rating update error:', error?.response?.data);
    throw error?.response?.data || { message: 'Failed to update rating. Server error or connectivity issue.' };
  });
};

export const deleteReview = async (id) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  await API.delete(`/api/ratings/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const getReviewsByScheduleId = async (scheduleId) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get(`/api/ratings/schedule/${scheduleId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data.result;
};

/**
 * Get ratings by company name with pagination
 * @param {string} companyName - Name of the company
 * @param {number} page - Page number (0-based)
 * @param {number} size - Number of items per page
 * @returns {Promise<Object>} Paginated ratings with statistics
 */
export const getRatingsByCompany = async (companyName, page = 0, size = 10) => {
  try {
    const response = await API.get(`/api/ratings/company/${encodeURIComponent(companyName)}?page=${page}&size=${size}`);
    const rawResult = response.data;
    
    // Check if the response has the expected format with 'result' array
    if (rawResult && Array.isArray(rawResult.result)) {
      // Transform the flat array result into the expected paginated format
      const ratings = rawResult.result;
      
      // Calculate average rating
      let totalRatingValue = 0;
      ratings.forEach(rating => {
        totalRatingValue += rating.rating || 0;
      });
      const averageRating = ratings.length > 0 ? totalRatingValue / ratings.length : 0;
      
      return {
        content: ratings,
        totalElements: ratings.length,
        totalPages: 1,  // Since we're getting all at once in this format
        averageRating: averageRating,
        totalRatings: ratings.length
      };
    }
    
    const result = rawResult?.result || {};
 
    return {
      content: result?.content || [],
      totalElements: result?.totalElements || 0,
      totalPages: result?.totalPages || 1,
      averageRating: result?.averageRating || 0,
      totalRatings: result?.totalRatings || 0,
      ...result
    };
  } catch (error) {
    console.error('Error fetching company ratings:', error);
    // Return a default empty response instead of throwing
    return {
      content: [],
      totalElements: 0,
      totalPages: 1,
      averageRating: 0,
      totalRatings: 0
    };
  }
};

/**
 * Get ratings by bus ID with pagination
 * @param {number} busId - ID of the bus
 * @param {number} page - Page number (0-based)
 * @param {number} size - Number of items per page
 * @returns {Promise<Object>} Paginated ratings with statistics
 */
export const getRatingsByBus = async (busId, page = 0, size = 10) => {
  try {
    const response = await API.get(`/api/ratings/bus/${encodeURIComponent(busId)}?page=${page}&size=${size}`);
    const rawResult = response.data;
    
    // Check if the response has the expected format with 'result' array
    if (rawResult && Array.isArray(rawResult.result)) {
      // Transform the flat array result into the expected paginated format
      const ratings = rawResult.result;
      
      // Calculate average rating
      let totalRatingValue = 0;
      ratings.forEach(rating => {
        totalRatingValue += rating.rating || 0;
      });
      const averageRating = ratings.length > 0 ? totalRatingValue / ratings.length : 0;
      
      return {
        content: ratings,
        totalElements: ratings.length,
        totalPages: 1,  // Since we're getting all at once in this format
        averageRating: averageRating,
        totalRatings: ratings.length
      };
    }
    
    // Fallback if the response has a different structure
    // This handles the case where the API might be updated in the future
    const result = rawResult?.result || {};
    
    return {
      content: result?.content || [],
      totalElements: result?.totalElements || 0,
      totalPages: result?.totalPages || 1,
      averageRating: result?.averageRating || 0,
      totalRatings: result?.totalRatings || 0,
      ...result
    };
  } catch (error) {
    console.error('Error fetching bus ratings:', error);
    // Return a default empty response instead of throwing
    return {
      content: [],
      totalElements: 0,
      totalPages: 1,
      averageRating: 0,
      totalRatings: 0
    };
  }
};

/**
 * Get ratings by bus owner ID with pagination
 * @param {number} ownerId - ID of the bus owner
 * @param {number} page - Page number (0-based)
 * @param {number} size - Number of items per page
 * @returns {Promise<Object>} Paginated ratings with statistics
 */
export const getRatingsByOwner = async (ownerId, page = 0, size = 10) => {
  try {
    const response = await API.get(`/api/ratings/owner/${encodeURIComponent(ownerId)}?page=${page}&size=${size}`);
    const rawResult = response.data;
    
    // Check if the response has the expected format with 'result' array
    if (rawResult && Array.isArray(rawResult.result)) {
      // Transform the flat array result into the expected paginated format
      const ratings = rawResult.result;
      
      // Calculate average rating
      let totalRatingValue = 0;
      ratings.forEach(rating => {
        totalRatingValue += rating.rating || 0;
      });
      const averageRating = ratings.length > 0 ? totalRatingValue / ratings.length : 0;
      
      return {
        content: ratings,
        totalElements: ratings.length,
        totalPages: 1,  // Since we're getting all at once in this format
        averageRating: averageRating,
        totalRatings: ratings.length
      };
    }
    
    // Fallback if the response has a different structure
    const result = rawResult?.result || {};
    
    // Ensure we have all expected properties with defaults
    return {
      content: result?.content || [],
      totalElements: result?.totalElements || 0,
      totalPages: result?.totalPages || 1,
      averageRating: result?.averageRating || 0,
      totalRatings: result?.totalRatings || 0,
      ...result
    };
  } catch (error) {
    console.error('Error fetching owner ratings:', error);
    // Return a default empty response instead of throwing
    return {
      content: [],
      totalElements: 0,
      totalPages: 1,
      averageRating: 0,
      totalRatings: 0
    };
  }
};

/**
 * Get current user's ratings
 * @returns {Promise<Array>} List of user's ratings
 */
export const getUserRatings = async () => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  try {
    const response = await API.get('/api/ratings/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.result;
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    throw error;
  }
};

/**
 * Get ratings for the current bus owner
 * @returns {Promise<Array>} List of owner's ratings
 */
export const getOwnerRatings = async () => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  try {
    const response = await API.get('/bus-owner/reviews', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.result;
  } catch (error) {
    console.error('Error fetching owner ratings:', error);
    throw error;
  }
};

/**
 * Create a new rating
 * @param {Object} ratingData - Rating data
 * @returns {Promise<Object>} Created rating
 */
export const createRating = async (ratingData) => {
  try {
    const response = await API.post('/api/v1/ratings', ratingData);
    return response.data;
  } catch (error) {
    console.error('Error creating rating:', error);
    throw error;
  }
};

/**
 * Update an existing rating
 * @param {number} ratingId - ID of the rating to update
 * @param {Object} ratingData - Updated rating data
 * @returns {Promise<Object>} Updated rating
 */
export const updateRating = async (ratingId, ratingData) => {
  try {
    const response = await API.put(`/api/v1/ratings/${ratingId}`, ratingData);
    return response.data;
  } catch (error) {
    console.error('Error updating rating:', error);
    throw error;
  }
};

/**
 * Delete a rating
 * @param {number} ratingId - ID of the rating to delete
 * @returns {Promise<Object>} Success response
 */
export const deleteRating = async (ratingId) => {
  try {
    const response = await API.delete(`/api/v1/ratings/${ratingId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting rating:', error);
    throw error;
  }
};