// Services
export {
  getAdminStats,
  getUsers,
  updateUser,
  getRolesAndPermissions,
  updateRolePermissions,
  getReports,
  manageBusOwnerVerification,
  getAuditLogs,
  updateSystemSettings,
  AdminError,
} from './services/adminService';

// Hooks
export { useAdminData } from './hooks/useAdminData';
export { useAdminActions } from './hooks/useAdminActions';

// Types and Constants
export {
  AdminModules,
  PermissionTypes,
  AdminBookingStatus,
  AdminListFilters,
  ReportPeriods,
  ReportTypes,
  AdminSortOptions,
  AdminActionTypes,
} from './types';

// Utilities
export {
  formatCurrency,
  formatDate,
  getReportDateRange,
  formatReportData,
  hasPermission,
  generateAuditMessage,
} from './utils';

/**
 * Example usage:
 * 
 * import {
 *   useAdminData,
 *   useAdminActions,
 *   AdminModules,
 *   AdminActionTypes,
 *   formatCurrency,
 *   hasPermission
 * } from '@/features/admin';
 * 
 * const AdminComponent = () => {
 *   const {
 *     data: users,
 *     loading,
 *     error,
 *     handlePageChange,
 *     handleSearch
 *   } = useAdminData({
 *     resource: 'users',
 *     defaultParams: {
 *       limit: 20,
 *     }
 *   });
 * 
 *   const {
 *     performAction,
 *     actionResult,
 *     loading: actionLoading
 *   } = useAdminActions();
 * 
 *   const handleBlock = async (userId) => {
 *     try {
 *       await performAction(AdminActionTypes.BLOCK, userId);
 *       // Handle success
 *     } catch (error) {
 *       // Handle error
 *     }
 *   };
 * 
 *   const canBlockUsers = hasPermission(
 *     currentUser,
 *     'block',
 *     AdminModules.USERS
 *   );
 * 
 *   return (
 *     // Component JSX
 *   );
 * };
 */