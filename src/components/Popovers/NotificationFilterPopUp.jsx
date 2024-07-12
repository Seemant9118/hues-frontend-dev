'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarDays, SlidersHorizontal } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import DatePickers from '../ui/DatePickers';
import { Label } from '../ui/label';
import Checkboxes from '../ui/Checkboxes';

function NotificationFilterPopUp() {
  const notificationTypes = ['Inventory', 'Order', 'Invite', 'New', 'Purchase'];
  const [open, setOpen] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [selectedToDate, setSelectedToDate] = useState(null);

  const [dataForFilter, setDataForFilter] = useState({
    fromDate: '',
    toDate: '',
    typesSelected: [],
  });

  dataForFilter;
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
      const typesSelected = prev.typesSelected.includes(type)
        ? prev.typesSelected.filter((t) => t !== type)
        : [...prev.typesSelected, type];

      return {
        ...prev,
        typesSelected,
      };
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={'export'}>
          <SlidersHorizontal size={16} />
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mr-9 flex w-[400px] flex-col gap-4 px-4 text-sm">
        <div className="text-center font-bold text-gray-500">Filters</div>
        <div className="max-h-[400px]">
          <div className="flex flex-col gap-2">
            <span>Choose Date:</span>
            <div className="grid w-full max-w-lg items-center gap-1.5">
              <Label
                htmlFor="fromDate"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                From:
              </Label>
              <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <DatePickers
                  selected={selectedFromDate}
                  onChange={setSelectedFromDate}
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="top-right"
                />
                <CalendarDays className="absolute right-2 top-1/2 z-0 -translate-y-1/2 text-[#3F5575]" />
              </div>
            </div>
            <div className="grid w-full max-w-lg items-center gap-1.5">
              <Label
                htmlFor="toDate"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                To:
              </Label>
              <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <DatePickers
                  selected={selectedToDate}
                  onChange={setSelectedToDate}
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="top-right"
                />
                <CalendarDays className="absolute right-2 top-1/2 z-0 -translate-y-1/2 text-[#3F5575]" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="mt-2">Choose Type:</span>

            <div className="flex flex-wrap gap-5 px-2 py-4">
              {notificationTypes.map((type) => (
                <Checkboxes
                  key={type}
                  name="notificationType"
                  option={type}
                  value={type.toLowerCase()}
                  checkBoxName={type.toLowerCase()}
                  checked={dataForFilter.typesSelected.includes(
                    type.toLowerCase(),
                  )}
                  handleChange={() => handleTypesFilter(type.toLowerCase())}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={'outline'}
            onClick={() => {
              setSelectedFromDate(null);
              setSelectedToDate(null);
              setDataForFilter({
                fromDate: '',
                toDate: '',
                typesSelected: [],
              });
              setOpen(false);
            }}
          >
            Clear
          </Button>
          <Button
            variant={'blue_outline'}
            onClick={() => {
              // console.log(dataForFilter);
              setOpen(!open);
            }}
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationFilterPopUp;
