'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
// for hiding redundant text
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ViewPdf = ({ url, isPDF }) => {
  const [pageNo, setPageNo] = useState(1);
  const [pages, setPages] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setPages(numPages);
  };

  return (
    <section className="flex h-full w-full flex-col items-center justify-center gap-10 py-2">
      <div className="flex w-full items-center justify-between gap-2 px-24">
        {isPDF && (
          <ChevronLeft
            disabled={pageNo === 1}
            onClick={() => setPageNo((prev) => (prev > 1 ? prev - 1 : 1))}
            size={24}
            className={cn(
              'cursor-pointer disabled:cursor-not-allowed disabled:text-[#A5ABBD]',
              isPDF ? 'text-black' : 'text-white',
              pages > 1 ? 'cursor-pointer' : 'cursor-not-allowed',
            )}
          />
        )}
        <div className="scrollBarStyles flex h-[480px] w-full items-center justify-center overflow-auto">
          {isPDF ? (
            <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
              <Page
                pageNumber={pageNo}
                height={470} // use height instead of fixed width for better fit
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </Document>
          ) : (
            <Image
              src={url}
              alt="Preview"
              className="rounded-md"
              width={300}
              height={300}
            />
          )}
        </div>

        {isPDF && (
          <ChevronRight
            disabled={pageNo === pages}
            onClick={() =>
              setPageNo((prev) => (prev < pages ? prev + 1 : pages))
            }
            size={24}
            className={cn(
              'cursor-pointer disabled:cursor-not-allowed disabled:text-[#A5ABBD]',
              isPDF ? 'text-black' : 'text-white',
              pages > 1 ? 'cursor-pointer' : 'cursor-not-allowed',
            )}
          />
        )}
      </div>

      {isPDF && (
        <div className="rounded-full bg-white p-2 text-sm font-bold text-black">{`${pageNo} of ${pages} page${
          pages > 1 ? 's' : ''
        }`}</div>
      )}
    </section>
  );
};

export default ViewPdf;
