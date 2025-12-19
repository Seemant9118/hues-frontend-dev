import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import InvoicePDFViewModal from '../Modals/InvoicePDFViewModal';

const DeliveryAttachments = ({ attachments }) => {
  const [showAll, setShowAll] = useState(false);

  if (!attachments?.length) return '-';

  const visible = showAll ? attachments : attachments.slice(0, 1);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visible.map((item) => (
        <InvoicePDFViewModal
          key={item.id}
          cta={
            <div className="cursor-pointer overflow-hidden rounded-full border px-2 hover:bg-muted hover:text-primary">
              <div className="flex items-center gap-2 p-1">
                <ImageIcon size={16} className="text-primary" />
                <span className="truncate text-xs">{item.displayName}</span>
              </div>
            </div>
          }
          Url={item.documentSlug}
          name={item.displayName}
        />
      ))}

      {!showAll && attachments.length > 1 && (
        <button
          onClick={() => setShowAll(true)}
          className="rounded-full border px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-primary"
        >
          + {attachments.length - 1} more
        </button>
      )}
    </div>
  );
};

export default DeliveryAttachments;
