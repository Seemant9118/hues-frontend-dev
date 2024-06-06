'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Check } from 'lucide-react';
import { useState } from 'react';

const SuccessModal = ({ children, cta, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen((prev) => !prev);
        if (isOpen) {
          onClose();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col justify-center gap-5">
        <div className="flex max-w-fit items-center justify-center rounded-full bg-green-500 p-2 text-white">
          <Check />
        </div>
        <div>
          <h3 className="text-2xl font-bold leading-8">
            {cta === 'offer-confirmation'
              ? 'Offer Accepted'
              : 'Congratulations'}
          </h3>
          <p className="font-medium text-grey">
            {cta === 'offer-confirmation'
              ? 'Your accepted your offer from Micheal Clark'
              : 'Your order has been successfully created'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
