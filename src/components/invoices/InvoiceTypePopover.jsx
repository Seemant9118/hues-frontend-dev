import { settingsAPI } from '@/api/settings/settingsApi';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getSettingsByKey } from '@/services/Settings_Services/SettingsService';
import { useQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';

// Dummy data for invoice types
const INVOICE_TYPE_DATA = [
  {
    id: 1,
    type: 'b2c',
    name: 'B2C Invoice',
    description:
      'For direct sales to individual consumers, usually without GST registration.',
  },
  {
    id: 2,
    type: 'b2b',
    name: 'B2B Invoice',
    description:
      'For transactions between two registered businesses with GST details.',
  },
];

const InvoiceTypePopover = ({
  triggerInvoiceTypeModal,
  invoiceType,
  setInvoiceType,
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [defaultInvoiceType, setDefaultInvoiceType] = useState('');

  // fetch invoice settings keys
  const { data: settings } = useQuery({
    queryKey: [settingsAPI.getSettingByKey.endpointKey],
    queryFn: () => getSettingsByKey('INVOICE'),
    select: (data) => data.data.data.settings,
    enabled: open,
  });

  useEffect(() => {
    if (settings) {
      const defaultInvoiceTypeKey = settings.find(
        (item) => item.key === 'invoice.default.type',
      )?.value;

      if (
        defaultInvoiceTypeKey &&
        defaultInvoiceTypeKey !== defaultInvoiceType
      ) {
        setDefaultInvoiceType(defaultInvoiceTypeKey);
      }
    }
  }, [settings, defaultInvoiceType]);

  const handleSelect = (type) => {
    setInvoiceType(type); // Pass the selected type to the parent component
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerInvoiceTypeModal}</PopoverTrigger>
      <PopoverContent className="absolute left-[-125px] top-1 flex h-[240px] w-[650px] flex-col gap-5 shadow-lg">
        <h3 className="text-md font-bold">Choose Invoice Type</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {INVOICE_TYPE_DATA?.map((item) => (
            <Card
              key={item.id}
              onClick={() => handleSelect(item.type)}
              className={cn(
                'flex cursor-pointer flex-col gap-2 rounded-xl border p-4 shadow-sm transition hover:border-primary',
                (invoiceType
                  ? invoiceType === item.type
                  : defaultInvoiceType === item.type) &&
                  'border-primary bg-muted',
              )}
            >
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="border-t" />

        <div className="flex items-center justify-between gap-2">
          <Label className="flex items-center gap-1 text-sm font-medium">
            <Info size={14} />
            You can change your default from{' '}
            <span
              className="cursor-pointer text-primary hover:underline"
              onClick={() => router.push('/settings?tab=invoice')}
            >
              here
            </span>
          </Label>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default InvoiceTypePopover;
