'use client';

import {
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileSignature,
  FileText,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SharedAgreementHeader({
  agreementTitle,
  enterpriseName,
  createdAt,
  isSigned,
  pdfUrl,
  onPrint,
  onOpenSignDialog,
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm print:hidden">
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-neutral-800">
              {agreementTitle}
            </h1>
            {isSigned ? (
              <Badge className="gap-1 border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                <CheckCircle2 size={12} />
                Signed
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 border-amber-300 bg-amber-50 text-amber-700"
              >
                <ShieldCheck size={12} />
                Signature Required
              </Badge>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
            <span className="flex items-center gap-1 font-medium text-neutral-600">
              <Building2 size={13} className="text-neutral-400" />
              {enterpriseName}
            </span>
            {createdAt && (
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-neutral-400" />
                {new Date(createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
            title="Open PDF in new tab"
          >
            <ExternalLink size={13} />
            <span>Open PDF</span>
          </a>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrint}
          className="gap-1.5 text-xs"
        >
          <Printer size={13} />
          <span>Print</span>
        </Button>
        {!isSigned && onOpenSignDialog && (
          <Button
            type="button"
            size="sm"
            onClick={onOpenSignDialog}
            className="gap-1.5 bg-blue-600 text-xs text-white shadow-sm hover:bg-blue-700"
          >
            <FileSignature size={13} />
            <span>Sign Agreement</span>
          </Button>
        )}
      </div>
    </header>
  );
}
