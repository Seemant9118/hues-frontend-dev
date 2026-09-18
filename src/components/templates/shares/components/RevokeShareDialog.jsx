'use client';

import { AlertTriangle } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function RevokeShareDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isRevoking,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl">
        <DialogHeader className="gap-2 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle className="text-base font-bold text-neutral-800">
            Revoke Shared Form Link?
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-neutral-500">
            Are you sure you want to revoke this link? Anyone attempting to open
            or submit responses with this link will immediately encounter an
            &quot;Unavailable&quot; error. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex items-center justify-end gap-2 border-t border-neutral-100 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isRevoking}
            onClick={onConfirm}
          >
            {isRevoking ? 'Revoking...' : 'Confirm Revoke'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
