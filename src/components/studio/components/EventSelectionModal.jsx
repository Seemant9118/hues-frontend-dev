'use client';

import React from 'react';
import { ArrowRight, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function EventSelectionModal({
  pendingEventTarget,
  onClose,
  onConnectNodes,
}) {
  return (
    <Dialog
      open={Boolean(pendingEventTarget)}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <LinkIcon className="h-4 w-4 text-indigo-600" />
            Select Transition Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <p className="text-muted-foreground">
            Select transition condition from{' '}
            <strong className="font-mono text-gray-900">
              {pendingEventTarget?.sourceId}
            </strong>{' '}
            to{' '}
            <strong className="font-mono text-gray-900">
              {pendingEventTarget?.targetId}
            </strong>
            :
          </p>

          <div className="flex flex-col gap-2">
            {pendingEventTarget?.availableEvents?.map((eventOn) => (
              <Button
                key={eventOn}
                variant="outline"
                className="justify-start font-mono text-xs hover:bg-indigo-50 hover:text-indigo-700"
                onClick={() =>
                  onConnectNodes(
                    pendingEventTarget.sourceId,
                    pendingEventTarget.targetId,
                    eventOn,
                  )
                }
              >
                <ArrowRight className="mr-2 h-3.5 w-3.5 text-indigo-600" />
                On Event: <strong>{eventOn}</strong>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
