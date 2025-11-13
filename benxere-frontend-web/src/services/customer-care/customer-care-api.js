import axios from 'axios';
import config from '../../config';
import api from '../api';

export const getSchedulesByCustomerCare = async () => {
  try {
    const response = await api.get(`/customer-care/schedules`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createBookingForCustomer = async (bookingData) => {
  try {
    const response = await api.post(`/customer-care/bookings`, bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateSeatStatus = async (seatId, isBooked) => {
  try {
    const response = await api.put(`/customer-care/seats/${seatId}`, { isBooked });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const changeCustomerSeats = async (seatChangeData) => {
  try {
    const response = await api.put(`/customer-care/seats/change`, seatChangeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Customer Management
export const getCustomers = async () => {
  try {
    const response = await api.get(`/customer-care/customers`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createCustomer = async (customerData) => {
  try {
    const response = await api.post(`/customer-care/customers`, customerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCustomer = async (customerId, customerData) => {
  try {
    const response = await api.put(`/customer-care/customers/${customerId}`, customerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteCustomer = async (customerId) => {
  try {
    const response = await api.delete(`/customer-care/customers/${customerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Profile Management
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put(`/api/users/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}; 