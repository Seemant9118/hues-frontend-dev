'use client';

import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set the worker source for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const ViewPdf = ({ url }) => {
  const [pageNo, setPageNo] = useState(1);
  const [pages, setPages] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setPages(numPages);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end gap-4">
        <Button
          disabled={pageNo === 1}
          onClick={() => setPageNo((prev) => (prev > 1 ? prev - 1 : 1))}
        >
          Prev
        </Button>
        <Button
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
