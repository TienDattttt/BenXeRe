import React, { useState } from 'react';
import { FaSort, FaClock, FaDollarSign, FaBus, FaBuilding } from 'react-icons/fa';
import './filter-sidebar.css';

const SortOption = ({ label, icon, value, current, onChange }) => (
  <label className="flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-blue-50 cursor-pointer group">
    <input
      type="radio"
      name="sort"
      value={value}
      checked={current === value}
      onChange={onChange}
      className="hidden"
    />
    <div className={`
      w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center
      transition-all duration-300
      ${current === value ? 'border-blue-500 bg-blue-500' : 'border-gray-300 group-hover:border-blue-300'}
    `}>
      {current === value && (
        <div className="w-2 h-2 bg-white rounded-full animate-scale-in"/>
      )}
    </div>
    <span className={`mr-2 text-lg ${current === value ? 'text-blue-500' : 'text-gray-500'}`}>
      {icon}
    </span>
    <span className={`
      transition-colors duration-300
      ${current === value ? 'text-blue-700 font-medium' : 'text-gray-600'}
    `}>
      {label}
    </span>
  </label>
);

const Sidebar = ({
  priceRange,
  handlePriceChange,
  selectedCompany,
  handleCompanyChange,
  selectedType,
  handleTypeChange,
  companies = [],
  busTypes = [],
}) => {
  const [sortOption, setSortOption] = useState('default');
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`
      filter-sidebar bg-white rounded-xl shadow-lg p-6 transition-all duration-500
      transform hover:shadow-xl
      ${isExpanded ? 'w-80' : 'w-20'}
    `}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-4 top-8 bg-blue-500 text-white w-8 h-8 rounded-full 
          flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors duration-300"
      >
        {isExpanded ? '←' : '→'}
      </button>

      <div className={`transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Price Range Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <FaDollarSign className="mr-3 text-blue-500" />
            Giá vé
          </h3>
          <div className="px-2 space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-600">Giá thấp nhất</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={priceRange.max}
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500
                    focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">đ</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-600">Giá cao nhất</label>
              <div className="relative">
                <input
                  type="number"
                  min={priceRange.min}
                  max="500000"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500
                    focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  placeholder="500000"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">đ</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {priceRange.min.toLocaleString()}đ - {priceRange.max.toLocaleString()}đ
            </div>
          </div>
        </div>

        {/* Company Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <FaBuilding className="mr-3 text-blue-500" />
            Nhà xe
          </h3>
          <select
            value={selectedCompany}
            onChange={handleCompanyChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 
              focus:ring-2 focus:ring-blue-200 transition-all duration-300
              text-gray-700 bg-white hover:border-blue-300"
          >
            <option value="">Tất cả nhà xe</option>
            {companies.map((company, index) => (
              <option key={index} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>

        {/* Bus Type Section */}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <FaBus className="mr-3 text-blue-500" />
            Loại xe
          </h3>
          <select
            value={selectedType}
            onChange={handleTypeChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 
              focus:ring-2 focus:ring-blue-200 transition-all duration-300
              text-gray-700 bg-white hover:border-blue-300"
          >
            <option value="">Tất cả loại xe</option>
            {busTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;