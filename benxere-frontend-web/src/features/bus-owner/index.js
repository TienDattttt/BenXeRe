// Services
export {
  getBuses,
  addBus,
  updateBus,
  getSchedules,
  createSchedule,
  getEmployees,
  addEmployee,
  getReviews,
  updateScheduleStatus,
  getDashboardStats,
  BusOwnerError,
} from './services/busOwnerService';

// Hooks
export { useBusOwner } from './hooks/useBusOwner';

// Types
export {
  BusTypes,
  EmployeeRoles,
  ScheduleStatus,
  BusOwnerSortOptions,
  ScheduleFilters,
  BusAmenities,
  LicenseTypes,
  MaintenanceStatus,
  SettlementStatus,
  SeatTypes,
} from './types';

// Utils
export {
  formatDuration,
  formatScheduleTime,
  calculateOccupancyRate,
  calculateAverageRating,
  validateBusData,
  validateEmployeeData,
  validateScheduleData,
  canCancelSchedule,
  calculateRevenueStats,
} from './utils';

/**
 * Example usage:
 * 
 * import {
 *   useBusOwner,
 *   BusTypes,
 *   ScheduleStatus,
 *   formatDuration,
 *   validateBusData
 * } from '@/features/bus-owner';
 * 
 * const BusOwnerComponent = () => {
 *   const {
 *     getBuses,
 *     addBus,
 *     loading,
 *     error
 *   } = useBusOwner();
 * 
 *   const handleAddBus = async (data) => {
 *     const { isValid, errors } = validateBusData(data);
 *     if (!isValid) {
 *       // Handle validation errors
 *       return;
 *     }
 *     
 *     try {
 *       const newBus = await addBus(data);
 *       // Handle success
 *     } catch (error) {
 *       // Handle error
 *     }
 *   };
 * 
 *   return (
 *     // Component JSX
 *   );
 * };
 */