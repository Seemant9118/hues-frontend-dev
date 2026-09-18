'use client';

import { CheckCircle2 } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';

export default function SharedAgreementCapturedBanner({
  agreementTitle,
  enterpriseName,
  formattedSignedAt,
}) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 shadow-sm transition-all animate-in fade-in slide-in-from-top-3 print:border-neutral-200 print:bg-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shadow-sm print:hidden">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-emerald-950">
                Signature Captured Successfully
              </h2>
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                Legally Recorded & Verified
              </Badge>
            </div>
            <p className="text-xs leading-relaxed text-emerald-800">
              Your electronic signature for{' '}
              <span className="font-semibold text-emerald-950">
                {agreementTitle}
              </span>{' '}
              has been securely recorded and verified. The agreement is legally
              completed and archived.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 text-[11px] text-emerald-700">
              <span>
                <strong className="font-semibold text-emerald-900">
                  Signed At:
                </strong>{' '}
                {formattedSignedAt}
              </span>
              <span>•</span>
              <span>
                <strong className="font-semibold text-emerald-900">
                  Legal Status:
                </strong>{' '}
                Legally Binding Electronic Signature
              </span>
              <span>•</span>
              <span>
                <strong className="font-semibold text-emerald-900">
                  Offered By:
                </strong>{' '}
                {enterpriseName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
