'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Label } from '@radix-ui/react-label';
import { ArrowDownIcon, ArrowUpDown, ArrowUpIcon, Filter } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import DatePickers from '../ui/DatePickers';
import RadioSelect from '../ui/RadioSelect';

export function NotificationDataTableColumnHeader({
  notificationDateFilter,
  notificationTypeFilter,
  column,
  title,
  className,
}) {
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [selectedToDate, setSelectedToDate] = useState(null);

  const [dateForFilter, setDateForFilter] = useState({
    fromDate: '',
    toDate: '',
  });

  const [typesForFilter, setTypesForFilter] = useState([]);
  // for commit
  typesForFilter;
  dateForFilter;

  const notificationTypes = ['Inventory', 'Order', 'Invite', 'New', 'Purchase'];

  useEffect(() => {
    setDateForFilter((prev) => ({
      ...prev,
      fromDate: selectedFromDate
        ? moment(selectedFromDate).format('DD/MM/YYYY')
        : '',
    }));
  }, [selectedFromDate]);

  useEffect(() => {
    setDateForFilter((prev) => ({
      ...prev,
      toDate: selectedToDate ? moment(selectedToDate).format('DD/MM/YYYY') : '',
    }));
  }, [selectedToDate]);

  const toggleDateFilterOpen = () => {
    setIsDateFilterOpen(!isDateFilterOpen);
    setSelectedFromDate(null);
    setSelectedToDate(null);
  };

  const handleTypesFilter = (type) => {
    setTypesForFilter((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn('flex min-w-[150px] items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-bold text-darkText data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'asc' ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {notificationDateFilter && (
        <DropdownMenu
          open={isDateFilterOpen}
          onOpenChange={toggleDateFilterOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 text-xs font-bold text-darkText data-[state=open]:bg-accent"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
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
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {notificationTypeFilter && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 text-xs font-bold text-darkText data-[state=open]:bg-accent"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="flex max-w-56 flex-wrap gap-5 p-4"
          >
            {notificationTypes.map((type) => (
              <RadioSelect
                key={type}
                name="notificationType"
                option={type}
                value={type.toLowerCase()}
                checkBoxName={type.toLowerCase()}
                handleChange={() => handleTypesFilter(type.toLowerCase())}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
