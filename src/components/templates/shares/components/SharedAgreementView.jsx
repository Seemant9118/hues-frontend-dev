'use client';

import React, { useEffect, useRef, useState } from 'react';

import SharedAgreementBottomCallout from '@/components/templates/shares/components/SharedAgreementBottomCallout';
import SharedAgreementCapturedBanner from '@/components/templates/shares/components/SharedAgreementCapturedBanner';
import SharedAgreementHeader from '@/components/templates/shares/components/SharedAgreementHeader';
import SharedAgreementPdfViewer from '@/components/templates/shares/components/SharedAgreementPdfViewer';
import SharedAgreementSignDialog from '@/components/templates/shares/components/SharedAgreementSignDialog';

export default function SharedAgreementView({
  agreementData,
  signedResult,
  onSignAgreement,
  isSigning = false,
}) {
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const containerRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(700);

  const agreementTitle =
    agreementData?.name ||
    agreementData?.title ||
    agreementData?.agreement?.name ||
    'Agreement Document';

  const enterpriseName =
    agreementData?.enterprise?.name ||
    agreementData?.enterpriseName ||
    agreementData?.agreement?.enterprise?.name ||
    'Issuing Enterprise';

  const isSigned =
    !!agreementData?.isSigned ||
    !!agreementData?.signedDocument ||
    !!agreementData?.signedDocumentUrl ||
    agreementData?.status === 'SIGNED';

  const signedAt =
    signedResult?.signedAt ||
    agreementData?.signedAt ||
    agreementData?.agreement?.signedAt ||
    new Date().toISOString();

  const formattedSignedAt = new Date(signedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const pdfUrl =
    agreementData?.signedDocumentUrl ||
    agreementData?.generatedDocumentUrl ||
    agreementData?.agreement?.signedDocumentUrl ||
    agreementData?.agreement?.generatedDocumentUrl ||
    agreementData?.signedDocument?.documentSlug ||
    agreementData?.generatedDocument?.documentSlug ||
    agreementData?.signedDocument ||
    agreementData?.generatedDocument ||
    agreementData?.documentUrl ||
    agreementData?.pdfUrl;

  const htmlContent = agreementData?.content;

  // Measure container width for responsive page rendering
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.offsetWidth - 48, 800);
        if (width > 200) setPageWidth(width);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleSignSubmit = async (payload) => {
    const success = await onSignAgreement(payload);
    if (success) {
      setIsSignDialogOpen(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top Header Card */}
        <SharedAgreementHeader
          agreementTitle={agreementTitle}
          enterpriseName={enterpriseName}
          createdAt={agreementData?.createdAt}
          isSigned={isSigned}
          pdfUrl={pdfUrl}
          onPrint={handlePrint}
          onOpenSignDialog={() => setIsSignDialogOpen(true)}
        />

        {/* Signature Captured Success Info Box */}
        {isSigned && (
          <SharedAgreementCapturedBanner
            agreementTitle={agreementTitle}
            enterpriseName={enterpriseName}
            formattedSignedAt={formattedSignedAt}
          />
        )}

        {/* Main Document Content Body */}
        {!isSigned && (
          <main
            ref={containerRef}
            className="min-h-[600px] rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-8"
          >
            <SharedAgreementPdfViewer
              pdfUrl={pdfUrl}
              htmlContent={htmlContent}
              agreementTitle={agreementTitle}
              pageWidth={pageWidth}
            />

            {/* Signature Status & Sign Button Callout */}
            <SharedAgreementBottomCallout
              isSigned={isSigned}
              formattedSignedAt={formattedSignedAt}
              pdfUrl={pdfUrl}
              onOpenSignDialog={() => setIsSignDialogOpen(true)}
            />
          </main>
        )}

        {/* Electronic Signature Dialog */}
        <SharedAgreementSignDialog
          isOpen={isSignDialogOpen}
          onClose={() => setIsSignDialogOpen(false)}
          agreementTitle={agreementTitle}
          enterpriseName={enterpriseName}
          onSignSubmit={handleSignSubmit}
          isSubmitting={isSigning}
        />
      </div>
    </div>
  );
}
