import React from 'react';
import Typography from "../../../components/core/typography";

const SuccessMessage = ({ bookingDetails }) => {
  return (
    <>
      <img src="/check-mark.svg" className="m-auto" alt="Success" />
      <Typography variant="h1" className="mt-6 mb-2 text-center font-bold text-green-600">
        Booking Confirmed!
      </Typography>
      <Typography className="mb-6 text-center">
        Please check your inbox for digital copy of your ticket(s)!
      </Typography>
      
      {bookingDetails && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 max-w-lg mx-auto text-left">
          <Typography variant="h3" className="font-semibold mb-4 border-b pb-2">
            Booking Summary
          </Typography>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-medium">{bookingDetails.bookingId || "N/A"}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Route:</span>
              <span className="font-medium">{bookingDetails.routeName || "N/A"}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Travel Date:</span>
              <span className="font-medium">{bookingDetails.travelDate || "N/A"}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Seats:</span>
              <span className="font-medium">{bookingDetails.seats?.join(", ") || "N/A"}</span>
            </div>
            
            <div className="border-t border-dashed my-2"></div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Original Fare:</span>
              <span className="font-medium">{bookingDetails.originalFare ? `₫${bookingDetails.originalFare.toLocaleString()}` : "N/A"}</span>
            </div>
            
            {bookingDetails.couponCode && (
              <div className="flex justify-between">
                <span className="text-gray-600">Coupon Applied:</span>
                <span className="font-medium text-green-600">{bookingDetails.couponCode}</span>
              </div>
            )}
            
            {bookingDetails.discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-green-600">-₫{bookingDetails.discountAmount.toLocaleString()}</span>
              </div>
            )}
            
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold">Total Paid:</span>
                <span className="font-bold text-blue-700">{bookingDetails.totalFare ? `₫${bookingDetails.totalFare.toLocaleString()}` : "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuccessMessage;