import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { typography } from '../../constants/theme';

const variantClasses = {
  h1: 'text-4xl md:text-5xl font-bold',
  h2: 'text-3xl md:text-4xl font-bold',
  h3: 'text-2xl md:text-3xl font-semibold',
  h4: 'text-xl md:text-2xl font-semibold',
  h5: 'text-lg md:text-xl font-medium',
  h6: 'text-base md:text-lg font-medium',
  subtitle1: 'text-lg font-normal',
  subtitle2: 'text-base font-medium',
  body1: 'text-base font-normal',
  body2: 'text-sm font-normal',
  caption: 'text-xs font-normal',
  overline: 'text-xs font-medium uppercase tracking-wider',
};

const weightClasses = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const colorClasses = {
  primary: 'text-primary-600',
  secondary: 'text-secondary-600',
  success: 'text-success-500',
  error: 'text-error-500',
  warning: 'text-warning-500',
  white: 'text-white',
  black: 'text-neutral-900',
  muted: 'text-neutral-500',
};

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

const Typography = ({
  variant = 'body1',
  component,
  weight,
  color,
  align,
  className = '',
  children,
  ...props
}) => {
  const Component = component || getDefaultComponent(variant);

  const classes = useMemo(() => {
    return twMerge(
      'leading-normal',
      variantClasses[variant],
      weight && weightClasses[weight],
      color && colorClasses[color],
      align && alignClasses[align],
      className
    );
  }, [variant, weight, color, align, className]);

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

const getDefaultComponent = (variant) => {
  switch (variant) {
    case 'h1':
      return 'h1';
    case 'h2':
      return 'h2';
    case 'h3':
      return 'h3';
    case 'h4':
      return 'h4';
    case 'h5':
      return 'h5';
    case 'h6':
      return 'h6';
    default:
      return 'p';
  }
};

export default Typography;
