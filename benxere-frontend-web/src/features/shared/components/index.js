export { default as ErrorFallback } from './ErrorFallback';
export { default as LoadingAnimation } from './LoadingAnimation';

/**
 * Example usage:
 * 
 * import { 
 *   ErrorFallback, 
 *   LoadingAnimation 
 * } from '@/features/shared/components';
 * 
 * // Using LoadingAnimation
 * const MyComponent = () => {
 *   if (loading) {
 *     return (
 *       <LoadingAnimation
 *         message="Loading data..."
 *         size="medium"
 *         overlay
 *       />
 *     );
 *   }
 *   
 *   return (
 *     // Component content
 *   );
 * };
 * 
 * // Using ErrorFallback with ErrorBoundary
 * const App = () => {
 *   return (
 *     <ErrorBoundary
 *       FallbackComponent={ErrorFallback}
 *       onReset={() => {
 *         // Reset the error state
 *       }}
 *     >
 *       {children}
 *     </ErrorBoundary>
 *   );
 * };
 */