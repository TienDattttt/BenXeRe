import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import AppRoutes from './routes';
import ChatbotButton from './components/chat/chatbot-button';
import ThemeProvider from './components/theme-provider';

// Lazy loaded components
const LoadingAnimation = React.lazy(() => import('./features/shared/components/LoadingAnimation'));
const ErrorFallback = React.lazy(() => import('./features/shared/components/ErrorFallback'));

/**
 * Error handler for the error boundary
 * @param {Error} error The error that was caught
 * @param {Object} errorInfo Additional information about the error
 */
const handleError = (error, errorInfo) => {
  // Log error to your error reporting service
  console.error('Application Error:', error, errorInfo);
};

const AppContent = () => (
  <Suspense
    fallback={
      <LoadingAnimation
        message="Loading application..."
      />
    }
  >
    <AppRoutes />
    <ChatbotButton />
  </Suspense>
);

const App = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={() => window.location.reload()}
    >
      <ThemeProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default React.memo(App);