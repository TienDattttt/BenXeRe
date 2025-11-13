import API from './api';

/**
 * Get all available coupons
 * @returns {Promise<Array>} List of coupons
 */
export const getAllCoupons = async () => {
  try {
    const response = await API.get('/api/coupons');
    return response.data.result;
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};

/**
 * Get coupon by ID
 * @param {number} id Coupon ID
 * @returns {Promise<Object>} Coupon details
 */
export const getCouponById = async (id) => {
  try {
    const response = await API.get(`/api/coupons/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching coupon with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get coupon by code
 * @param {string} code Coupon code
 * @returns {Promise<Object>} Coupon details
 */
export const getCouponByCode = async (code) => {
  try {
    const response = await API.get(`/api/coupons/code/${code}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching coupon with code ${code}:`, error);
    throw error;
  }
};

export const createCoupon = async (couponData) => {
  try {
    const response = await API.post('/api/coupons', couponData);
    return response.data.result;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
};


export const updateCoupon = async (id, couponData) => {
  try {
    const response = await API.put(`/api/coupons/${id}`, couponData);
    return response.data.result;
  } catch (error) {
    console.error(`Error updating coupon with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a coupon (Admin only)
 * @param {number} id Coupon ID
 * @returns {Promise<string>} Success message
 */
export const deleteCoupon = async (id) => {
  try {
    const response = await API.delete(`/api/coupons/${id}`);
    return response.data.result;
  } catch (error) {
    console.error(`Error deleting coupon with ID ${id}:`, error);
    throw error;
  }
};
