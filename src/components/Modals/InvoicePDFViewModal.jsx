import { templateApi } from '@/api/templates_api/template_api';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getDocument } from '@/services/Template_Services/Template_Services';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import React, { useState } from 'react';
import ViewPdf from '../pdf/ViewPdf';
import { Button } from '../ui/button';
import Tooltips from '../auth/Tooltips';

const InvoicePDFViewModal = ({ Url }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: pdfDoc } = useQuery({
    queryKey: [templateApi.getS3Document.endpointKey, Url],
    queryFn: () => getDocument(Url),
    enabled: !!Url, // Only fetch if pvtUrl is available
    select: (res) => res.data.data,
  });
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Tooltips
          trigger={
            <Button
              onClick={() => setIsOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center justify-center"
            >
              <Eye size={14} />
            </Button>
          }
          content={'View Invoice'}
        />
      </DialogTrigger>
      <DialogContent className="max-h-[40rem] max-w-[60rem] p-1">
        <DialogTitle className="p-2">Invoice</DialogTitle>

        {pdfDoc?.publicUrl ? (
          <div className="flex items-center justify-center">
            <ViewPdf url={pdfDoc?.publicUrl} />
          </div>
        ) : (
          <p>Loading document...</p>
        )}

        <DialogFooter>
          <div className="flex w-full items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" asChild className="bg-[#288AF9] text-white">
              <a download={pdfDoc?.publicUrl} href={pdfDoc?.publicUrl}>
                Download
              </a>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePDFViewModal;
