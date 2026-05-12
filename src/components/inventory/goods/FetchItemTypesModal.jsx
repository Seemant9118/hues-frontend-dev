'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function FetchItemTypesModal({
  open,
  onOpenChange,
  options,
  selected,
  onToggle,
  onRun,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Fetch Item Types</DialogTitle>
          <DialogDescription>
            Select sources to fetch likely item types from your business data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {options.map((option) => (
            <div key={option.id} className="flex items-start space-x-2">
              <Checkbox
                id={option.id}
                checked={selected.includes(option.id)}
                onCheckedChange={() => onToggle(option.id)}
                className="mt-1.5"
              />
              <div className="space-y-0.5">
                <Label
                  htmlFor={option.id}
                  className="cursor-pointer font-medium"
                >
                  {option.label}
                </Label>
                <p className="text-sm text-muted-foreground">{option.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button size="sm" onClick={onRun} disabled={selected.length === 0}>
            Run Fetch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
