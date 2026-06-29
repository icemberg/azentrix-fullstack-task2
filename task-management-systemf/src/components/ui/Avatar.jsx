import React from 'react';
import { cn } from '../../utils/cn';

const Avatar = ({ src, fallback, alt, className, ...props }) => {
  return (
    <div
      className={cn(
        "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-z-border",
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-z-elevated border border-z-border text-xs font-medium text-z-text-main">
          {fallback || "?"}
        </div>
      )}
    </div>
  );
};

export default Avatar;
