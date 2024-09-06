/* eslint-disable radix */

'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggler';
import ErrorBox from '../ui/ErrorBox';

const CollectPaymentModal = () => {
  const totalPayable = 400; // Assuming the total payable amount is fixed
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(totalPayable);
  const [paymentType, setPaymentType] = useState('invoiced'); // Default to 'invoiced'
  const [isInvalidAmt, setIsInvalidAmt] = useState('');

  const handleChange = (e) => {
    const { value } = e.target;

    // Ensure that the input value doesn't exceed the total payable amount
    if (parseInt(value) > totalPayable) {
      setAmount(value);
      setIsInvalidAmt('Amount will not be exeecded with Total Payble Amount');
    } else {
      setIsInvalidAmt('');
    }
    setAmount(value);

    // Switch to 'partial' if the amount is less than the total payable, else 'invoiced'
    if (parseInt(value) < totalPayable || value === '') {
      setPaymentType('partial');
    } else {
      setPaymentType('invoiced');
    }
  };

  useEffect(() => {
    // Whenever the modal opens, default to 'invoiced' if the amount is equal to total payable
    if (amount === totalPayable.toString()) {
      setPaymentType('invoiced');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="border border-[#39C06F] bg-[#39C06F1A] text-[#39C06F] hover:bg-[#39C06F] hover:text-white">
          Collect Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-w-[20rem] flex-col justify-center gap-5 text-sm">
        <span className="flex gap-2 font-bold text-[#2F4858]">
          Total Payable :{' '}
          <span className="text-[#363940]">₹{totalPayable}</span>
        </span>
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#2F4858]">Payment : </span>

          <ToggleGroup
            variant="outline"
            type="single"
            className="gap-2"
            value={paymentType} // Control the value with state
            onValueChange={(value) => setPaymentType(value)} // Handle changes
          >
            <ToggleGroupItem
              value="invoiced"
              aria-label="Toggle invoiced"
              className="w-24 rounded-lg border bg-white px-4 py-2 text-black hover:bg-blue-400 hover:text-white data-[state=on]:bg-primary data-[state=on]:text-white"
            >
              Invoiced
            </ToggleGroupItem>
            <ToggleGroupItem
              value="partial"
              aria-label="Toggle partial"
              className="w-24 rounded-lg border bg-white px-4 py-2 text-black hover:bg-blue-400 hover:text-white data-[state=on]:bg-primary data-[state=on]:text-white"
            >
              Partial
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 transform">
            ₹
          </span>
          <Input
            type="number"
            placeholder="payable amount"
            value={amount}
            onChange={handleChange}
            className="pl-10 text-center" // Adjust padding-left to avoid overlap
          />
        </div>
        {isInvalidAmt && <ErrorBox msg={isInvalidAmt} />}
        <div className="mt-auto h-[1px] bg-neutral-300"></div>
        <Button disabled={isInvalidAmt}>Collect Payment</Button>
      </DialogContent>
    </Dialog>
  );
};

export default CollectPaymentModal;
