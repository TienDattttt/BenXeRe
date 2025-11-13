import React from 'react';

const AddonsSection = ({ addons, selectedAddons, onToggle }) => {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Tiện ích</h2>
      <div className="border p-4 rounded-md space-y-4">
        {addons.map((addon, index) => (
          <div key={index} className="flex items-start">
            <input
              type="checkbox"
              className="mr-3 mt-1 cursor-pointer"
              checked={selectedAddons.includes(addon.name)}
              onChange={() => onToggle(addon.name)}
            />
            <div>
              <p className="font-medium">{addon.name}</p>
              <p className="text-sm text-gray-500">{addon.description}</p>
              {addon.price && (
                <p className="text-sm text-blue-600">{addon.price.toLocaleString()}đ</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddonsSection;