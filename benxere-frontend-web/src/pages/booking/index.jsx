import React, { useState } from "react";

// Local components
import ContactForm from "./components/ContactForm";
import AddonsSection from "./components/AddonsSection";
import TripDetails from "./components/TripDetails";
import PriceSummary from "./components/PriceSummary";

// Constants
import { mockBookingDetails } from "./components/bookingConstants";

const BookingPage = () => {
  // State for contact information
  const [contactInfo, setContactInfo] = useState(mockBookingDetails.contact);
  
  // State for selected addons
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Function to toggle addon selection
  const toggleAddon = (addonName) => {
    if (selectedAddons.includes(addonName)) {
      setSelectedAddons(selectedAddons.filter(name => name !== addonName));
    } else {
      setSelectedAddons([...selectedAddons, addonName]);
    }
  };

  // Handle booking confirmation
  const handleConfirmBooking = () => {
    alert("Booking confirmed! Proceed to payment.");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white w-full max-w-5xl shadow-md rounded-lg flex">
        {/* Left Section: Form and Add-Ons */}
        <div className="flex-1 p-6">
          {/* Contact Information */}
          <ContactForm 
            contactInfo={contactInfo} 
            onChange={setContactInfo} 
          />

          {/* Add-Ons */}
          <AddonsSection 
            addons={mockBookingDetails.addons}
            selectedAddons={selectedAddons}
            onToggle={toggleAddon}
          />
        </div>

        {/* Right Section: Trip Information and Summary */}
        <div className="w-96 bg-gray-100 p-6 border-l">
          <h2 className="text-lg font-semibold mb-4">Thông tin chuyến đi</h2>
          
          {/* Trip Details Component */}
          <TripDetails tripInfo={mockBookingDetails.tripInfo} />

          {/* Price Summary Component */}
          <PriceSummary 
            tripInfo={mockBookingDetails.tripInfo}
            selectedAddons={selectedAddons}
            addons={mockBookingDetails.addons}
          />

          {/* Confirm Button */}
          <div className="mt-6">
            <button
              onClick={handleConfirmBooking}
              className="bg-blue-600 text-white py-2 px-4 rounded-md w-full hover:bg-blue-700"
            >
              Xác nhận và Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;