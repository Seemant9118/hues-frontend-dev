'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@radix-ui/react-label';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

const DebitNoteModal = ({ cta }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {cta === 'accept' ? (
          <Button size="sm" className="bg-[#288AF9]">
            Accept & create credit note
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="border border-[#F04949] text-[#F04949] hover:bg-[#F04949] hover:text-white"
          >
            Reject
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex flex-col justify-center gap-5">
        {cta === 'accept' && (
          <>
            <DialogHeader className="text-lg font-bold">
              Accept and create a credit note
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between gap-6">
                <div className="flex w-1/2 flex-col gap-2">
                  <div>
                    <Label className="flex-shrink-0 font-semibold">
                      Credit Amount
                    </Label>{' '}
                    <span className="text-red-600">*</span>
                  </div>

                  <Input
                    type="number"
                    name="amount"
                    className="max-w-md rounded-sm"
                  />
                </div>

                <div className="flex w-1/2 flex-col gap-2">
                  <Label className="flex-shrink-0 font-semibold">Balance</Label>{' '}
                  <Input
                    type="number"
                    name="amount"
                    className="max-w-md rounded-sm"
                    disabled
                  />
                </div>
              </div>

              <div className="flex w-full flex-col gap-2">
                <div>
                  <Label className="flex-shrink-0 font-semibold">Remark</Label>{' '}
                  <span className="text-red-600">*</span>
                </div>
                <Textarea className="w-full rounded-sm" />
              </div>

              <div className="flex justify-end gap-4">
                <Button size="sm" variant="outline" className="font-bold">
                  Discard
                </Button>
                <Button size="sm" className="bg-[#288AF9]">
                  Create
                </Button>
              </div>
            </div>
          </>
        )}

        {cta === 'reject' && (
          <>
            <DialogHeader className="text-lg font-bold">
              Reject debit note
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex w-full flex-col gap-2">
                <div>
                  <Label className="flex-shrink-0 text-sm font-semibold">
                    Reason for rejection
                  </Label>{' '}
                  <span className="text-red-600">*</span>
                </div>
                <Textarea className="w-full rounded-sm" />
              </div>

              <div className="flex justify-end gap-4">
                <Button size="sm" variant="outline" className="font-bold">
                  Discard
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-[#F04949] text-white hover:bg-red-600 hover:text-white"
                >
                  Reject
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DebitNoteModal;
