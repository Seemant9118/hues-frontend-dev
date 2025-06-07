/* eslint-disable react/no-array-index-key */

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function VerifyDetailsModal({
  open,
  onOpenChange,
  title = '',
  givenDetails = [],
  apiResponse = {},
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Given details */}
          <div className="rounded-md border bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-muted-foreground">
              Given details
            </p>
            <div className="grid grid-cols-2 gap-4">
              {givenDetails.map((detail, idx) => (
                <div key={idx}>
                  <p className="text-xs text-muted-foreground">
                    {detail.label}
                  </p>
                  <p className="text-lg font-semibold">{detail.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* API Response */}
          <div className="max-h-[300px] overflow-auto rounded-md bg-black p-4 font-mono text-sm text-white">
            <p className="mb-2 text-xs text-muted-foreground">
              API Verification Response
            </p>
            <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
