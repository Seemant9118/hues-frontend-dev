'use client';

import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Configure PDF worker using bundled worker
if (typeof window !== 'undefined') {
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url,
    ).toString();
  } catch (e) {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  }
}

export default function SharedAgreementPdfViewer({
  pdfUrl,
  htmlContent,
  agreementTitle,
  pageWidth = 700,
}) {
  const [pageNo, setPageNo] = useState(1);
  const [pages, setPages] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfLoadError, setPdfLoadError] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setPages(numPages);
    setPdfLoadError(false);
  };

  if (pdfUrl) {
    return (
      <div className="flex flex-col gap-3">
        {/* PDF Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-600 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700">Pages:</span>
            <button
              type="button"
              disabled={pageNo <= 1}
              onClick={() => setPageNo((p) => Math.max(1, p - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-medium text-neutral-800">
              {pageNo} / {pages}
            </span>
            <button
              type="button"
              disabled={pageNo >= pages}
              onClick={() => setPageNo((p) => Math.min(pages, p + 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700">Zoom:</span>
            <button
              type="button"
              disabled={scale <= 0.7}
              onClick={() => setScale((s) => Math.max(0.7, s - 0.1))}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="w-12 text-center font-medium">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              disabled={scale >= 1.6}
              onClick={() => setScale((s) => Math.min(1.6, s + 0.1))}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>

        {/* Document Rendering */}
        {pdfLoadError ? (
          /* Native iFrame Fallback if React-PDF fails on certain browser configs */
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
            <iframe
              src={pdfUrl}
              title="Agreement PDF preview"
              className="h-[800px] w-full border-0"
            />
          </div>
        ) : (
          <div className="flex min-h-[700px] flex-col items-center justify-center overflow-auto rounded-xl border border-neutral-200 bg-neutral-100/60 p-4">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={() => setPdfLoadError(true)}
              loading={
                <div className="flex flex-col items-center justify-center gap-3 py-24 text-neutral-500">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="text-xs font-semibold">
                    Loading agreement PDF...
                  </span>
                </div>
              }
            >
              <Page
                pageNumber={pageNo}
                width={pageWidth * scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="overflow-hidden rounded-lg bg-white shadow-md"
              />
            </Document>
          </div>
        )}
      </div>
    );
  }

  if (htmlContent) {
    return (
      <article
        className="prose prose-neutral prose-headings:font-bold prose-headings:text-neutral-800 prose-p:leading-relaxed prose-p:text-neutral-700 prose-li:text-neutral-700 max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <FileText className="h-10 w-10 text-neutral-300" />
      <p className="mt-3 text-sm font-semibold text-neutral-700">
        {agreementTitle}
      </p>
      <p className="mt-1 text-xs text-neutral-400">
        Loading document preview...
      </p>
    </div>
  );
}
