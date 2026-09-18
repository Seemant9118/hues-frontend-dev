'use client';

import { ExternalLink, FileCheck, FileSignature } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SharedAgreementBottomCallout({
  isSigned,
  formattedSignedAt,
  pdfUrl,
  onOpenSignDialog,
}) {
  return (
    <div className="mt-10 border-t border-neutral-200 pt-6">
      {isSigned ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900">
                Agreement Verified & Signed
              </h4>
              <p className="text-xs text-emerald-700">
                Signature recorded on {formattedSignedAt}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600 text-white">
              Legally Recorded
            </Badge>
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
              >
                <ExternalLink size={12} />
                Download
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50/60 p-5 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FileSignature className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-800">
                Ready to sign this agreement?
              </h4>
              <p className="text-xs text-neutral-500">
                Your electronic signature is legally binding and will be
                attached to this document.
              </p>
            </div>
          </div>
          {onOpenSignDialog && (
            <Button
              type="button"
              onClick={onOpenSignDialog}
              className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
            >
              <FileSignature size={14} />
              Sign Agreement
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
