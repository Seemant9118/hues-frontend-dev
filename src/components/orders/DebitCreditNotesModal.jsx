'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

const NoteForm = ({ noteType, placeholder }) => (
  <div>
    <DialogHeader className="text-lg font-bold">{noteType} Note</DialogHeader>
    <div className="mt-4 flex flex-col gap-2">
      <Label className="font-bold text-[#363940]">Amount</Label>
      <div className="relative font-bold">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 transform">
          ₹
        </span>
        <Input
          name="amount"
          type="number"
          id="amount"
          className="pl-8"
          onChange={() => {}}
          placeholder={`${noteType} Amount`}
        />
      </div>
      <Label className="font-bold">Reason</Label>
      <Textarea placeholder={placeholder}></Textarea>
    </div>
  </div>
);

const DebitCreditNotesModal = ({ isDebitNoteRaised }) => {
  const [isOpen, setIsOpen] = useState(false);

  const noteType = isDebitNoteRaised ? 'Debit' : 'Credit';
  const buttonLabel = `${noteType} Note Raised`;
  const actionLabel = `Generate ${isDebitNoteRaised ? 'Credit' : 'Debit'} Note`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="border border-[#F16B6B] bg-[#F16B6B1A] font-semibold text-[#F16B6B] hover:bg-[#F16B6B] hover:text-white">
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex w-[28rem] flex-col justify-center gap-5 text-[#2F4858]">
        <NoteForm noteType={noteType} placeholder={`Reason`} />
        <div className="flex gap-2">
          <Button variant="outline" className="w-1/3 border-2 text-grey">
            Cancel
          </Button>
          <Button className="w-2/3 bg-[#288AF9]">{actionLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DebitCreditNotesModal;
