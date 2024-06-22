import { templateApi } from '@/api/templates_api/template_api';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getDocument } from '@/services/Template_Services/Template_Services';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText } from 'lucide-react';
import React from 'react';
import ViewPdf from '../pdf/ViewPdf';
import { Button } from '../ui/button';

const InvoicePDFViewModal = ({ url }) => {
  const { data } = useQuery({
    queryKey: [templateApi.getS3Document.endpointKey, url],
    queryFn: () => getDocument(url),
    // enabled: !!isOpen,
    select: (res) => res.data.data,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="blue_outline">
          <FileText size={14} />
          Generate Invoice
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Invoice</DialogTitle>
        <Button variant="outline">
          <Download size={14} />
          Download Invoice
        </Button>
        <ViewPdf url={data} />
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePDFViewModal;
