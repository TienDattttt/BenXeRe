import { twMerge } from 'tailwind-merge';

const variants = {
  default: 'bg-white shadow-md',
  flat: 'bg-white border border-gray-200',
  elevated: 'bg-white shadow-lg',
  outlined: 'border border-gray-300',
};

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const radiuses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
};

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  radius = 'lg',
  className = '',
  hover = false,
  clickable = false,
  noDivider = false,
  header,
  headerClassName = '',
  footer,
  footerClassName = '',
  ...props
}) => {
  const cardClasses = twMerge(
    // Base styles
    'relative overflow-hidden',
    
    // Variant styles
    variants[variant],
    
    // Padding
    paddings[padding],
    
    // Border radius
    radiuses[radius],
    
    // Hover effects
    hover && 'transition-transform duration-200 hover:-translate-y-1',
    
    // Clickable styles
    clickable && 'cursor-pointer transition-shadow hover:shadow-lg',
    
    className
  );

  const headerClasses = twMerge(
    'px-4 py-3 border-b border-gray-200 bg-gray-50',
    headerClassName
  );

  const footerClasses = twMerge(
    'px-4 py-3 border-t border-gray-200 bg-gray-50',
    footerClassName
  );

  const contentClasses = twMerge(
    'relative',
    !noDivider && header && 'border-t border-gray-200',
    !noDivider && footer && 'border-b border-gray-200'
  );

  return (
    <div className={cardClasses} {...props}>
      {header && <div className={headerClasses}>{header}</div>}
      <div className={contentClasses}>{children}</div>
      {footer && <div className={footerClasses}>{footer}</div>}
    </div>
  );
};

// Sub-components for better organization
const CardHeader = ({ children, className = '', ...props }) => {
  const classes = twMerge(
    'px-4 py-3 border-b border-gray-200 bg-gray-50',
    className
  );
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  const classes = twMerge(
    'px-4 py-3 border-t border-gray-200 bg-gray-50',
    className
  );
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardBody = ({ children, className = '', ...props }) => {
  const classes = twMerge('p-4', className);
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;