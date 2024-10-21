import { cn } from '@/lib/utils';
import React from 'react';

const Wrapper = ({ children, className, id }) => {
  return (
    <div
      id={id}
      className={cn(
        'flex h-full grow flex-col gap-4 overflow-y-hidden p-2',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Wrapper;
