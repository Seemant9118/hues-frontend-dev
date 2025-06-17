/* eslint-disable no-return-assign */

'use client';

import { Button } from '@/components/ui/button';
import { LocalStorageService } from '@/lib/utils';

export default function Unauthorized() {
  const userId = LocalStorageService.get('user_profile');
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 border p-10 text-center">
      <h2 className="text-2xl font-bold">Unauthorized Page</h2>
      <p>🚫 You are not authorized to view this page</p>
      <Button
        size="sm"
        onClick={() => {
          if (userId) {
            window.location.href = '/dashboard';
          } else {
            window.location.href = '/';
          }
        }}
      >
        Back to Dashboard
      </Button>
    </div>
  );
}
