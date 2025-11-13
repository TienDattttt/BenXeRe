import { useState, useCallback, useMemo } from 'react';

/**
 * @typedef {Object} Seat
 * @property {string} id - Seat ID
 * @property {string} number - Seat number
 * @property {number} price - Seat price
 * @property {boolean} isAvailable - Whether the seat is available
 * @property {string} [status] - Current status of the seat
 */

/**
 * Custom hook for managing seat selection
 * @param {Object} options
 * @param {number} [options.maxSeats=6] - Maximum number of seats that can be selected
 * @param {Array<Seat>} options.availableSeats - Array of available seats
 * @param {Function} [options.onSelectionChange] - Callback when selection changes
 */
export const useSeatSelection = ({
  maxSeats = 6,
  availableSeats = [],
  onSelectionChange,
}) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [error, setError] = useState(null);

  /**
   * Check if a seat can be selected
   * @param {Seat} seat 
   */
  const canSelectSeat = useCallback((seat) => {
    if (!seat.isAvailable) {
      return false;
    }
    if (selectedSeats.length >= maxSeats) {
      return false;
    }
    return true;
  }, [selectedSeats.length, maxSeats]);

  /**
   * Toggle seat selection
   * @param {Seat} seat 
   */
  const toggleSeat = useCallback((seat) => {
    setError(null);
    
    if (selectedSeats.find(s => s.id === seat.id)) {
      const newSelection = selectedSeats.filter(s => s.id !== seat.id);
      setSelectedSeats(newSelection);
      onSelectionChange?.(newSelection);
      return;
    }

    if (!canSelectSeat(seat)) {
      if (selectedSeats.length >= maxSeats) {
        setError(`Không thể chọn quá ${maxSeats} ghế`);
      }
      return;
    }

    const newSelection = [...selectedSeats, seat];
    setSelectedSeats(newSelection);
    onSelectionChange?.(newSelection);
  }, [selectedSeats, canSelectSeat, maxSeats, onSelectionChange]);

  /**
   * Clear all selected seats
   */
  const clearSelection = useCallback(() => {
    setSelectedSeats([]);
    setError(null);
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  /**
   * Calculate total price for selected seats
   */
  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
  }, [selectedSeats]);

  /**
   * Check if a seat is selected
   * @param {string} seatId 
   */
  const isSeatSelected = useCallback((seatId) => {
    return selectedSeats.some(seat => seat.id === seatId);
  }, [selectedSeats]);

  /**
   * Get seat details by ID
   * @param {string} seatId 
   */
  const getSeatById = useCallback((seatId) => {
    return availableSeats.find(seat => seat.id === seatId);
  }, [availableSeats]);

  return {
    selectedSeats,
    error,
    totalPrice,
    toggleSeat,
    clearSelection,
    canSelectSeat,
    isSeatSelected,
    getSeatById,
  };
};