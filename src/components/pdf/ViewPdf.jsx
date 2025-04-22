'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
// for hiding redundant text
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const ViewPdf = ({ isAttachement, url, isPDF }) => {
  const [pageNo, setPageNo] = useState(1);
  const [pages, setPages] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setPages(numPages);
  };

  return (
    <section className="flex h-full w-full flex-col items-center justify-center gap-2 py-2">
      <div className="flex w-full items-center justify-between gap-2">
        {isPDF && (
          <ChevronLeft
            disabled={pageNo === 1}
            onClick={() => setPageNo((prev) => (prev > 1 ? prev - 1 : 1))}
            size={24}
            className="cursor-pointer text-white disabled:cursor-not-allowed disabled:text-[#A5ABBD]"
          />
        )}

        <div
          className={`relative ${
            isAttachement ? 'h-[460px] w-[460px]' : 'h-[460px] w-[460px]'
          } scrollBarStyles overflow-auto rounded-md border bg-white p-2`}
        >
          <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
            <Page
              pageNumber={pageNo}
              width={440} // Slightly less than container width for padding
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </Document>
        </div>

        {isPDF && (
          <ChevronRight
            disabled={pageNo === pages}
            onClick={() =>
              setPageNo((prev) => (prev < pages ? prev + 1 : pages))
            }
            size={24}
            className="cursor-pointer text-white disabled:cursor-not-allowed disabled:text-[#A5ABBD]"
          />
        )}
      </div>

      {isPDF && (
        <div className="p-2 text-sm font-bold text-white">{`${pageNo} of ${pages} page${
          pages > 1 ? 's' : ''
        }`}</div>
      )}
    </section>
  );
};

export default ViewPdf;
