import React from 'react';

const LoadingState = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-3">Loading...</span>
    </div>
  );
};

export default LoadingState;