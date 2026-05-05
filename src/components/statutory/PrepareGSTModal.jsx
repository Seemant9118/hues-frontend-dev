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
import { getCurrentFinancialYearPeriods } from '@/appUtils/helperFunctions';

export function PrepareGstrModal({
  open,
  onOpenChange,
  type = 'gstr1',
  onPrepare,
}) {
  const filingPeriods = getCurrentFinancialYearPeriods();
  const [selectedPeriod, setSelectedPeriod] = useState(
    filingPeriods[0]?.value || '',
  );

  const isGstr3B = type === 'gstr3b';
  const label = isGstr3B ? 'GSTR-3B' : 'GSTR-1';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Prepare {label}</DialogTitle>
          <DialogDescription>
            Select the filing period to prepare a new {label} return.
          </DialogDescription>
        </DialogHeader>

        {/* Filing Period */}
        <div className="space-y-2 pt-4">
          <Label>Filing Period</Label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Select filing period" />
            </SelectTrigger>
            <SelectContent className="max-h-[180px]">
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
            onClick={() => onPrepare(selectedPeriod, type)}
          >
            Prepare
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
