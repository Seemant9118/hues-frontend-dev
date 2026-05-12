'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';

export default function AddDocRegistrations({
  open,
  onClose,
  enterpriseId,
  type,
  onSubmit,
}) {
  const [form, setForm] = useState({
    registrationType: 'GST',
    registrationNumber: '',
    enterpriseId,
    type,
  });

  useEffect(() => {
    if (!open) {
      setForm({
        registrationType: 'GST',
        registrationNumber: '',
        enterpriseId,
        type,
      });
    }
  }, [open, enterpriseId, type]);

  const handleChange = (value) => {
    setForm((prev) => ({
      ...prev,
      registrationNumber: value.toUpperCase(), // GST usually uppercase
    }));
  };

  const handleSubmit = () => {
    onSubmit?.(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add registration</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Registration type */}
          <div className="space-y-2">
            <Label>Registration type</Label>
            <div className="flex h-11 items-center rounded-xl border bg-muted/40 px-3 text-sm">
              GST
            </div>
          </div>

          {/* GST Number */}
          <div className="space-y-2">
            <Label>Registration number</Label>
            <Input
              placeholder="Enter GST number"
              value={form.registrationNumber}
              onChange={(e) => handleChange(e.target.value)}
              maxLength={15}
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !form.registrationNumber || form.registrationNumber.length !== 15
            }
          >
            Add registration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
