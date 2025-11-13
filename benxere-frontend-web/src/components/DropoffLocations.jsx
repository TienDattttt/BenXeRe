import React from 'react';

const DropoffLocations = ({ locations, selected, onSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Điểm trả
      </h3>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {locations.map((location) => (
          <div
            key={location.locationId}
            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 
              ${selected === location.locationId 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
            onClick={() => onSelect(location.locationId)}
          >
            <div className="flex items-center">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{location.name}</h4>
                {location.address && (
                  <p className="text-sm text-gray-500 mt-1">{location.address}</p>
                )}
              </div>
              {selected === location.locationId && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            {location.note && (
              <p className="text-sm text-gray-600 mt-2 italic">{location.note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DropoffLocations;