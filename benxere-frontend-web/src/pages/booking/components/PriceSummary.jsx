import React from 'react';

const PriceSummary = ({ tripInfo, selectedAddons, addons }) => {
  // Calculate the total price including selected addons
  const calculateTotal = () => {
    let total = tripInfo.price;
    
    // Add prices of selected addons
    selectedAddons.forEach(addonName => {
      const addon = addons.find(a => a.name === addonName);
      if (addon && addon.price) {
        total += addon.price;
      }
    });
    
    return total;
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Tạm tính</h2>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Giá vé</span>
          <span>{tripInfo.price.toLocaleString()}đ</span>
        </div>
        
        {selectedAddons.map((addonName) => {
          const addon = addons.find(a => a.name === addonName);
          if (addon && addon.price) {
            return (
              <div key={addonName} className="flex justify-between">
                <span>{addonName}</span>
                <span>{addon.price.toLocaleString()}đ</span>
              </div>
            );
          }
          return null;
        })}
        
        <div className="border-t pt-2 mt-2 flex justify-between font-bold">
          <span>Tổng cộng</span>
          <span className="text-lg text-blue-600">{calculateTotal().toLocaleString()}đ</span>
        </div>
      </div>
    </div>
  );
};

export default PriceSummary;