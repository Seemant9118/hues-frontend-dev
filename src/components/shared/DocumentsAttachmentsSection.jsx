import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, File } from 'lucide-react';
import { previewMediaInNewTab } from '@/appUtils/mediaPreview';
import InvoiceMediaViewModal from '@/components/Modals/InvoicePDFViewModal';

export default function DocumentsAttachmentsSection({
  mainDocument,
  attachments,
}) {
  const hasContent = mainDocument || (attachments && attachments.length > 0);

  if (!hasContent) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-white p-4">
      <h4 className="text-sm font-bold text-gray-700">
        Documents / Attachments
      </h4>
      <div className="flex flex-wrap gap-2">
        {mainDocument && (
          <Button
            variant="outline"
            className="w-56 cursor-pointer overflow-hidden px-2 hover:text-primary"
            onClick={mainDocument.onClick}
          >
            <div className="flex w-full items-center gap-2">
              <FileText size={14} className="shrink-0" />
              <span
                className="truncate"
                title={mainDocument.name || 'Document PDF'}
              >
                {mainDocument.name || 'Document PDF'}
              </span>
            </div>
          </Button>
        )}

        {attachments?.map((att) => {
          const isPdf = att.attachmentFileName?.toLowerCase().endsWith('.pdf');

          if (isPdf) {
            return (
              <Button
                key={att.attachmentId || att.id || Math.random().toString()}
                variant="outline"
                className="w-56 cursor-pointer overflow-hidden px-2 hover:text-primary"
                onClick={() =>
                  previewMediaInNewTab(
                    att.documentUrl,
                    att.attachmentFileName,
                    'application/pdf',
                  )
                }
              >
                <div className="flex w-full items-center gap-2">
                  <FileText size={14} className="shrink-0" />
                  <span className="truncate">{att.attachmentFileName}</span>
                </div>
              </Button>
            );
          }

          return (
            <InvoiceMediaViewModal
              key={att.attachmentId || att.id || Math.random().toString()}
              Url={att.documentUrl}
              cta={
                <Button
                  variant="outline"
                  className="w-56 cursor-pointer overflow-hidden px-2 hover:text-primary"
                >
                  <div className="flex w-full items-center gap-2">
                    <File size={14} className="shrink-0" />
                    <span className="truncate">{att.attachmentFileName}</span>
                  </div>
                </Button>
              }
            />
          );
        })}
      </div>
    </div>
  );
}
