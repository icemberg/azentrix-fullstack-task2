import React from 'react';
import { cn } from '../../utils/cn';

const Badge = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'border-transparent bg-z-elevated text-z-text-main',
    primary: 'border-transparent bg-z-brand-dim text-z-brand',
    secondary: 'border-transparent bg-z-border text-z-text-muted',
    danger: 'border-transparent bg-red-500/10 text-red-500',
    outline: 'text-z-text-main',
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-z-border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-z-brand focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Badge;
