import { settingsAPI } from '@/api/settings/settingsApi';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { createSettings } from '@/services/Settings_Services/SettingsService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

const InvoiceTypeModal = ({ triggerInvoiceTypeModal, setInvoiceType }) => {
  const translations = useTranslations('components.invoiceType');
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [currSelectedType, setCurrSelectedType] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);

  const INVOICE_TYPE_DATA = [
    {
      id: 1,
      type: 'b2c',
    },
    {
      id: 2,
      type: 'b2b',
    },
  ];

  useEffect(() => {
    if (!open) {
      setCurrSelectedType('');
      setSetAsDefault(false);
    }
  }, [open]);

  const handleSelect = (type) => {
    setCurrSelectedType(type);
  };

  const createSettingMutation = useMutation({
    mutationKey: [settingsAPI.createSettings.endpointKey],
    mutationFn: createSettings,
    onSuccess: () => {
      toast.success(translations('toast_success'));
      setInvoiceType(currSelectedType);
      setOpen(false);
      queryClient.invalidateQueries([settingsAPI.getSettingByKey.endpointKey]);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || translations('toast_error'),
      );
    },
  });

  const handleProceed = () => {
    if (currSelectedType) {
      const payload = {
        contextKey: 'INVOICE',
        settings: [
          {
            key: 'invoice.default.type',
            value: currSelectedType,
          },
        ],
      };

      if (setAsDefault) {
        createSettingMutation.mutate(payload);
      } else {
        setInvoiceType(currSelectedType);
        setOpen(false);
      }
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
          {INVOICE_TYPE_DATA?.map((item) => (
            <Card
              key={item.id}
              onClick={() => handleSelect(item.type)}
              className={cn(
                'flex cursor-pointer flex-col gap-2 rounded-xl border p-4 shadow-sm transition hover:border-primary',
                currSelectedType === item.type && 'border-primary bg-muted',
              )}
            >
              <p className="text-sm font-medium">
                {translations(`types.${item.type}.name`)}
              </p>
              <p className="text-xs text-muted-foreground">
                {translations(`types.${item.type}.description`)}
              </p>
            </Card>
          ))}
        </div>

        <div className="mb-2 mt-4 border-t" />

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Checkbox
              id="set-as-default"
              checked={setAsDefault}
              onCheckedChange={(checked) => setSetAsDefault(!!checked)}
            />
            <Label htmlFor="set-as-default" className="text-xs">
              {translations('set_as_default')}
            </Label>
          </div>
          <Button size="sm" className="w-20" onClick={handleProceed}>
            {translations('proceed_button')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceTypeModal;
