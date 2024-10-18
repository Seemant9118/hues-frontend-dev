import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Download, Eye } from 'lucide-react';
import React from 'react';
import ViewPdf from '../pdf/ViewPdf';
import { Button } from '../ui/button';

const InvoicePDFViewModal = ({ Url }) => {
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
        {Url ? (
          <>
            <Button asChild variant="outline" className="w-full">
              <a download={Url} href={Url}>
                <Download size={14} />
                Download Invoice
              </a>
            </Button>
            <div className="flex items-center justify-center">
              <ViewPdf url={Url} />
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
