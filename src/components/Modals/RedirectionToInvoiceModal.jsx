'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import React, { useEffect, useState } from 'react';

const RedirectionToInvoiceModal = ({
  redirectPopupOnFail,
  setIsCreatingSales,
  setIsCreatingInvoice,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Use useEffect to update isOpen state when redirectPopupOnFail changes
  useEffect(() => {
    setIsOpen(redirectPopupOnFail);
  }, [redirectPopupOnFail]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="flex flex-col gap-2">
        <div className="flex flex-col gap-10 p-2">
          <span className="flex flex-col gap-1">
            This enterprise has not accepted your invitation and will not be
            able to accept your offer. But You can create an invoice instead.
            Proceed ?
          </span>
          <div className="flex justify-end gap-2">
            <Button
              className="w-36 bg-green-600 text-white hover:bg-green-700"
              onClick={() => {
                setIsCreatingSales(false);
                setIsCreatingInvoice(true);
              }}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              className="w-36"
              onClick={() => {
                setIsOpen(false);
                setIsCreatingSales(false);
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
