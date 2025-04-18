import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

const InvoiceTypeModal = ({ invoiceType, setInvoiceType }) => {
  const translations = useTranslations('components.invoice_type_modal');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setInvoiceType('');
    }
  }, [open]);

  const handleSelect = (type) => {
    setInvoiceType(type);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle size={14} />
          {translations('cta.invoice')}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-w-xl flex-col gap-0.5">
        <DialogTitle className="text-lg font-semibold">
          {translations('title')}
        </DialogTitle>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card
            onClick={() => handleSelect('b2c')}
            className={cn(
              'flex cursor-pointer flex-col gap-2 rounded-xl border p-4 shadow-sm transition hover:border-primary',
              invoiceType === 'B2C' && 'border-primary bg-muted',
            )}
          >
            <p className="text-sm font-medium">{translations('types.type1')}</p>
            <p className="text-xs text-muted-foreground">
              {translations('types.type1_desc')}
            </p>
          </Card>
          <Card
            onClick={() => handleSelect('b2b')}
            className={cn(
              'flex cursor-pointer flex-col gap-2 rounded-xl border p-4 shadow-sm transition hover:border-primary',
              invoiceType === 'B2B' && 'border-primary bg-muted',
            )}
          >
            <p className="text-sm font-medium">{translations('types.type2')}</p>
            <p className="text-xs text-muted-foreground">
              {translations('types.type2_desc')}
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceTypeModal;
