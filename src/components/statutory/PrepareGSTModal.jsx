import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export function PrepareGstrModal({
  open,
  onOpenChange,
  // gstin,
  // businessName,
  filingPeriods,
  onPrepare,
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Prepare GSTR-1</DialogTitle>
          <DialogDescription>
            Select the filing period to prepare a new GSTR-1 return.
          </DialogDescription>
        </DialogHeader>

        {/* GSTIN */}
        {/* <div className="space-y-2">
          <Label>GSTIN</Label>
          <div className="rounded-md bg-muted px-3 py-2 text-sm">
            <span className="font-medium">{gstin}</span>
            <span className="ml-2 text-muted-foreground">{businessName}</span>
          </div>
        </div> */}

        {/* Filing Period */}
        <div className="space-y-2 pt-4">
          <Label>Filing Period</Label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Select filing period" />
            </SelectTrigger>
            <SelectContent>
              {filingPeriods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!selectedPeriod}
            onClick={() => onPrepare(selectedPeriod)}
          >
            Prepare
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
