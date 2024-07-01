import { templateApi } from '@/api/templates_api/template_api';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { generateInvoice } from '@/services/Orders_Services/Orders_Services';
import { getDocument } from '@/services/Template_Services/Template_Services';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Download, FileText } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import ViewPdf from '../pdf/ViewPdf';
import { Button } from '../ui/button';

const InvoicePDFViewModal = ({ orderId }) => {
  const [pvturl, setPvtUrl] = useState('');

  // generate and get S3 pvt url
  const generateInvoiceMutation = useMutation({
    mutationFn: () => generateInvoice(orderId),
    onSuccess: (res) => {
      setPvtUrl(res.data.data);
      toast.success(res.data.message);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate invoice');
    },
  });

  // making pvtUrl to publicUrl to render
  const { data: pdfDoc } = useQuery({
    queryKey: [templateApi.getS3Document.endpointKey, pvturl],
    queryFn: () => getDocument(pvturl),
    enabled: !!pvturl,
    select: (res) => res.data.data,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="blue_outline"
          onClick={() => generateInvoiceMutation.mutate()}
        >
          <FileText size={14} />
          Generate Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[40rem] max-w-[60rem] overflow-hidden">
        <DialogTitle>Invoice</DialogTitle>
        {pdfDoc?.publicUrl && (
          <>
            <Button asChild variant="outline" className="w-full">
              <a download={pdfDoc?.publicUrl} href={pdfDoc?.publicUrl}>
                <Download size={14} />
                Download Invoice
              </a>
            </Button>
            {/* <Button variant="outline" as="a" href={pdfDoc?.publicUrl} download>
              <Download size={14} />
              Download Invoice
            </Button> */}
            <div className="flex items-center justify-center">
              <ViewPdf url={pdfDoc?.publicUrl} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePDFViewModal;
