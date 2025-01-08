'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import React, { useState } from 'react';

const RedirectionToInvoiceModal = ({
  redirectPopupOnFail,
  setRedirectPopUpOnFail,
  setSelectedValue,
  setOrder,
}) => {
  const [isOpen, setIsOpen] = useState(redirectPopupOnFail);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen((prev) => !prev);
        setRedirectPopUpOnFail(false);
        setSelectedValue(''); // Clear the selected value
        setOrder((prev) => ({
          ...prev,
          buyerId: '',
        }));
      }}
    >
      <DialogContent className="flex flex-col gap-2">
        <div className="flex flex-col gap-10 p-2">
          <span className="flex flex-col gap-1">
            This enterprise has not accepted your invitation and will not be
            able to respond your offer. Do you want to proceed?
          </span>
          <div className="flex justify-end gap-2">
            <Button
              className="w-36 bg-green-600 text-white hover:bg-green-700"
              onClick={() => {
                setIsOpen(false);
                setRedirectPopUpOnFail(false); // Reset the popup state
              }}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              className="w-36"
              onClick={() => {
                setIsOpen(false); // Close the dialog
                setRedirectPopUpOnFail(false); // Reset the popup state
                setSelectedValue(''); // Clear the selected value
                setOrder((prev) => ({
                  ...prev,
                  buyerId: '',
                }));
              }}
            >
              No
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RedirectionToInvoiceModal;
