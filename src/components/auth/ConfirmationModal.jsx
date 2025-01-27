'use client';

import { Info } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';

const ConfirmationModal = ({ children, onProceed }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen((prev) => !prev);
        if (isOpen) {
          setIsOpen(false);
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex max-w-md flex-col justify-center gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-2 font-bold">
            <Info size={14} className="text-primary" /> Are you sure you want to
            skip?
          </h1>
          <p className="pl-6 text-sm text-black">
            In order to use the platform to its fullest extent, you need onboard
            your enterprise.
          </p>
        </div>

        <div className="flex w-full justify-end gap-2">
          <Button
            onClick={() => {
              setIsOpen(false);
            }}
            variant="outline"
            size="sm"
          >
            Not now
          </Button>
          <Button
            onClick={() => {
              onProceed();
            }}
            size="sm"
          >
            Yes, Skip
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
