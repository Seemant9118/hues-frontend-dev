import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// eslint-disable-next-line import/no-extraneous-dependencies
import base64ToBlob from 'base64toblob';
import { Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import ViewPdf from '../pdf/ViewPdf';
import { Button } from '../ui/button';
import Loading from '../ui/Loading';

const PreviewInvoice = ({
  base64StrToRenderPDF,
  mutationFn,
  disableCondition,
}) => {
  const translations = useTranslations('components.preview_invoice_modal');
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState(null);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (base64StrToRenderPDF) {
      // Convert base64 string to blob only if it is provided
      const blob = base64ToBlob(base64StrToRenderPDF, 'application/pdf'); // Assuming it's a PDF, change MIME type if different
      const newUrl = window.URL.createObjectURL(blob);
      setUrl(newUrl);

      // // Clean up the blob URL when the component unmounts or the base64 string changes
      return () => {
        window.URL.revokeObjectURL(newUrl);
      };
    }
  }, [base64StrToRenderPDF]); // Dependency array to ensure effect runs only when base64StrToRenderPDF changes

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-black"
          onClick={mutationFn}
          disabled={disableCondition}
        >
          <Eye size={16} />
          {translations('cta')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[40rem] max-w-[60rem] overflow-hidden">
        <DialogTitle>{translations('title')}</DialogTitle>
        {!url && <Loading />}
        {url && (
          <>
            <div className="flex flex-col items-center justify-center gap-2 p-2">
              <ViewPdf url={url} setIsOpen={setIsOpen} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PreviewInvoice;
