import { cn } from '@/lib/utils';
import React from 'react';

const Wrapper = ({ children, className, id }) => {
  return (
    <div id={id} className={cn('flex flex-col gap-2', className)}>
      {children}
    </div>
  );
};

export default Wrapper;
