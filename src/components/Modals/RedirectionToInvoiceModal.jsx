'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

const RedirectionToInvoiceModal = ({
  cta,
  redirectPopupOnFail,
  setRedirectPopUpOnFail,
  order,
  setOrder,
  removeDraftFromSession,
}) => {
  const translations = useTranslations('components.redirection_pop_up');
  const [isOpen, setIsOpen] = useState(redirectPopupOnFail);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen((prev) => !prev);
        setRedirectPopUpOnFail(false);
        setOrder({
          ...order,
          selectedValue: null,
          buyerId: '',
        }); // Reset the buyerId, selectedValue in the order
        removeDraftFromSession(cta);
      }}
    >
      <DialogContent className="flex flex-col gap-2">
        <div className="flex flex-col gap-10 p-2">
          <span className="flex flex-col gap-1">{translations('para')}</span>
          <div className="flex justify-end gap-2">
            <Button
              className="w-36 bg-green-600 text-white hover:bg-green-700"
              onClick={() => {
                setIsOpen(false);
                setRedirectPopUpOnFail(false); // Reset the popup state
              }}
            >
              {translations('ctas.yes')}
            </Button>
            <Button
              variant="outline"
              className="w-36"
              onClick={() => {
                setIsOpen(false); // Close the dialog
                setRedirectPopUpOnFail(false); // Reset the popup state
                setOrder({
                  ...order,
                  selectedValue: null,
                  buyerId: '',
                }); // Reset the buyerId, selectedValue in the order
                removeDraftFromSession(cta);
              }}
            >
              {translations('ctas.no')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RedirectionToInvoiceModal;
