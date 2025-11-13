// Context
export { AuthProvider, useAuth, useAuthDispatch } from './contexts/AuthContext';

// Hooks
export { useAuthentication } from './hooks/useAuthentication';

// Services
export {
  authenticate,
  register,
  verifyToken,
  requestPasswordReset,
  resetPassword,
  updatePassword,
  logout,
  TokenService,
  AuthError,
} from './services/authService';

// Types and Constants
export {
  UserRoles,
  AuthStatus,
  VerificationStatus,
} from './types';

// Validation Utils
export {
  validateEmail,
  validatePassword,
  validatePhone,
  validateRegistration,
  validatePasswordChange,
} from './utils/validation';

/**
 * Example usage:
 * 
 * import { 
 *   useAuthentication,
 *   UserRoles,
 *   validateRegistration 
 * } from '@/features/auth';
 * 
 * const MyComponent = () => {
 *   const { 
 *     login,
 *     register,
 *     isAuthenticated,
 *     user,
 *     loading,
 *     error 
 *   } = useAuthentication();
 * 
 *   const handleSubmit = async (data) => {
 *     const { isValid, errors } = validateRegistration(data);
 *     if (!isValid) {
 *       // Handle validation errors
 *       return;
 *     }
 *     
 *     const success = await register(data);
 *     if (success) {
 *       // Handle successful registration
 *     }
 *   };
 * 
 *   if (loading) {
 *     return <LoadingSpinner />;
 *   }
 * 
 *   return (
 *     // Component JSX
 *   );
 * };
 */