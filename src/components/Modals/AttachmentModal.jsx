import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { File } from 'lucide-react';

const AttachmentsModal = ({ open, onClose, attachments, onSelect }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>View Attachments</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {attachments.map((item) => (
            <button
              key={item.id}
              className="flex w-full items-center gap-2 rounded-md border p-2 hover:bg-muted"
              onClick={() => {
                onSelect(item);
                onClose();
              }}
            >
              <File size={15} />
              <span className="truncate">{item.name}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttachmentsModal;
