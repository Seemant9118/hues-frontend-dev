import React from 'react';
import { cn } from '@/lib/utils';

const SubHeader = ({ name, children, className }) => {
  return (
    <div
      className={cn(
        'sticky top-0 z-10 flex items-center justify-between bg-white pt-4',
        className,
      )}
    >
      <h2 className="text-xl font-bold text-zinc-900">{name}</h2>
      {children}
    </div>
  );
};

export default SubHeader;
