'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftCircle, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';

const AccessDenied = ({
  title = 'Access Denied',
  message = 'You don’t have permission to view this page. This could be due to one of the following reasons:',
  reasons = [
    'Your account doesn’t have the required role or access rights.',
    'You may have followed a broken or outdated link.',
    'Your session might have expired — try logging in again.',
  ],
}) => {
  return (
    <div className="flex min-h-[80vh] w-full flex-col items-center justify-center bg-background px-4 py-12 text-center sm:px-6 lg:px-8">
      <div className="max-w-md space-y-8">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-50 p-6 shadow-sm">
            <ShieldAlert className="h-12 w-12 animate-pulse text-red-600" />
          </div>
        </div>
        <div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg text-gray-600">{message}</p>
        </div>

        {reasons && reasons.length > 0 && (
          <div className="mt-8 rounded-xl border border-red-100 bg-red-50/30 p-6 text-left shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-red-800">
              Possible Reasons
            </h3>
            <ul className="space-y-3">
              {reasons.map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  <span className="text-sm leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/dashboard">
            <Button size="sm">
              <ArrowLeftCircle className="h-5 w-5" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/support">
            <Button size="sm" variant="outline">
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
