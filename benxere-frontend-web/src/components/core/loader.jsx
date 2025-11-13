import { twMerge } from 'tailwind-merge';

const sizes = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const variants = {
  primary: 'text-primary-600',
  secondary: 'text-secondary-600',
  white: 'text-white',
  success: 'text-success-500',
  error: 'text-error-500',
};

const Loader = ({
  size = 'md',
  variant = 'primary',
  fullScreen = false,
  className = '',
  ...props
}) => {
  const containerClasses = twMerge(
    fullScreen && 'fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50',
    !fullScreen && 'inline-flex',
    className
  );

  const spinnerClasses = twMerge(
    'animate-spin',
    sizes[size],
    variants[variant]
  );

  const Spinner = () => (
    <svg
      className={spinnerClasses}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
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

  if (fullScreen) {
    return (
      <div className={containerClasses}>
        <Spinner />
      </div>
    );
  }

  return <Spinner />;
};

export default Loader;