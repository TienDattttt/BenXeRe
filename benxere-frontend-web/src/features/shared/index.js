// Components
export {
  ErrorFallback,
  LoadingAnimation,
} from './components';

// Types
export {
  StatusCodes,
  SortDirections,
  ViewModes,
  TimePeriods,
  ExportFormats,
  NotificationTypes,
  DeviceTypes,
  Breakpoints,
  DateFormats,
  ResponseMessages,
} from './types';

// Hooks
export { useDataGrid } from './hooks/useDataGrid';
export { useForm } from './hooks/useForm';

// Utils
export {
  formatDate,
  formatCurrency,
  formatPhone,
  getPaginationInfo,
  createSelectOptions,
  deepClone,
  isEqual,
  parseErrorMessage,
  getDeviceType,
  isValidJSON,
  generateRandomString,
} from './utils/common';

/**
 * Example usage:
 * 
 * import {
 *   // Components
 *   LoadingAnimation,
 *   ErrorFallback,
 * 
 *   // Hooks
 *   useDataGrid,
 *   useForm,
 * 
 *   // Utils
 *   formatDate,
 *   formatCurrency,
 * 
 *   // Types & Constants
 *   DateFormats,
 *   StatusCodes,
 * } from '@/features/shared';
 * 
 * const MyComponent = () => {
 *   const {
 *     data,
 *     loading,
 *     handlePageChange,
 *   } = useDataGrid({
 *     fetchData: myApiCall,
 *   });
 * 
 *   if (loading) {
 *     return (
 *       <LoadingAnimation
 *         message="Loading data..."
 *         overlay
 *       />
 *     );
 *   }
 * 
 *   const formattedDate = formatDate(
 *     data.createdAt,
 *     DateFormats.WITH_TIME
 *   );
 * 
 *   return (
 *     // Component JSX
 *   );
 * };
 * 
 * // Error Boundary usage
 * const App = () => (
 *   <ErrorBoundary
 *     FallbackComponent={ErrorFallback}
 *     onReset={() => window.location.reload()}
 *   >
 *     {children}
 *   </ErrorBoundary>
 * );
 * 
 * // Form handling
 * const Form = () => {
 *   const {
 *     values,
 *     errors,
 *     handleChange,
 *     handleSubmit,
 *   } = useForm({
 *     initialValues: {},
 *     validate: (values) => {
 *       // Validation logic
 *     },
 *     onSubmit: async (values) => {
 *       // Submit logic
 *     },
 *   });
 * 
 *   return (
 *     // Form JSX
 *   );
 * };
 */