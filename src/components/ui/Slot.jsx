import React from 'react';
import { cn } from '@/lib/utils'; // Ensure that this is the correct import path

function Slot(props) {
  return (
    <div
      className={cn(
        'relative h-14 w-10 text-[2rem]',
        'flex items-center justify-center',
        'transition-all duration-300',
        'rounded-md border-2 bg-[#A5ABBD1A] focus:bg-blue-600',
        'group-focus-within:border-accent-foreground/20 group-hover:border-accent-foreground/20',
        'outline outline-0 outline-accent-foreground/20',
        { 'outline-4 outline-accent-foreground': props.isActive }, // Ensure cn handles object conditionally
      )}
    >
      {props.char !== null && (
        <div className="text-[#288AF9]">{props.char}</div>
      )}
    </div>
  );
}

export default Slot;
