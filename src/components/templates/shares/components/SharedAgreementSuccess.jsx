'use client';

import {
  CheckCircle2,
  ExternalLink,
  FileCheck,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

export default function SharedAgreementSuccess({
  agreementData,
  signedResult,
  onViewDocument,
}) {
  const agreementTitle =
    agreementData?.name || agreementData?.title || 'Agreement';
  const signedAt =
    signedResult?.signedAt ||
    agreementData?.signedAt ||
    new Date().toISOString();

  const pdfUrl =
    signedResult?.signedDocumentUrl ||
    signedResult?.agreement?.signedDocumentUrl ||
    agreementData?.signedDocumentUrl ||
    agreementData?.generatedDocumentUrl ||
    agreementData?.agreement?.signedDocumentUrl ||
    agreementData?.agreement?.generatedDocumentUrl;

  const formattedDate = new Date(signedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm duration-300 animate-in zoom-in-50">
        <CheckCircle2 className="h-10 w-10" />
      </div>

      <h1 className="mt-6 text-2xl font-bold text-neutral-800">
        Agreement Signed Successfully
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Your electronic signature for{' '}
        <span className="font-semibold text-neutral-700">{agreementTitle}</span>{' '}
        has been securely recorded and verified.
      </p>

      {/* Certificate details card */}
      <div className="mt-6 w-full rounded-2xl border border-neutral-200 bg-white p-6 text-left shadow-sm">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Signature Confirmation Details</span>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-neutral-400">Document</dt>
            <dd className="mt-0.5 truncate font-semibold text-neutral-800">
              {agreementTitle}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-400">Signed At</dt>
            <dd className="mt-0.5 font-semibold text-neutral-800">
              {formattedDate}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-400">Legal Status</dt>
            <dd className="mt-0.5 inline-flex items-center gap-1 font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Legally Binding Electronic Signature
            </dd>
          </div>
          <div>
            <dt className="text-neutral-400">Offered By</dt>
            <dd className="mt-0.5 font-semibold text-neutral-800">
              {agreementData?.enterprise?.name ||
                agreementData?.enterpriseName ||
                'Verified Enterprise'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 print:hidden">
        {onViewDocument && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onViewDocument}
            className="gap-1.5"
          >
            <FileCheck size={14} />
            Review Agreement
          </Button>
        )}
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            <ExternalLink size={14} />
            Download PDF
          </a>
        )}
        <Button
          type="button"
          size="sm"
          onClick={handlePrint}
          className="gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800"
        >
          <Printer size={14} />
          Print / Save Copy
        </Button>
      </div>

      <p className="mt-8 text-[11px] text-neutral-400">
        A signed digital copy has been securely recorded. You may close this
        window or keep a printed copy for your records.
      </p>
    </div>
  );
}
