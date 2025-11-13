import React, { useState, useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import Typography from '../typography';

const SearchableLocationInput = ({
  id,
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  variant = 'outlined',
  size = 'md',
  className = '',
  inputClassName = '',
  fullWidth = false,
  placeholder = 'Nhập tên địa điểm...',
  value,
  onChange,
  options = [],
  onOptionSelect,
  maxSuggestions = 10,
  ...props
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedOption, setSelectedOption] = useState(null);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const variants = {
    outlined: {
      base: 'border border-gray-300 bg-white',
      focus: 'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
      error: 'border-error-500 focus:ring-error-500 focus:border-error-500',
      disabled: 'bg-gray-100 cursor-not-allowed opacity-75',
    },
    filled: {
      base: 'border-0 border-b-2 border-gray-300 bg-gray-100',
      focus: 'focus:ring-0 focus:border-primary-500',
      error: 'border-error-500 focus:border-error-500',
      disabled: 'bg-gray-200 cursor-not-allowed opacity-75',
    },
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-4 py-2.5 text-lg',
  };

  // Initialize input value based on the selected value prop
  useEffect(() => {
    if (value && options.length > 0) {
      const selectedOption = options.find(option => option.value === value);
      if (selectedOption) {
        setInputValue(selectedOption.label);
        setSelectedOption(selectedOption);
      }
    } else if (!value) {
      setInputValue('');
      setSelectedOption(null);
    }
  }, [value, options]);

  // Filter options based on input value
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredOptions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = options
      .filter(option => 
        option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        (option.searchTerms && option.searchTerms.some(term => 
          term.toLowerCase().includes(inputValue.toLowerCase())
        ))
      )
      .slice(0, maxSuggestions);

    setFilteredOptions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(-1);
  }, [inputValue, options, maxSuggestions]);

  // Handle input changes
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Clear selection if input doesn't match any option
    if (selectedOption && selectedOption.label !== newValue) {
      setSelectedOption(null);
      onChange && onChange({ target: { value: '' } });
    }
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    setInputValue(option.label);
    setSelectedOption(option);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    // Call the onChange handler with the selected value
    onChange && onChange({ target: { value: option.value } });
    onOptionSelect && onOptionSelect(option);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
          handleOptionSelect(filteredOptions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const containerClasses = twMerge(
    'relative inline-flex flex-col searchable-location-input',
    fullWidth && 'w-full',
    className
  );

  const inputClasses = twMerge(
    // Base styles
    'block rounded-lg transition-colors focus:outline-none w-full enhanced-location-input',
    fullWidth && 'w-full',
    
    // Variant styles
    variants[variant].base,
    variants[variant].focus,
    error && variants[variant].error,
    disabled && variants[variant].disabled,
    
    // Size styles
    sizes[size],
    
    inputClassName
  );

  const renderHelperText = () => {
    if (!helperText && !error) return null;
    
    return (
      <Typography
        variant="caption"
        color={error ? 'error' : 'muted'}
        className="mt-1"
      >
        {error || helperText}
      </Typography>
    );
  };

  return (
    <div className={containerClasses}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-1 text-error-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (filteredOptions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={helperText ? `${id}-helper-text` : undefined}
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
          className={inputClasses}
          {...props}
        />
        
        {/* Search Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>        {/* Suggestions Dropdown */}
        {showSuggestions && filteredOptions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto searchable-location-suggestions"
          >
            <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
              {filteredOptions.length} kết quả tìm kiếm
            </div>
            {filteredOptions.map((option, index) => (
              <div
                key={option.value}
                className={twMerge(
                  'px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 searchable-location-suggestion-item',
                  'hover:bg-blue-50',
                  index === selectedIndex && 'bg-blue-100 selected',
                  index === 0 && 'rounded-t-lg',
                  index === filteredOptions.length - 1 && 'rounded-b-lg'
                )}
                onClick={() => handleOptionSelect(option)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center">
                  <svg
                    className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="text-xs text-gray-500 mt-1">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* No results message */}
        {showSuggestions && filteredOptions.length === 0 && inputValue.trim() !== '' && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
          >
            <div className="px-4 py-3 text-center text-gray-500">
              <svg
                className="h-8 w-8 mx-auto mb-2 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-sm">Không tìm thấy địa điểm nào</p>
              <p className="text-xs text-gray-400 mt-1">Thử tìm kiếm với từ khóa khác</p>
            </div>
          </div>
        )}
      </div>
      
      {renderHelperText()}
    </div>
  );
};

export default SearchableLocationInput;
