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
import { RangeSlider } from '../ui/RangeSlider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const FilterModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterData, setFilterData] = useState({
    fromDate: null,
    toDate: null,
    selectedRangeValues: [0, 1000000],
    status: '',
    client: '',
    invoiceGenerated: '',
  });

  const handleRangeChange = (newValues) => {
    setFilterData((prev) => ({
      ...prev,
      selectedRangeValues: newValues, // Update in filterData
    }));
  };

  //   hanlde close modal fn
  const onClose = () => {
    setFilterData({
      fromDate: null,
      toDate: null,
      selectedRangeValues: [0, 1000000],
      status: '',
      client: '',
      invoiceGenerated: '',
    });
    setIsOpen(false);
  };

  const handleSubmit = () => {
    // console.log(filterData);
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
                  setFilterData((prev) => ({
                    ...prev,
                    fromDate: null,
                    toDate: null,
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
                  selected={filterData.fromDate}
                  onChange={(date) =>
                    setFilterData((prev) => ({ ...prev, fromDate: date }))
                  }
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="top-right"
                  placeholderText="From"
                />
                <CalendarDays className="absolute right-2 top-1/2 z-0 -translate-y-1/2 text-[#3F5575]" />
              </div>
              <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <DatePickers
                  selected={filterData.toDate}
                  onChange={(date) =>
                    setFilterData((prev) => ({ ...prev, toDate: date }))
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
                  setFilterData((prev) => ({
                    ...prev,
                    selectedRangeValues: [0, 1000000],
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
                  value={filterData.selectedRangeValues[0]}
                  onChange={(e) =>
                    setFilterData((prev) => ({
                      ...prev,
                      selectedRangeValues: [
                        Number(e.target.value),
                        filterData.selectedRangeValues[1],
                      ],
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
                  value={filterData.selectedRangeValues[1]}
                  onChange={(e) =>
                    setFilterData((prev) => ({
                      ...prev,
                      selectedRangeValues: [
                        filterData.selectedRangeValues[0],
                        Number(e.target.value),
                      ],
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
                value={filterData.selectedRangeValues}
                onValueChange={handleRangeChange} // Handle slider change
                max={1000000} // Adjust according to your range scale (1,000,000)
                step={1}
              />
            </div>
          </div>

          {/* select status */}
          <div className="flex flex-col gap-2">
            <span className="flex justify-between">
              <Label className="text-[#A5ABBD]">Select Status</Label>
              <span
                onClick={() =>
                  setFilterData((prev) => ({ ...prev, status: '' }))
                }
                className="cursor-pointer text-xs font-bold text-primary hover:underline"
              >
                Clear
              </span>
            </span>
            <Select
              value={filterData.status}
              onValueChange={(value) => {
                setFilterData((prev) => ({ ...prev, status: value }));
              }}
            >
              <SelectTrigger>
                <SelectValue
                  className="text-[#A5ABBD]"
                  placeholder="Select status"
                />
              </SelectTrigger>
              <SelectContent className="font-semibold">
                <SelectItem value="status1">status1</SelectItem>
                <SelectItem value="status2">status2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* select client */}
          <div className="flex flex-col gap-2">
            <span className="flex justify-between">
              <Label className="text-[#A5ABBD]">Select Client</Label>
              <span
                onClick={() =>
                  setFilterData((prev) => ({ ...prev, client: '' }))
                }
                className="cursor-pointer text-xs font-bold text-primary hover:underline"
              >
                Clear
              </span>
            </span>
            <Select
              value={filterData.client}
              onValueChange={(value) => {
                setFilterData((prev) => ({ ...prev, client: value }));
              }}
            >
              <SelectTrigger>
                <SelectValue
                  className="text-[#A5ABBD]"
                  placeholder="Select Client"
                />
              </SelectTrigger>
              <SelectContent className="font-semibold">
                <SelectItem value="client1">client1</SelectItem>
                <SelectItem value="client2">client2</SelectItem>
              </SelectContent>
            </Select>
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
              value={filterData.invoiceGenerated}
              onValueChange={(value) => {
                setFilterData((prev) => ({ ...prev, invoiceGenerated: value }));
              }}
            >
              <SelectTrigger>
                <SelectValue className="text-[#A5ABBD]" placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="font-semibold">
                <SelectItem value="partially">partially</SelectItem>
                <SelectItem value="complete">complete</SelectItem>
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
