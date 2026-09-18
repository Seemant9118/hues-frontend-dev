'use client';

import { Button } from '@/components/ui/button';
import { Ban, RefreshCcw } from 'lucide-react';
import React from 'react';

export default function SharedResourceUnavailable({ message }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-sm">
        <Ban className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-xl font-bold text-neutral-800 sm:text-2xl">
        This Shared Link is Unavailable
      </h2>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-neutral-500 sm:text-sm">
        {message ||
          'The link you are trying to access might have expired, been revoked by the sender, or does not exist.'}
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          onClick={() => window.location.reload()}
          size="sm"
          variant="outline"
        >
          <RefreshCcw size={14} />
          Try Again
        </Button>
      </div>
    </div>
  );
}
