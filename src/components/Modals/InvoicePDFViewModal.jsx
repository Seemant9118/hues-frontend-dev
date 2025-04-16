import { templateApi } from '@/api/templates_api/template_api';
import { getFilenameFromUrl } from '@/appUtils/helperFunctions';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getDocument } from '@/services/Template_Services/Template_Services';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import ViewPdf from '../pdf/ViewPdf';
import { Button } from '../ui/button';

const InvoicePDFViewModal = ({ cta, Url }) => {
  const translations = useTranslations('components.invoice_modal');
  const [isOpen, setIsOpen] = useState(false);

  // check that url Doc is PDF / image
  const [isPDF, setIsPDF] = useState(false);
  useEffect(() => {
    const isCheck = Url?.split('?')[0].toLowerCase().endsWith('.pdf');
    setIsPDF(isCheck);
  }, [Url]); // <-- Add Url here

  const { data: pdfDoc } = useQuery({
    queryKey: [templateApi.getS3Document.endpointKey, Url],
    queryFn: () => getDocument(Url),
    enabled: isOpen && !!Url, // Only fetch if pvtUrl is available
    select: (res) => res.data.data,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {React.cloneElement(cta, { key: 'invoice-pdf-cta' })}
      </DialogTrigger>

      <DialogContent className="max-h-[40rem] max-w-[60rem] p-1">
        <DialogTitle className="p-2">{'Preview'}</DialogTitle>

        {!pdfDoc ? (
          <div className="flex items-center justify-center py-10">
            <span>{translations('loading_document')}</span>
          </div>
        ) : (
          <ViewPdf url={pdfDoc.publicUrl} isPDF={isPDF} />
        )}

        <DialogFooter>
          <div className="flex w-full items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              {translations('ctas.cancel')}
            </Button>
            <Button size="sm" asChild className="bg-[#288AF9] text-white">
              <a
                href={pdfDoc?.publicUrl}
                download={getFilenameFromUrl(pdfDoc?.publicUrl)}
              >
                {translations('ctas.download')}
              </a>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePDFViewModal;
