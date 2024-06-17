import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const InputWrapper = forwardRef(({ children, className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col bg-white px-8 py-4 shadow-[0px_2px_8px_0px_rgba(21,151,212,0.16)]',
        className,
      )}
    >
      {children}
    </div>
  );
});
InputWrapper.displayName = InputWrapper;
export default InputWrapper;
