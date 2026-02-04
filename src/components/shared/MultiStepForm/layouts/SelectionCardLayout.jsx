/* eslint-disable react/no-array-index-key */

import InfoBanner from '@/components/auth/InfoBanner';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export default function SelectionCardLayout({
  options,
  selectedValue,
  onSelect,
  columns = 2,
  multiSelect = false,
  errors,
}) {
  const isSelected = (value) => {
    if (multiSelect) {
      return Array.isArray(selectedValue) && selectedValue.includes(value);
    }
    return selectedValue === value;
  };

  const handleSelect = (value) => {
    if (multiSelect) {
      const current = Array.isArray(selectedValue) ? selectedValue : [];
      if (current.includes(value)) {
        onSelect(current.filter((v) => v !== value));
      } else {
        onSelect([...current, value]);
      }
    } else {
      onSelect(value);
    }
  };

  return (
    <>
      {errors?.movementType && (
        <InfoBanner
          variant="danger"
          text={errors.movementType}
          showSupportLink={false}
        />
      )}

      <div
        className={cn(
          'mt-2 grid gap-6',
          columns === 2 && 'grid-cols-1 md:grid-cols-2',
          columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        )}
      >
        {options.map((option) => {
          const selected = isSelected(option.value);

          return (
            <Card
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                'relative cursor-pointer border-2 p-6 transition-all hover:border-primary hover:bg-[#288AF91A] hover:shadow-md',
                selected ? 'border-primary bg-primary/5' : 'border-gray-200',
              )}
            >
              {/* Selection Indicator */}
              {selected && (
                <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-4 w-4" />
                </div>
              )}

              {/* Icon */}
              <div
                className={cn(
                  'mb-4 flex h-12 w-12 items-center justify-center rounded-lg',
                  selected
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600',
                )}
              >
                {typeof option.icon === 'function'
                  ? option.icon({ className: 'h-6 w-6' })
                  : option.icon}
              </div>

              {/* Title */}
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                {option.title}
              </h3>

              {/* Description */}
              {option.description && (
                <p className="mb-4 text-sm text-muted-foreground">
                  {option.description}
                </p>
              )}

              {/* Features */}
              {option.features && option.features.length > 0 && (
                <ul className="space-y-2">
                  {option.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="mt-0.5 text-primary">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
