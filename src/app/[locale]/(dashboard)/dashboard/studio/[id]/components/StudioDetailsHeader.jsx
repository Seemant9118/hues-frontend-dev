'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import SubHeader from '@/components/ui/Sub-header';

export default function StudioDetailsHeader({ titleName, onBackClick }) {
  const router = useRouter();

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onBackClick || (() => router.push('/dashboard/studio'))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-100"
          title="Back to Studio"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <SubHeader name={`${titleName}`} />
          <p className="text-xs text-neutral-500">
            Design and manage automated approval and action workflows.
          </p>
        </div>
      </div>
    </div>
  );
}
