import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const CheckboxOption = ({
  checked,
  name,
  value,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <label
      className={cn(
        'flex items-center gap-2 rounded-md border p-2 text-sm transition-colors',
        checked && 'border-primary bg-primary/10',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer hover:bg-primary hover:text-white',
      )}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={() => onChange(value)}
        name={name}
      />

      <span>{label}</span>
    </label>
  );
};

export default CheckboxOption;
