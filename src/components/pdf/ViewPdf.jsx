'use client';

import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
// for hiding redundant text
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Set the worker source for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const ViewPdf = ({ url }) => {
  const [pageNo, setPageNo] = useState(1);
  const [pages, setPages] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setPages(numPages);
  };

  return (
    <div className="scrollBarStyles flex max-h-[40rem] max-w-[60rem] flex-col gap-2 overflow-auto px-2">
      <div className="sticky right-0 top-0 z-50 flex items-center justify-end gap-2 bg-white">
        <span className="rounded-md bg-gray-100 px-2 py-1.5">{`${pageNo} of ${pages} pages`}</span>
        {/* <Button
          variant="outline "
          className="border border-black"
          onClick={() => setIsOpen(false)}
        >
          Back
        </Button> */}
        <Button
          size="sm"
          disabled={pageNo === 1}
          onClick={() => setPageNo((prev) => (prev > 1 ? prev - 1 : 1))}
        >
          Prev
        </Button>
        <Button
          size="sm"
          disabled={pageNo === pages}
          onClick={() => setPageNo((prev) => (prev < pages ? prev + 1 : pages))}
        >
          Next
        </Button>
      </div>
      <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
        <Page size="A4" pageNumber={pageNo} />
      </Document>
    </div>
  );
};

export default ViewPdf;
