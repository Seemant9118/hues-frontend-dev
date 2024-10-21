import { templateApi } from '@/api/templates_api/template_api';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getDocument } from '@/services/Template_Services/Template_Services';
import { useQuery } from '@tanstack/react-query';
import { Download, Eye } from 'lucide-react';
import React from 'react';
import ViewPdf from '../pdf/ViewPdf';
import { Button } from '../ui/button';

const InvoicePDFViewModal = ({ Url }) => {
  const { data: pdfDoc } = useQuery({
    queryKey: [templateApi.getS3Document.endpointKey, Url],
    queryFn: () => getDocument(Url),
    enabled: !!Url, // Only fetch if pvtUrl is available
    select: (res) => res.data.data,
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center justify-center"
        >
          <Eye size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[40rem] max-w-[60rem] overflow-hidden">
        <DialogTitle>Invoice</DialogTitle>
        {pdfDoc?.publicUrl ? (
          <>
            <Button asChild variant="outline" className="w-full">
              <a download={pdfDoc?.publicUrl} href={pdfDoc?.publicUrl}>
                <Download size={14} />
                Download Invoice
              </a>
            </Button>
            <div className="flex items-center justify-center">
              <ViewPdf url={pdfDoc?.publicUrl} />
            </div>
          </>
        ) : (
          <p>Loading document...</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePDFViewModal;
