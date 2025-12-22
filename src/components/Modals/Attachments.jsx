/* eslint-disable import/no-unresolved */

import { PaperclipIcon } from 'lucide-react';
import React, { useState } from 'react';
import AttachmentsModal from './AttachmentModal';
import InvoicePDFViewModal from './InvoicePDFViewModal';

const Attachments = ({ attachments }) => {
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [open, setOpen] = useState(false);

  if (!attachments || attachments?.length === 0) return '--';

  // Direct open if only ONE attachment
  if (attachments?.length === 1) {
    const attachment = attachments[0];
    return (
      <InvoicePDFViewModal
        cta={
          <div className="flex w-full cursor-pointer items-center gap-1 hover:text-primary hover:underline">
            <PaperclipIcon size={14} className="shrink-0" />
            <span className="truncate">Attachment</span>
          </div>
        }
        Url={attachment?.documentSlug}
        name={attachment?.displayName}
      />
    );
  }

  // Show popup if multiple attachments
  return (
    <>
      <div
        className="flex w-full cursor-pointer items-center gap-1 hover:text-primary hover:underline"
        onClick={() => setOpen(true)}
      >
        <PaperclipIcon size={14} className="shrink-0" />
        <span className="truncate">Attachments ({attachments?.length})</span>
      </div>

      <AttachmentsModal
        open={open}
        onClose={() => setOpen(false)}
        attachments={attachments}
        onSelect={(att) => setSelectedAttachment(att)}
      />

      {selectedAttachment && (
        <InvoicePDFViewModal
          open={!!selectedAttachment}
          onOpenChange={() => setSelectedAttachment(null)}
          cta={<></>} // cta not needed here
          Url={selectedAttachment?.documentSlug}
          name={selectedAttachment?.displayName}
        />
      )}
    </>
  );
};

export default Attachments;
