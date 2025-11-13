import React from 'react';
import LoadingAnimation from "../../../components/loading-animation";

const LoadingState = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <LoadingAnimation />
      <p className="mt-4 text-lg text-gray-600 animate-pulse">
        Đang tải thông tin...
      </p>
    </div>
  );
};

export default LoadingState;