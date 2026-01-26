'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ViewPdf = ({ url, isPDF }) => {
  const [pageNo, setPageNo] = useState(1);
  const [pages, setPages] = useState(1);

  const containerRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(500);

  const onDocumentLoadSuccess = ({ numPages }) => setPages(numPages);

  // ✅ Auto calculate width (best for zoom issues)
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;

      // container width - little padding
      const width = containerRef.current.offsetWidth - 32;
      setPageWidth(width);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="flex h-full w-full flex-col gap-4 p-2 sm:p-4">
      {/* ✅ Scroll Area (only this should scroll) */}
      <div
        ref={containerRef}
        className="scrollBarStyles flex-1 overflow-auto bg-white p-2"
      >
        {isPDF ? (
          <Document
            className={'border'}
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page
              pageNumber={pageNo}
              width={pageWidth} // ✅ best fix for zoom + responsive
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </Document>
        ) : (
          <div className="flex justify-center">
            <Image
              src={url}
              alt="Preview"
              width={500}
              height={500}
              className="h-auto max-w-full rounded-md object-contain"
            />
          </div>
        )}
      </div>
      {/* Controls */}
      <div className="flex w-full items-center justify-between gap-2">
        {isPDF ? (
          <button
            type="button"
            disabled={pageNo === 1}
            onClick={() => setPageNo((prev) => (prev > 1 ? prev - 1 : 1))}
            className="rounded-md p-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={22} />
          </button>
        ) : (
          <div className="w-8" />
        )}

        {isPDF && (
          <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold sm:text-sm">
            {pageNo} / {pages}
          </div>
        )}

        {isPDF ? (
          <button
            type="button"
            disabled={pageNo === pages}
            onClick={() =>
              setPageNo((prev) => (prev < pages ? prev + 1 : pages))
            }
            className="rounded-md p-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight size={22} />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>
    </section>
  );
};

export default ViewPdf;
