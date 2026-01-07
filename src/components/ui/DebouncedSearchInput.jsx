'use client';

import { debounce } from '@/appUtils/helperFunctions';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from './input';

const DebouncedInput = ({
  value = '',
  onDebouncedChange,
  delay = 500,
  className,
  placeholder = 'Type...',
  disabled = false,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const hasValue = Boolean(localValue?.length);
  const debouncedRef = useRef(null);

  // Sync external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Create debounced fn once
  useEffect(() => {
    debouncedRef.current = debounce((val) => {
      onDebouncedChange?.(val);
    }, delay);

    return () => debouncedRef.current?.cancel?.();
  }, [onDebouncedChange, delay]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    debouncedRef.current?.(val);
  };

  const handleClear = () => {
    debouncedRef.current?.cancel?.(); // cancel pending debounce
    setLocalValue('');
    onDebouncedChange?.(''); // immediate clear
  };

  return (
    <div className="relative">
      <Input
        size="sm"
        type="text"
        disabled={disabled}
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        className={cn('pr-8', className)}
      />

      {hasValue ? (
        <X
          size={16}
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
        />
      ) : (
        <Search
          size={16}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
      )}
    </div>
  );
};

export default DebouncedInput;
