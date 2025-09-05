import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Label } from './label';

function InputWithSelect({
  id,
  name,
  inputWidth = 'w-full',
  selectWidth = 'w-20',
  required,
  value,
  onValueChange,
  unit, // current selected unitId
  onUnitChange,
  units = [],
  placeholder,
  unitPlaceholder,
  ...props
}) {
  const [selectedUnit, setSelectedUnit] = useState(unit?.toString() || '');

  // Set default unit if unit prop is not provided
  useEffect(() => {
    if (!unit && units.length) {
      const defaultUnit = units.find((u) => u.isDefault);
      if (defaultUnit) {
        setSelectedUnit(defaultUnit.id.toString());
        onUnitChange?.(defaultUnit.id.toString());
      }
    }
  }, [unit, units, onUnitChange]);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {name} {required && <span className="text-red-600">*</span>}
      </Label>

      <div className="relative flex w-full max-w-sm items-center">
        {/* Input field */}
        <Input
          id={id}
          name={name}
          type="number"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onValueChange(e)}
          className={`pr-24 ${inputWidth}`} // add right padding to fit select
          {...props}
        />

        {/* Unit select inside input container */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 rounded-sm border bg-gray-200 font-semibold">
          <Select
            value={selectedUnit}
            onValueChange={(val) => {
              setSelectedUnit(val);
              onUnitChange?.(val);
            }}
          >
            <SelectTrigger
              className={`${selectWidth} h-8 border-0 bg-transparent shadow-none focus:ring-0`}
            >
              <SelectValue placeholder={unitPlaceholder} />
            </SelectTrigger>
            <SelectContent className="h-36 overflow-y-auto border">
              {units.map((u) => (
                <SelectItem key={u.id} value={u.id.toString()}>
                  {u.abbreviation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export default InputWithSelect;
