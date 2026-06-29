import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-z-border bg-z-base px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-z-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-z-brand disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 mt-1 block">
          {error.message || error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
