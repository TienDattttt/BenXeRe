import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { colors } from '../../constants/theme';

const sizeClasses = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-2.5 text-lg',
  xl: 'px-6 py-3 text-xl',
};

const variantClasses = {
  primary: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white',
  secondary: 'bg-secondary-100 hover:bg-secondary-200 focus:ring-secondary-500 text-secondary-900',
  outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
  ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
  danger: 'bg-error-600 hover:bg-error-700 focus:ring-error-500 text-white',
  success: 'bg-success-600 hover:bg-success-700 focus:ring-success-500 text-white',
};

const loadingSpinner = (
  <svg
    className="animate-spin h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const classes = useMemo(() => {
    return twMerge(
      // Base styles
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      
      // Variant styles
      variantClasses[variant],
      
      // Size styles
      sizeClasses[size],
      
      // Width styles
      block ? 'w-full' : '',
      
      // Disabled styles
      (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '',
      
      // Custom classes
      className
    );
  }, [variant, size, block, disabled, loading, className]);

  // Handle icon and loading spinner positioning
  const renderContent = () => {
    if (loading) {
      return (
        <>
          {loadingSpinner}
          <span className="ml-2">{children}</span>
        </>
      );
    }

    if (icon) {
      return iconPosition === 'left' ? (
        <>
          <span className="mr-2">{icon}</span>
          {children}
        </>
      ) : (
        <>
          {children}
          <span className="ml-2">{icon}</span>
        </>
      );
    }

    return children;
  };

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={(e) => {
        if (!disabled && !loading && onClick) {
          onClick(e);
        }
      }}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;
