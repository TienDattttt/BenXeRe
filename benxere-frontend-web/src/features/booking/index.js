// Components
export { default as BookingModal } from './components/BookingModal';
export { default as CouponModal } from './components/CouponModal';
export { default as SeatSelector } from './components/SeatSelector';
export { default as PickupLocations } from './components/PickupLocations';
export { default as DropoffLocations } from './components/DropoffLocations';
export { default as BusDetails } from './components/BusDetails';

// Services
export * as bookingService from './services/bookingService';

// Hooks
export { useBooking } from './hooks/useBooking';
export { useSeatSelection } from './hooks/useSeatSelection';

// Types
export * from './types';

// Constants
export * from './constants';

// Utilities
export * from './utils';

/**
 * Example usage:
 * 
 * import { 
 *   BookingModal, 
 *   useBooking, 
 *   useSeatSelection,
 *   bookingService,
 *   formatPrice,
 *   validatePassengerInfo 
 * } from '@/features/booking';
 * 
 * const MyComponent = () => {
 *   const { createBooking, loading, error } = useBooking();
 *   const { 
 *     selectedSeats, 
 *     toggleSeat, 
 *     totalPrice 
 *   } = useSeatSelection({ maxSeats: 4 });
 *   
 *   // Use the imported utilities and components...
 * };
 */