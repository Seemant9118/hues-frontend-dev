'use client';

import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeftCircle } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <ShieldAlert className="mb-4 h-14 w-14 text-red-500" />
      <h1 className="mb-2 text-2xl font-bold text-gray-800">Access Denied</h1>
      <p className="mb-6 max-w-md text-gray-600">
        You don’t have permission to view this page. This could be due to one of
        the following reasons:
      </p>

      <ul className="mb-6 max-w-md list-inside list-disc text-left text-gray-600">
        <li>Your account doesn’t have the required role or access rights.</li>
        <li>You may have followed a broken or outdated link.</li>
        <li>Your session might have expired — try logging in again.</li>
      </ul>

      <div className="flex gap-4">
        <Link href="/dashboard">
          <Button size="sm" className="inline-flex items-center gap-2 rounded">
            <ArrowLeftCircle className="h-5 w-5" />
            Back to Dashboard
          </Button>
        </Link>
        <Link href="/support">
          <Button
            size="sm"
            variant="outline"
            className="inline-flex items-center gap-2 rounded bg-gray-200"
          >
            Need Help?
          </Button>
        </Link>
      </div>
    </div>
  );
}
