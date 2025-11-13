import React from 'react';
import { useRouteError } from "react-router-dom";
import ErrorMessage from './components/ErrorMessage';

const ErrorPage = () => {
  const error = useRouteError();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <ErrorMessage errorDetails={error} />
      </div>
    </div>
  );
};

export default ErrorPage;