import React, { useState, useEffect } from 'react';
import tinhTp from '../tinh_tp.json';
const RouteModal = ({ isOpen, onClose, onSave, route }) => {
  const [origin, setOrigin] = useState(route ? route.origin : '');
  const [destination, setDestination] = useState(route ? route.destination : '');
  const [distanceKm, setDistanceKm] = useState(route ? route.distanceKm : '');

  useEffect(() => {
    if (route) {
      setOrigin(route.origin);
      setDestination(route.destination);
      setDistanceKm(route.distanceKm);
    }
  }, [route]);

  const handleSave = () => {
    onSave({ origin, destination, distanceKm });
  };

  const renderOptions = () => {
    return Object.keys(tinhTp).map((code) => (
      <option key={code} value={code}>
        {tinhTp[code].name_with_type}
      </option>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center">
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md" onClick={onClose}></div>
    <div className="relative bg-white p-8 rounded-lg shadow-2xl w-1/2 z-10">
        <h2 className="text-xl font-bold mb-4">{route ? 'Edit Route' : 'Add Route'}</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Origin</label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Select Origin</option>
            {renderOptions()}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Destination</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Select Destination</option>
            {renderOptions()}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Distance (km)</label>
          <input
            type="number"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteModal;