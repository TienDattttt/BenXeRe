import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import Typography from '../typography';

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

const Select = forwardRef(({
  id,
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  variant = 'outlined',
  size = 'md',
  className = '',
  selectClassName = '',
  fullWidth = false,
  options = [],
  placeholder,
  value,
  onChange,
  ...props
}, ref) => {
  const containerClasses = twMerge(
    'inline-flex flex-col',
    fullWidth && 'w-full',
    className
  );
  const selectClasses = twMerge(
    // Base styles
    'block rounded-lg transition-colors focus:outline-none appearance-none bg-no-repeat bg-right cursor-pointer',
    'pr-10', // Space for dropdown arrow
    fullWidth && 'w-full',
    
    // Variant styles
    variants[variant].base,
    variants[variant].focus,
    error && variants[variant].error,
    disabled && variants[variant].disabled,
    
    // Size styles
    sizes[size],
    
    selectClassName
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
        <select
          ref={ref}
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={helperText ? `${id}-helper-text` : undefined}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>        {/* Custom dropdown arrow - clickable */}
        <div 
          className={twMerge(
            "absolute inset-y-0 right-0 flex items-center px-2 transition-colors pointer-events-auto",
            disabled 
              ? "text-gray-400 cursor-not-allowed" 
              : "text-gray-500 cursor-pointer hover:text-gray-700"
          )}
          onMouseDown={(e) => {
            if (disabled) return;
            e.preventDefault();
            // Focus the select element first
            const selectElement = e.currentTarget.previousElementSibling;
            if (selectElement && selectElement.tagName === 'SELECT' && !selectElement.disabled) {
              selectElement.focus();
              // Trigger the native select dropdown by simulating a click on the select itself
              setTimeout(() => {
                selectElement.click();
              }, 0);
            }
          }}
          onClick={(e) => {
            if (disabled) return;
            e.preventDefault();
            e.stopPropagation();
          }}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Open dropdown"
          aria-disabled={disabled}
        >
          <svg
            className={twMerge(
              "h-5 w-5 transition-transform duration-200",
              !disabled && "hover:scale-110"
            )}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      
      {renderHelperText()}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;