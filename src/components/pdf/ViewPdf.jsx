'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
// for hiding redundant text
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Set the worker source for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const ViewPdf = ({ isAttachement, url, isPDF }) => {
  const [pageNo, setPageNo] = useState(1);
  const [pages, setPages] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setPages(numPages);
  };

  return (
    <section className="flex h-full w-full flex-col items-center justify-center gap-2 py-2">
      <div className="flex h-full items-center justify-center gap-4">
        {isPDF && (
          <Button
            size="sm"
            className="rounded-full bg-[#A5ABBD] text-[#F4F4F4]"
            variant="outline"
            disabled={pageNo === 1}
            onClick={() => setPageNo((prev) => (prev > 1 ? prev - 1 : 1))}
          >
            <ArrowLeft size={18} />
          </Button>
        )}
        <div
          className={
            isAttachement
              ? 'scrollBarStyles relative flex h-[450px] w-[650px] flex-col items-center overflow-y-auto overflow-x-hidden bg-[#F4F4F4]'
              : 'relative h-full w-[500px]'
          }
        >
          {isPDF && (
            <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
              <Page width={400} pageNumber={pageNo} />
            </Document>
          )}
          {!isPDF && (
            <Image
              src={url}
              alt="img"
              fill
              className="rounded-sm object-contain"
              unoptimized
            />
          )}
        </div>

        {isPDF && (
          <Button
            size="sm"
            className="rounded-full bg-[#A5ABBD] text-[#F4F4F4]"
            variant="outline"
            disabled={pageNo === pages}
            onClick={() =>
              setPageNo((prev) => (prev < pages ? prev + 1 : pages))
            }
          >
            <ArrowRight size={18} />
          </Button>
        )}
      </div>

      <div className="p-2 text-sm font-bold">{`${pageNo} of ${pages} page`}</div>
    </section>
  );
};

export default ViewPdf;
