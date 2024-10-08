'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { LocalStorageService } from '@/lib/utils';
import { getClients } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ListFilter } from 'lucide-react';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
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
import MultiSelects from '../ui/MultiSelects';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { RangeSlider } from '../ui/RangeSlider';

const FilterModal = ({ tab, setFilterData }) => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [isOpen, setIsOpen] = useState(false);
  const [isFilteredApplied, setIsFilteredApplied] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: {
      fromDate: '',
      toDate: new Date(),
    },
    amountRange: {
      minAmount: 0,
      maxAmount: 1000000,
    },
    status: [],
    clientIds: [],
    invoiceStatus: null,
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
        toDate: new Date(),
      },
      amountRange: {
        minAmount: 0,
        maxAmount: 1000000,
      },
      status: [],
      clientIds: [],
      invoiceStatus: '',
    });
    setFilterData({
      page: 1,
      limit: 10,
    });
    setIsFilteredApplied(false);
    setIsOpen(false);
  };

  useEffect(() => {
    onClose();
  }, [tab]);

  const handleSubmit = () => {
    const formattedFilters = {
      ...filters,
      dateRange: {
        fromDate: filters.dateRange.fromDate
          ? moment(filters.dateRange.fromDate).format('YYYY/MM/DD')
          : null,
        toDate: filters.dateRange.toDate
          ? moment(filters.dateRange.toDate).format('YYYY/MM/DD')
          : null,
      },
    };
    setFilterData((prevFilterData) => ({
      ...prevFilterData,
      ...formattedFilters, // Merge formatted filters into the existing filterData
    }));
    setIsFilteredApplied(true);
    setIsOpen(false);
  };

  // options data: status
  const option = [
    { value: 'BID_SENT', label: 'Bid sent' },
    { value: 'BID_RECEIVED', label: 'Bid received' },
    { value: 'OFFER_SENT', label: 'Offer sent' },
    { value: 'OFFER_RECEIVED', label: 'Offer received' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'WITHDRAWN', label: 'Withdrawn' },
  ];
  // value : status
  const valueStatus = filters.status.map((status) => ({
    value: status,
    label: option.find((opt) => opt.value === status)?.label,
  }));
  // hanlderChangeFn : status
  const handleChangeForStatus = (value) => {
    // Update filters with new status values
    setFilters((prevFilters) => ({
      ...prevFilters,
      status: value ? value.map((item) => item.value) : [], // Map selected options to their values
    }));
  };

  // get clients
  const { data: clientData } = useQuery({
    queryKey: [clientEnterprise.getClients.endpointKey],
    queryFn: () => getClients(enterpriseId),
    select: (res) => res.data.data,
  });
  // flatten array to get exact data
  let formattedData = [];
  if (clientData) {
    formattedData = clientData.flatMap((user) => {
      let userDetails;
      if (user.client && user?.client?.name !== null) {
        userDetails = { ...user.client };
      } else {
        userDetails = { ...user?.invitation?.userDetails };
      }

      return {
        ...userDetails,
        id: user.id,
        invitationId: user.invitation?.id,
        invitationStatus: user.invitation?.status,
      };
    });
  }
  // options data : clients
  const updatedData = formattedData.map((item) => {
    return {
      value: item.id,
      label: item.name,
    };
  });
  // value : client
  const valueClient = filters.clientIds.map((client) => ({
    value: client,
    label: updatedData.find((opt) => opt.value === client)?.label,
  }));
  // handlerChangeFn : clients
  const handleChangeForClient = (value) => {
    // Update filters with new status values
    setFilters((prevFilters) => ({
      ...prevFilters,
      clientIds: value ? value.map((item) => item.value) : [], // Map selected options to their values
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={
            isFilteredApplied
              ? 'border border-[#A5ABBD] font-bold text-[#288AF9] hover:bg-neutral-600/10'
              : 'border border-[#A5ABBD] hover:bg-neutral-600/10'
          }
          size="sm"
        >
          <ListFilter size={14} />
          <span>Filter</span>
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
                      toDate: new Date(),
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

          {/* select status : multi select  */}
          <div className="flex flex-col gap-2">
            <span className="flex justify-between">
              <Label className="text-[#A5ABBD]">Select Status</Label>
              <span
                onClick={() => setFilters((prev) => ({ ...prev, status: [] }))}
                className="cursor-pointer text-xs font-bold text-primary hover:underline"
              >
                Clear
              </span>
            </span>
            <MultiSelects
              placeholder="Select status..."
              option={option}
              value={valueStatus}
              handleChange={handleChangeForStatus}
            />
          </div>

          {/* select client : multi select */}
          <div className="flex flex-col gap-2">
            <span className="flex justify-between">
              <Label className="text-[#A5ABBD]">Select Client</Label>
              <span
                onClick={() =>
                  setFilters((prev) => ({ ...prev, clientIds: [] }))
                }
                className="cursor-pointer text-xs font-bold text-primary hover:underline"
              >
                Clear
              </span>
            </span>
            <MultiSelects
              placeholder="Select client..."
              option={updatedData}
              value={valueClient}
              handleChange={handleChangeForClient}
            />
          </div>

          {/* select invoice generated */}
          <div className="flex flex-col gap-2">
            <span className="flex justify-between">
              <Label className="text-[#A5ABBD]">Invoice Generated</Label>
              <span
                onClick={() =>
                  setFilters((prev) => ({ ...prev, invoiceStatus: '' }))
                }
                className="cursor-pointer text-xs font-bold text-primary hover:underline"
              >
                Clear
              </span>
            </span>
            <RadioGroup
              className="flex gap-4"
              value={filters.invoiceStatus}
              onValueChange={(value) => {
                setFilters((prevFilters) => ({
                  ...prevFilters,
                  invoiceStatus: value, // Update the invoiceGenerated field with the selected value
                }));
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true" />
                <span className="text-sm">True</span>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" />
                <span className="text-sm">False</span>
              </div>
            </RadioGroup>
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
