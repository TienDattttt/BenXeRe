import React from 'react';

// Local components
import SuccessMessage from './components/SuccessMessage';
import ActionButtons from './components/ActionButtons';

const BookingResultPage = () => {
  return (
    <div className="container m-auto min-h-[calc(100vh-136px)] flex items-center">
      <div className="bg-slate-50 p-10 rounded-lg flex-1 m-auto text-center">
        <SuccessMessage />
        <ActionButtons />
      </div>
    </div>
  );
};

export default BookingResultPage;