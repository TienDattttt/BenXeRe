import React, { useState, useEffect, useRef } from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Input from './core/form-controls/input';
import Typography from './core/typography';

const LocationsManager = ({ 
  title,
  locationIds,
  onLocationIdsChange,
  onCreateLocation,
  existingLocations = [],
  buttonColor = "primary"
}) => {
  const [newLocation, setNewLocation] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  // Filter locations based on user input
  useEffect(() => {
    if (newLocation.trim() === '') {
      setFilteredLocations([]);
      return;
    }
    
    const filtered = existingLocations.filter(location => 
      location.name.toLowerCase().includes(newLocation.toLowerCase()) &&
      !locationIds.includes(location.locationId)
    );
    setFilteredLocations(filtered);
  }, [newLocation, existingLocations, locationIds]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddLocation = async () => {
    if (!newLocation.trim()) return;
    
    // Check if location already exists in recommendations
    const existingLocation = existingLocations.find(
      location => location.name.toLowerCase() === newLocation.toLowerCase()
    );
    
    if (existingLocation) {
      // Add existing location if not already added
      if (!locationIds.includes(existingLocation.locationId)) {
        onLocationIdsChange([...locationIds, existingLocation.locationId]);
      }
    } else {
      // Create new location
      const location = await onCreateLocation(newLocation);
      if (location) {
        onLocationIdsChange([...locationIds, location.locationId]);
      }
    }
    
    setNewLocation('');
    setShowSuggestions(false);
  };

  const handleSelectLocation = (locationId) => {
    if (!locationIds.includes(locationId)) {
      onLocationIdsChange([...locationIds, locationId]);
      setNewLocation('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveLocation = (locationId) => {
    onLocationIdsChange(locationIds.filter(id => id !== locationId));
  };

  const handleInputFocus = () => {
    if (newLocation.trim() !== '') {
      setShowSuggestions(true);
    }
  };

  const handleInputChange = (e) => {
    setNewLocation(e.target.value);
    setShowSuggestions(e.target.value.trim() !== '');
  };

  return (
    <div className="space-y-3">
      <Typography variant="subtitle2">{title}</Typography>
      
      <div className="flex gap-2 relative">
        <div className="relative flex-1" ref={suggestionRef}>
          <LocationOnIcon className="absolute left-3 top-[50%] transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Nhập địa điểm"
            value={newLocation}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            size="small"
            className="pl-10"
          />
          
          {/* Location suggestions dropdown */}
          {showSuggestions && filteredLocations.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
              {filteredLocations.map((location) => (
                <div
                  key={location.locationId}
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                  onClick={() => handleSelectLocation(location.locationId)}
                >
                  <div className="flex items-center">
                    <LocationOnIcon className="mr-2 h-5 w-5 text-gray-400" />
                    <span className="block truncate">{location.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleAddLocation}
          disabled={!newLocation.trim()}
          className={`px-4 py-2 text-sm font-medium text-white 
            bg-${buttonColor}-600 hover:bg-${buttonColor}-700 
            rounded-lg transition-colors disabled:bg-gray-300`}
        >
          Thêm
        </button>
      </div>

      <div className="space-y-2">
        {locationIds.map(locationId => {
          const location = existingLocations.find(l => l.locationId === locationId);
          if (!location) return null;

          return (
            <div 
              key={locationId}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <LocationOnIcon className="text-gray-400 w-5 h-5" />
                <span>{location.name}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveLocation(locationId)}
                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LocationsManager;