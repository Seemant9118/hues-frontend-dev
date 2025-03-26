'use client';

import { Button } from '@/components/ui/button';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 border p-10 text-center">
          <h2 className="text-2xl font-bold">Oops, Something went wrong!</h2>
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
