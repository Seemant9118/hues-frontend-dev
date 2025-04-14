import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

const InvoiceTypeModal = ({ invoiceType, setInvoiceType }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setInvoiceType('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle size={14} />
          {'Invoice'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle>Choose Invoice Type</DialogTitle>

        <div className="mt-4 flex flex-col gap-3">
          <Label className="flex items-center gap-2">
            <input
              type="radio"
              name="invoiceType"
              value="B2C"
              checked={invoiceType === 'B2C'}
              onChange={(e) => setInvoiceType(e.target.value)}
            />
            B2C (Business to Consumer)
          </Label>

          <Label className="flex items-center gap-2">
            <input
              type="radio"
              name="invoiceType"
              value="B2B"
              checked={invoiceType === 'B2B'}
              onChange={(e) => setInvoiceType(e.target.value)}
            />
            B2B (Business to Business)
          </Label>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceTypeModal;
