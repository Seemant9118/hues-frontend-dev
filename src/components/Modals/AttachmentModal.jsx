/* eslint-disable jsx-a11y/alt-text */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Image } from 'lucide-react';
import { Button } from '../ui/button';

const AttachmentsModal = ({ open, onClose, attachments, onSelect }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>View Attachments</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {attachments?.map((item) => (
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
              <Image size={15} />
              <span className="truncate">{item.displayName}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttachmentsModal;
