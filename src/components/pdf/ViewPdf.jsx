'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
// for hiding redundant text
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Set the worker source for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const ViewPdf = ({ url }) => {
  const [pageNo, setPageNo] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageWidth, setPageWidth] = useState(0);
  const containerRef = useRef(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setPages(numPages);
  };

  useEffect(() => {
    // Set the width dynamically based on the parent container size
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        setPageWidth(containerRef.current.offsetWidth);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Clean up observer on component unmount
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <section className="flex w-full flex-col items-center gap-2 bg-[#F4F4F4] py-4">
      <div className="flex items-center gap-4">
        <Button
          size="sm"
          className="rounded-full bg-[#A5ABBD] text-[#F4F4F4]"
          variant="outline"
          disabled={pageNo === 1}
          onClick={() => setPageNo((prev) => (prev > 1 ? prev - 1 : 1))}
        >
          <ArrowLeft size={18} />
        </Button>
        <div
          ref={containerRef}
          className="scrollBarStyles h-[400px] w-[650px] overflow-y-auto overflow-x-hidden border shadow-2xl"
        >
          <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
            <Page width={pageWidth} pageNumber={pageNo} />
          </Document>
        </div>

        <Button
          size="sm"
          className="rounded-full bg-[#A5ABBD] text-[#F4F4F4]"
          variant="outline"
          disabled={pageNo === pages}
          onClick={() => setPageNo((prev) => (prev < pages ? prev + 1 : pages))}
        >
          <ArrowRight size={18} />
        </Button>
      </div>

      <div className="p-2 text-sm font-bold">{`${pageNo} of ${pages} page`}</div>
    </section>
  );
};

export default ViewPdf;
