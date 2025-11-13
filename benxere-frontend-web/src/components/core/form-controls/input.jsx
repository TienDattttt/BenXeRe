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

const Input = forwardRef(({
  id,
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  variant = 'outlined',
  size = 'md',
  startAdornment,
  endAdornment,
  className = '',
  inputClassName = '',
  fullWidth = false,
  type = 'text',
  ...props
}, ref) => {
  const containerClasses = twMerge(
    'inline-flex flex-col',
    fullWidth && 'w-full',
    className
  );

  const inputWrapperClasses = twMerge(
    'relative inline-flex items-center',
    fullWidth && 'w-full'
  );

  const inputClasses = twMerge(
    // Base styles
    'block rounded-lg transition-colors focus:outline-none',
    fullWidth && 'w-full',
    
    // Variant styles
    variants[variant].base,
    variants[variant].focus,
    error && variants[variant].error,
    disabled && variants[variant].disabled,
    
    // Size styles
    sizes[size],
    
    // Adornment padding adjustments
    startAdornment && 'pl-10',
    endAdornment && 'pr-10',
    
    inputClassName
  );

  const adornmentClasses = 'absolute inset-y-0 flex items-center px-3 pointer-events-none text-gray-500';

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
      
      <div className={inputWrapperClasses}>
        {startAdornment && (
          <div className={twMerge(adornmentClasses, 'left-0')}>
            {startAdornment}
          </div>
        )}
        
        <input
          ref={ref}
          id={id}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={helperText ? `${id}-helper-text` : undefined}
          className={inputClasses}
          {...props}
        />
        
        {endAdornment && (
          <div className={twMerge(adornmentClasses, 'right-0')}>
            {endAdornment}
          </div>
        )}
      </div>
      
      {renderHelperText()}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;