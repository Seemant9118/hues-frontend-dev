'use client';

/* eslint-disable react/no-array-index-key */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function VerifyDetailsModal({
  open,
  onOpenChange,
  title,
  givenDetails,
  apiResponse,
}) {
  // Parse apiResponse if it's a string
  let parsedApiResponse = apiResponse;
  try {
    if (typeof apiResponse === 'string') {
      parsedApiResponse = JSON.parse(apiResponse);
    }
  } catch (err) {
    parsedApiResponse = { error: 'Invalid JSON string' };
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {title || 'Not verified'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Given details */}
          <p className="mb-3 text-sm font-semibold text-muted-foreground">
            Given details
          </p>
          <div className="rounded-md border bg-white p-4 shadow-sm">
            {givenDetails && (
              <div className="grid grid-cols-2 gap-1">
                {givenDetails?.map((detail, idx) => (
                  <div key={idx}>
                    <p className="text-xs text-muted-foreground">
                      {detail?.label}
                    </p>
                    <p className="text-lg font-semibold">{detail?.value}</p>
                  </div>
                ))}
              </div>
            )}
            {!givenDetails && (
              <div>Manually added, Verification Data not available</div>
            )}
          </div>

          {/* API Response */}
          {apiResponse && (
            <div className="rounded-md bg-black p-4 font-mono text-sm text-white">
              <p className="sticky top-0 z-20 mb-2 bg-black text-xs text-muted-foreground">
                API Verification Response
              </p>

              {/* Scrollable container */}
              <div className="darkScrollBarStyles max-h-[300px] overflow-auto rounded-md p-2">
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(parsedApiResponse, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
