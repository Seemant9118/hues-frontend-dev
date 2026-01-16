'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const RejectReasonModal = ({ open, setOpen, onConfirm }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason);
    setReason('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reason for rejecting this delivery</DialogTitle>
        </DialogHeader>

        <Textarea
          placeholder="Enter rejection reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <DialogFooter className="mt-4">
          <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={!reason.trim()}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectReasonModal;
