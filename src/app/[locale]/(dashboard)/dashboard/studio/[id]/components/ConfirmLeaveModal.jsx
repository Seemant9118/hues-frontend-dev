'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ConfirmLeaveModal({
  isOpen,
  onOpenChange,
  onConfirmLeave,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-red-600">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Discard Unsaved Workflow Changes?
          </DialogTitle>
          <DialogDescription className="pt-2 text-xs text-neutral-600">
            You have unsaved changes in this workflow canvas. If you leave now,
            any new steps or configurations will be lost. Do you want to leave
            without saving?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end gap-2 border-t pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            No, Stay & Edit
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="font-bold"
            onClick={onConfirmLeave}
          >
            Yes, Discard & Leave
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
