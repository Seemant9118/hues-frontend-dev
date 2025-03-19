import { cn } from '@/lib/utils'; // Ensure the import path is correct
import React from 'react';

function Slot({ isActive, char, hiddenPin = false }) {
  return (
    <div
      className={cn(
        'relative h-14 w-10 text-[2rem]',
        'flex items-center justify-center',
        'transition-all duration-300',
        'rounded-md border-2 focus:bg-blue-600',
        'group-focus-within:border-accent-foreground/20 group-hover:border-accent-foreground/20',
        'outline outline-0 outline-accent-foreground/20',
        { 'outline-4 outline-accent-foreground': isActive }, // Conditional outline
      )}
    >
      {char !== null && (
        <div className={hiddenPin ? 'text-black' : 'text-primary'}>
          {hiddenPin ? '*' : char}
        </div>
      )}
    </div>
  );
}

export default Slot;
