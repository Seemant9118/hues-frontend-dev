import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-blue-600',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        blue_outline:
          'text-[#288AF9] border-[#288AF9] border underline-offset-4 hover:bg-blue-500/10',
        grey: 'p-2 rounded-sm gap-2 bg-[#A5ABBD26] text-grey text-xs font-bold',
        warning:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground text-[#CE9D0C]',
        export:
          'bg-neutral-500/10 text-neutral-600 border-neutral-300 hover:bg-neutral-600/10 border underline-offset-4',
      },
      size: {
        default: 'h-10 rounded-md px-4 py-2',
        sm: 'h-9 rounded-[6px] px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 rounded-md w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Button = React.forwardRef(
  (
    {
      type = 'button',
      className,
      variant,
      size,
      asChild = false,
      onClick,
      debounceTime = 2000, // Default debounce time set to 2000ms
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const clickTimeoutRef = React.useRef(null);

    const handleClick = (e) => {
      e.stopPropagation();
      if (clickTimeoutRef.current) return;

      onClick && onClick(e);

      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null; // Reset timeout after delay
      }, debounceTime);
    };

    React.useEffect(() => {
      return () => {
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
        }
      };
    }, []);

    return (
      <Comp
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
