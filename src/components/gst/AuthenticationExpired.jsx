'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';

const AuthenticationExpiredModal = ({
  open,
  onClose,
  handleGenerateOTP,
  requestOTPMutation,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>

          <DialogTitle className="flex w-full items-center justify-center text-lg font-bold">
            Authentication Expired
          </DialogTitle>

          <DialogDescription className="text-center">
            Your GST authentication has expired. Please authenticate yourself to
            access GSTR-1 data.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={requestOTPMutation?.isPending}
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleGenerateOTP}
            disabled={requestOTPMutation?.isPending}
          >
            {requestOTPMutation?.isPending
              ? 'Generating OTP...'
              : 'Generate OTP'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthenticationExpiredModal;
