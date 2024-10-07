'use client';

import { CalendarDays, ListFilter } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import DatePickers from '../ui/DatePickers';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import MultiSelect from '../ui/MultiSelect';
import { RangeSlider } from '../ui/RangeSlider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const FilterModal = ({ setFilterData }) => {
  const statusLists = [
    { value: 'BID_SENT', label: 'Bid sent' },
    { value: 'BID_RECEIVED', label: 'Bid received' },
    { value: 'OFFER_SENT', label: 'Offer sent' },
    { value: 'OFFER_RECEIVED', label: 'Offer received' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'WITHDRAWN', label: 'Withdrawn' },
  ];

  const [isOpen, setIsOpen] = useState(false);

  const [filters, setFilters] = useState({
    dateRange: {
      fromDate: '',
      toDate: '',
    },
    amountRange: {
      minAmount: 0,
      maxAmount: 1000000,
    },
    status: [],
    clientIds: [],
    invoiceStatus: '',
  });

  const handleRangeChange = (newValues) => {
    setFilters((prev) => ({
      ...prev,
      amountRange: {
        minAmount: newValues[0], // Update minAmount
        maxAmount: newValues[1], // Update maxAmount
      },
    }));
  };

  //   hanlde close modal fn
  const onClose = () => {
    setFilters({
      dateRange: {
        fromDate: '',
        toDate: '',
      },
      amountRange: {
        minAmount: 0,
        maxAmount: 1000000,
      },
      status: [],
      clientIds: [],
      invoiceStatus: '',
    });
    setIsOpen(false);
  };

  const handleSubmit = () => {
    setFilterData((prevFilterData) => ({
      ...prevFilterData,
      ...filters, // Merge filters into the existing filterData
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border border-[#A5ABBD] hover:bg-neutral-600/10"
          size="sm"
        >
          <ListFilter size={14} />
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col justify-center gap-5">
        <DialogTitle>Filter</DialogTitle>

        <form className="flex flex-col gap-4">
          {/* select date filter */}
          <div className="flex flex-col gap-2">
            <span className="flex justify-between">
              <Label className="text-[#A5ABBD]">Select Date</Label>
              <span
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      fromDate: '',
                      toDate: '',
                    },
                  }));
                }}
                className="cursor-pointer text-xs font-bold text-primary hover:underline"
              >
                Clear
              </span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <DatePickers
                  selected={filters?.dateRange?.fromDate}
                  onChange={(date) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange,
                        fromDate: date,
                      },
                    }))
                  }
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="top-right"
                  placeholderText="From"
                />
                <CalendarDays className="absolute right-2 top-1/2 z-0 -translate-y-1/2 text-[#3F5575]" />
              </div>
              <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <DatePickers
                  selected={filters?.dateRange?.toDate}
                  onChange={(date) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange,
                        toDate: date,
                      },
                    }))
                  }
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="top-right"
                  placeholderText="To"
                />
                <CalendarDays className="absolute right-2 top-1/2 z-0 -translate-y-1/2 text-[#3F5575]" />
              </div>
            </div>
          </div>

          {/* select range amount */}
          <div className="flex flex-col gap-2">
            <span className="flex justify-between">
              <Label className="text-[#A5ABBD]">Select Amount Range</Label>
              <span
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    amountRange: {
                      ...prev.amountRange,
                      minAmount: 0,
                      maxAmount: 1000000,
                    },
                  }));
                }}
                className="cursor-pointer text-xs font-bold text-primary hover:underline"
              >
                Clear
              </span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              {/* Min Input */}
              <div className="relative flex items-center">
                <span className="absolute left-3">₹</span>
                <Input
                  className="pl-6 font-semibold"
                  type="number"
                  value={filters?.amountRange?.minAmount}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      amountRange: {
                        ...prev.amountRange,
                        minAmount: Number(e.target.value), // Update minAmount with the new value
                      },
                    }))
                  }
                  placeholder="Min"
                />
              </div>

              {/* Max Input */}
              <div className="relative flex items-center">
                <span className="absolute left-3">₹</span>
                <Input
                  className="pl-6 font-semibold"
                  type="number"
                  value={filters?.amountRange?.maxAmount}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      amountRange: {
                        ...prev.amountRange,
                        maxAmount: Number(e.target.value), // Update minAmount with the new value
                      },
                    }))
                  }
                  placeholder="Max"
                />
              </div>
            </div>

            {/* slider */}
            <div className="flex flex-col gap-2">
              <span className="flex justify-between">
                <span className="text-xs text-[#A5ABBD]">₹ 0</span>
                <span className="text-xs text-[#A5ABBD]">₹ 1,000,000</span>
              </span>
              {/* RangeSlider component */}
              <RangeSlider
                value={[
                  filters?.amountRange?.minAmount,
                  filters?.amountRange?.maxAmount,
                ]}
                onValueChange={handleRangeChange} // Handle slider change
                max={1000000} // Adjust according to your range scale (1,000,000)
                step={1}
              />
            </div>
          </div>

          {/* select status : multi select */}
          <div className="flex flex-col gap-2">
            <span className="flex justify-between">
              <Label className="text-[#A5ABBD]">Select Status</Label>
              <span
                onClick={() =>
                  setFilterData((prev) => ({ ...prev, status: [] }))
                }
                className="cursor-pointer text-xs font-bold text-primary hover:underline"
              >
                Clear
              </span>
            </span>
            <MultiSelect
              options={statusLists}
              onValueChange={setFilters}
              defaultValue={filters?.status}
              placeholder="Select Status"
              variant="inverted"
              animation={2}
              maxCount={3}
            />
            <div className="mt-4">
              <ul className="list-inside list-disc">
                {filters?.status?.map((status) => (
                  <li key={status}>{status}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* select invoice generated */}
          <div className="flex flex-col gap-2">
            <span className="flex justify-between">
              <Label className="text-[#A5ABBD]">Invoice Generated</Label>
              <span
                onClick={() =>
                  setFilterData((prev) => ({ ...prev, invoiceGenerated: '' }))
                }
                className="cursor-pointer text-xs font-bold text-primary hover:underline"
              >
                Clear
              </span>
            </span>
            <Select
              value={filters?.invoiceStatus}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, invoiceStatus: value }));
              }}
            >
              <SelectTrigger>
                <SelectValue className="text-[#A5ABBD]" placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="font-semibold">
                <SelectItem value="PARTIAL">Partially</SelectItem>
                <SelectItem value="INVOICED">Invoiced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* cta's */}
          <div className="flex justify-end gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-24 hover:bg-neutral-600/10"
              size="sm"
            >
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              className="w-24 bg-[#288AF9]"
              size="sm"
            >
              Apply
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;
