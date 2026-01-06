'use client';

import { useEffect, useMemo, useState } from 'react';
import { debounce } from '@/appUtils/helperFunctions';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
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

  // Sync external value (reset / clear from parent)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Stable debounced function
  const debouncedChange = useMemo(
    () =>
      debounce((val) => {
        onDebouncedChange?.(val.trim());
      }, delay),
    [onDebouncedChange, delay],
  );

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    debouncedChange(val); // typing + backspace
  };

  const handleClear = () => {
    setLocalValue('');
    debouncedChange(''); // important: notify parent
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
        className={cn('pr-8', className)} // space for icon
      />

      {hasValue ? (
        <X
          size={16}
          onClick={handleClear}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
        />
      ) : (
        <Search
          size={16}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
        />
      )}
    </div>
  );
};

export default DebouncedInput;
