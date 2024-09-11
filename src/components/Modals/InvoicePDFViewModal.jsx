import { templateApi } from '@/api/templates_api/template_api';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getDocument } from '@/services/Template_Services/Template_Services';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import ViewPdf from '../pdf/ViewPdf';
import { Button } from '../ui/button';

const InvoicePDFViewModal = ({ pvtUrl, shouldOpen, invoiceId }) => {
  const [isOpen, setIsOpen] = useState(shouldOpen); // State for managing modal open/close
  const router = useRouter();

  // Sync isOpen with shouldOpen prop
  useEffect(() => {
    setIsOpen(shouldOpen);
  }, [shouldOpen]);

  // Fetch the PDF document using react-query
  const { data: pdfDoc } = useQuery({
    queryKey: [templateApi.getS3Document.endpointKey, pvtUrl],
    queryFn: () => getDocument(pvtUrl),
    enabled: !!pvtUrl, // Only fetch if pvtUrl is available
    select: (res) => res.data.data,
  });

  // Handle the button click and update the URL with the invoiceId parameter
  const handleInvoiceButtonClick = () => {
    if (invoiceId) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('invoiceId', invoiceId);
      router.push(newUrl.toString()); // Avoid full page reload
    }
    setIsOpen(true); // Open the modal
  };

  // Cleanup URL when modal is closed
  const handleModalClose = (open) => {
    if (!open) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('invoiceId');
      router.back(); // Remove invoiceId from URL
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-1/2 border-black"
          onClick={handleInvoiceButtonClick}
        >
          <Download size={16} />
          Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[40rem] max-w-[60rem] overflow-hidden">
        <DialogTitle>Invoice</DialogTitle>
        {pdfDoc && pdfDoc.publicUrl ? ( // Ensure pdfDoc is available before accessing publicUrl
          <>
            <Button asChild variant="outline" className="w-full">
              <a download={pdfDoc.publicUrl} href={pdfDoc.publicUrl}>
                <Download size={14} />
                Download Invoice
              </a>
            </Button>
            <div className="flex items-center justify-center">
              <ViewPdf url={pdfDoc.publicUrl} />
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
