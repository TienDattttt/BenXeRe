import { useState, useCallback } from 'react';
import * as bookingService from '../services/bookingService';

/**
 * Custom hook for managing booking operations
 * @returns {Object} Booking operations and state
 */
export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Create a new booking
   * @param {import('../types').BookingCreateData} bookingData 
   */
  const createBooking = useCallback(async (bookingData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await bookingService.createBooking(bookingData);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get bookings by schedule ID
   * @param {string} scheduleId 
   */
  const getBookingsBySchedule = useCallback(async (scheduleId) => {
    setLoading(true);
    setError(null);
    try {
      const bookings = await bookingService.getBookingsByScheduleId(scheduleId);
      return bookings;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get current user's bookings
   */
  const getUserBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bookings = await bookingService.getBookingsByCurrentUser();
      return bookings;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check booking status
   * @param {string} bookingId 
   */
  const checkStatus = useCallback(async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      const status = await bookingService.checkBookingStatus(bookingId);
      return status;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createBooking,
    getBookingsBySchedule,
    getUserBookings,
    checkStatus,
  };
};