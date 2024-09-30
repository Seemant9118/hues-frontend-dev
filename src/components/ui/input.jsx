import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef(
  ({ className, type, required, ...props }, ref) => {
    return (
      <input
        // onInvalid={(e) => e.target.setCustomValidity("Mandatory Information")}
        // onInput={(e) => e.target.setCustomValidity("")}
        type={type}
        className={cn(
          'flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-80',
          className,
        )}
        required={required}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
