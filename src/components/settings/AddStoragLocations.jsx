'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const storageTypeOptions = [
  'Warehouse / Godown',
  'Production / Manufacturing',
  'Retail Store',
  'Office',
  'Dispatch Hub',
];

export default function AddStorageLocationModal({
  open,
  setOpen,
  newLocation,
  setNewLocation,
  handleAddLocation,
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Add storage location</DialogTitle>

          <DialogDescription>
            Storage locations help you track stock across different areas within
            the same premises (e.g., Warehouse vs Production floor). They do not
            create a new GST location.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label>
              Name <span className="text-red-500">*</span>
            </Label>

            <Input
              value={newLocation.name}
              onChange={(e) =>
                setNewLocation((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="e.g., Raw Material Store"
              className="h-11 rounded-xl"
            />
          </div>

          {/* Internal code */}
          <div className="space-y-2">
            <Label>Internal code (optional)</Label>

            <Input
              value={newLocation.code}
              onChange={(e) =>
                setNewLocation((p) => ({ ...p, code: e.target.value }))
              }
              placeholder="e.g., WH-01"
              className="h-11 rounded-xl"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>
              Type <span className="text-red-500">*</span>
            </Label>

            <Select
              value={newLocation.type}
              onValueChange={(v) => setNewLocation((p) => ({ ...p, type: v }))}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>

              <SelectContent>
                {storageTypeOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Same premises */}
          <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <p className="text-sm font-medium">
              Same premises as this address?
            </p>

            <Switch
              checked={newLocation.is_same_premises}
              onCheckedChange={(v) =>
                setNewLocation((p) => ({ ...p, is_same_premises: v }))
              }
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button size="sm" onClick={handleAddLocation}>
            Add location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
