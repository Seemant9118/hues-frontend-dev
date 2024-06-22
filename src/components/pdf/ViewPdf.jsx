'use client';

import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { Button } from '@/components/ui/button';

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
          onClick={() => setPageNo((prev) => (pages > prev ? prev - 1 : 1))}
        >
          Prev
        </Button>
        <Button
          disabled={pageNo === pages}
          onClick={() => setPageNo((prev) => (pages > prev ? prev + 1 : 1))}
        >
          Next
        </Button>
      </div>
      <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
        <Page pageNumber={pageNo} />
      </Document>
    </div>
  );
};

export default ViewPdf;
