import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { File } from 'lucide-react';
import { Button } from '../ui/button';

const AttachmentsModal = ({ open, onClose, attachments, onSelect }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>View Attachments</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 border">
          {attachments.map((item) => (
            <Button
              key={item.id}
              onClick={() => {
                onSelect(item);
                onClose();
              }}
              variant="outline"
              size="sm"
              className="max-w-sm"
            >
              <File size={15} />
              <span className="truncate">{item.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttachmentsModal;
