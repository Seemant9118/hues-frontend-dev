import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React from 'react';
import EmptyImage from '../../../public/Empty.png';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';

const AlertBox = ({ isAlertShow, infoText, onClose }) => {
  return (
    <Dialog open={isAlertShow} onOpenChange={onClose}>
      <DialogTrigger className="hidden" />{' '}
      {/* Hidden trigger to manage Radix UI logic */}
      <DialogContent>
        <div className="flex flex-col items-center justify-center gap-2">
          <Image src={EmptyImage} alt="emtpy-icon" />
          <span className="text-xl font-semibold">{infoText}</span>
        </div>
        <div className="flex w-full flex-col items-end gap-2">
          <Button size="sm" onClick={onClose}>
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlertBox;
