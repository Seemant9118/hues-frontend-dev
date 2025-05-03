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
import { Download, Link, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ViewPdf from '../pdf/ViewPdf';

const InvoiceMediaViewModal = ({ cta, Url, isDownloadable = true }) => {
  const translations = useTranslations('components.invoice_modal');
  const [isOpen, setIsOpen] = useState(false);
  const [isPDF, setIsPDF] = useState(false);
  const [isImage, setIsImage] = useState(false);

  useEffect(() => {
    const fileExt = Url?.split('?')[0].toLowerCase();
    setIsPDF(fileExt.endsWith('.pdf'));
    setIsImage(
      fileExt.endsWith('.png') ||
        fileExt.endsWith('.jpg') ||
        fileExt.endsWith('.jpeg') ||
        fileExt.endsWith('.gif') ||
        fileExt.endsWith('.webp'),
    );
  }, [Url]);

  const { data: mediaDoc } = useQuery({
    queryKey: [templateApi.getS3Document.endpointKey, Url],
    queryFn: () => getDocument(Url),
    enabled: isOpen && !!Url,
    select: (res) => res.data.data,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {React.cloneElement(cta, { key: 'invoice-media-cta' })}
      </DialogTrigger>

      <DialogContent
        isDefaultCloseIcon={false}
        className="m-0 flex h-[42vw] max-w-[90vw] flex-col overflow-auto border-none bg-transparent shadow-none"
      >
        {/* Custom Close Button */}

        <X
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 z-10 cursor-pointer p-1 text-white transition hover:text-primary"
          size={28}
        />

        <DialogTitle className="text-white">{'Preview'}</DialogTitle>

        {!mediaDoc ? (
          <div className="flex items-center justify-center py-10">
            <span className="text-white">
              {translations('loading_document')}
            </span>
          </div>
        ) : (
          <div className="flex h-[520px] items-center justify-center">
            {isPDF ? (
              <ViewPdf isAttachement={true} url={mediaDoc.publicUrl} isPDF />
            ) : isImage ? (
              <Image
                src={mediaDoc.publicUrl}
                alt="Preview"
                className="rounded-md"
                width={400}
                height={400}
              />
            ) : (
              <span className="text-white">{'Unable to load Document'}</span>
            )}
          </div>
        )}

        <DialogFooter>
          {isDownloadable && mediaDoc?.publicUrl && (
            <div className="flex w-full items-center gap-4">
              <a
                href={mediaDoc.publicUrl}
                download={getFilenameFromUrl(mediaDoc.publicUrl)}
              >
                <Download size={24} className="text-white hover:text-primary" />
              </a>
              <p
                onClick={() => {
                  navigator.clipboard.writeText(mediaDoc.publicUrl);
                  toast.success('Link copied to clipboard');
                }}
              >
                <Link size={24} className="text-white hover:text-primary" />
              </p>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceMediaViewModal;
