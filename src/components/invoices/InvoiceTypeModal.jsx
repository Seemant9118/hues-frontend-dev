import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

const InvoiceTypeModal = ({
  triggerInvoiceTypeModal,
  data,
  setInvoiceType,
}) => {
  const translations = useTranslations('components.invoice_type_modal');
  const [open, setOpen] = useState(false);
  const [currSelectedType, setCurrSelectedType] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);

  useEffect(() => {
    if (!open) {
      setCurrSelectedType('');
      setSetAsDefault(false);
    }
  }, [open]);

  const handleSelect = (type) => {
    setCurrSelectedType(type);
  };

  const handleProceed = () => {
    if (currSelectedType) {
      // In future you can hit API with `setAsDefault` here
      setInvoiceType(currSelectedType); // You can also pass `setAsDefault` if needed

      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerInvoiceTypeModal}</DialogTrigger>
      <DialogContent className="flex max-w-xl flex-col gap-0.5">
        <DialogTitle className="text-md font-bold">
          {translations('title')}
        </DialogTitle>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {data?.map((item) => (
            <Card
              key={item.id}
              onClick={() => handleSelect(item.type)}
              className={cn(
                'flex cursor-pointer flex-col gap-2 rounded-xl border p-4 shadow-sm transition hover:border-primary',
                currSelectedType === item.type && 'border-primary bg-muted',
              )}
            >
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="mb-4 mt-4 border" />

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Checkbox
              id="set-as-default"
              checked={setAsDefault}
              onCheckedChange={(checked) => setSetAsDefault(!!checked)}
            />
            <Label htmlFor="set-as-default" className="text-xs">
              Set as Default
            </Label>
          </div>
          <Button size="sm" className="w-20" onClick={handleProceed}>
            Proceed
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceTypeModal;
