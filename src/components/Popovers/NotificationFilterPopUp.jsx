'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarDays, SlidersHorizontal } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import CheckboxOption from '../ui/Checkboxes';
import DatePickers from '../ui/DatePickers';
import { Label } from '../ui/label';

function NotificationFilterPopUp({ setFilteredNotification }) {
  const translations = useTranslations('components.notificationsFilter');

  // English values for backend mapping
  const notificationTypes = [
    { key: 'type1', value: 'Invoice' },
    { key: 'type2', value: 'Order' },
    { key: 'type3', value: 'Invitation' },
    { key: 'type4', value: 'Order_Negotiation' },
  ];

  const [open, setOpen] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [selectedToDate, setSelectedToDate] = useState(null);

  const [dataForFilter, setDataForFilter] = useState({
    fromDate: '',
    toDate: '',
    notificationType: [],
  });

  useEffect(() => {
    setDataForFilter((prev) => ({
      ...prev,
      fromDate: selectedFromDate
        ? moment(selectedFromDate).format('DD/MM/YYYY')
        : '',
    }));
  }, [selectedFromDate]);

  useEffect(() => {
    setDataForFilter((prev) => ({
      ...prev,
      toDate: selectedToDate ? moment(selectedToDate).format('DD/MM/YYYY') : '',
    }));
  }, [selectedToDate]);

  const handleTypesFilter = (type) => {
    setDataForFilter((prev) => {
      const typesSelected = prev.notificationType.includes(type)
        ? prev.notificationType.filter((t) => t !== type)
        : [...prev.notificationType, type];

      return {
        ...prev,
        notificationType: typesSelected, // Store only English values
      };
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" debounceTime={500}>
          <SlidersHorizontal size={16} />
          {translations('cta')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mr-9 flex w-[400px] flex-col gap-4 px-4 text-sm">
        <div className="text-center font-bold text-gray-500">
          {translations('title')}
        </div>
        <div className="max-h-[400px]">
          <div className="flex flex-col gap-2">
            <span>{translations('form.label.chooseDate')}:</span>
            <div className="grid w-full max-w-lg items-center gap-1.5">
              <Label
                htmlFor="fromDate"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                {translations('form.label.from')}:
              </Label>
              <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2">
                <DatePickers
                  selected={selectedFromDate}
                  onChange={setSelectedFromDate}
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="left"
                />
                <CalendarDays className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
              </div>
            </div>
            <div className="grid w-full max-w-lg items-center gap-1.5">
              <Label
                htmlFor="toDate"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                {translations('form.label.to')}:
              </Label>
              <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2">
                <DatePickers
                  selected={selectedToDate}
                  onChange={setSelectedToDate}
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="left"
                />
                <CalendarDays className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="mt-2">
              {translations('form.label.chooseType')}:
            </span>

            <div className="flex flex-wrap gap-3 px-2 py-4">
              {notificationTypes.map(({ key, value }) => {
                const translatedLabel = translations(
                  `form.label.types_available.${key}.value`,
                );

                const backendValue = value.toUpperCase();

                return (
                  <CheckboxOption
                    key={key}
                    name="notificationType"
                    label={translatedLabel} // UI (Hindi / localized)
                    value={backendValue} // Backend value
                    checked={dataForFilter.notificationType.includes(
                      backendValue,
                    )}
                    onChange={handleTypesFilter} // receives value
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedFromDate(null);
              setSelectedToDate(null);
              setDataForFilter({
                fromDate: '',
                toDate: '',
                notificationType: [],
              });
              setFilteredNotification({
                fromDate: '',
                toDate: '',
                notificationType: [],
              });
              setOpen(false);
            }}
          >
            {translations('form.ctas.clear')}
          </Button>
          <Button
            size="sm"
            variant="blue_outline"
            onClick={() => {
              setFilteredNotification(dataForFilter);
              setOpen(!open);
            }}
          >
            {translations('form.ctas.save')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationFilterPopUp;
