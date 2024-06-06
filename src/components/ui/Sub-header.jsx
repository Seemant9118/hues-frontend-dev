import React from 'react';
import { cn } from '@/lib/utils';

const SubHeader = ({ name, children, className }) => {
  return (
    <div
      className={cn(
        'sticky left-0 right-0 top-0 flex items-center justify-between gap-2.5 bg-white pt-4',
        className,
      )}
    >
      <h2 className="text-2xl font-bold text-zinc-900">{name}</h2>
      {children}
    </div>
  );
};

export default SubHeader;
