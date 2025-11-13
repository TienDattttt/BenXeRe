import { twMerge } from 'tailwind-merge';

const sizes = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[1440px]',
  full: 'max-w-full',
};

const Container = ({
  children,
  size = 'lg',
  className = '',
  fluid = false,
  as: Component = 'div',
  ...props
}) => {
  const classes = twMerge(
    'mx-auto w-full px-4 sm:px-6 lg:px-8',
    !fluid && sizes[size],
    className
  );

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default Container;