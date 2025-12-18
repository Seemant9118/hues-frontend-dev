'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';

export const DeliveryResultDialog = ({ open, type, onClose, id }) => {
  const queryClient = useQueryClient();
  const hasInvalidatedRef = useRef(false);

  const isAccepted = type === 'ACCEPTED';

  useEffect(() => {
    if (!open || !type) return;

    // invalidate ONLY once when dialog opens
    if (!hasInvalidatedRef.current) {
      queryClient.invalidateQueries([deliveryProcess.getPODbyId.endpoint, id]);
      hasInvalidatedRef.current = true;
    }

    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    // eslint-disable-next-line consistent-return
    return () => clearTimeout(timer);
  }, [open, type, id, onClose, queryClient]);

  // reset ref when dialog closes
  useEffect(() => {
    if (!open) {
      hasInvalidatedRef.current = false;
    }
  }, [open]);

  // ✅ JSX conditional rendering (SAFE)
  if (!type) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0">
        <div
          className={`flex flex-col items-center justify-center gap-2 rounded-lg p-10 text-center ${
            isAccepted ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <div className="mb-6 flex justify-center">
            <div
              className={`rounded-full p-5 ${
                isAccepted ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {isAccepted ? (
                <CheckCircle className="h-12 w-12 text-green-600" />
              ) : (
                <XCircle className="h-12 w-12 text-red-500" />
              )}
            </div>
          </div>

          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {isAccepted ? 'Delivery Confirmed' : 'Delivery Rejected'}
            </DialogTitle>
          </DialogHeader>

          <p className="mt-3 text-sm text-muted-foreground">
            {isAccepted
              ? 'Delivery confirmed and recorded successfully. The vendor has been notified.'
              : 'Delivery has been rejected. The vendor has been notified.'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
