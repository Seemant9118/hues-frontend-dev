import { capitalize } from '@/appUtils/helperFunctions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, ChevronRight } from 'lucide-react';
import React from 'react';

export default function TemplateTypeModal({
  isOpen,
  onClose,
  onSelect,
  selectedType,
  title = 'Select Template Type',
  description = 'Select a template type to proceed',
}) {
  const types = [
    'SERVICE',
    'TERMS',
    'NDA',
    'VENDOR',
    'CUSTOMER',
    'MEMBERS',
    'CUSTOM',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-neutral-800">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-neutral-500">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="scrollBarStyles mt-4 grid max-h-[350px] grid-cols-1 gap-2 overflow-y-auto pr-1">
          {types.map((type) => {
            const isSelected = selectedType === type;
            return (
              <Button
                key={type}
                onClick={() => onSelect(type)}
                debounceTime={0}
                variant={isSelected ? 'default' : 'outline'}
                className="group flex h-auto w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition active:scale-[0.98]"
              >
                <span>{capitalize(type)}</span>
                {selectedType ? (
                  <Check
                    size={16}
                    className={
                      isSelected ? 'text-primary-foreground' : 'opacity-0'
                    }
                  />
                ) : (
                  <ChevronRight
                    size={16}
                    className="text-neutral-400 transition-colors group-hover:text-primary"
                  />
                )}
              </Button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose} size="sm">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
