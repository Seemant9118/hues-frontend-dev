/* eslint-disable no-return-assign */

'use client';

import { Button } from '@/components/ui/button';

export default function Unauthorized() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 border p-10 text-center">
      <h2 className="text-2xl font-bold">Unauthorized Page</h2>
      <p>🚫 You are not authorized to view this page</p>
      <Button size="sm" onClick={() => (window.location.href = '/')}>
        Back to Dashboard
      </Button>
    </div>
  );
}
