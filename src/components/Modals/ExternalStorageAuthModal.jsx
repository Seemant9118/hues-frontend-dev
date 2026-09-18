import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ExternalStorageAuthModal({
  isOpen,
  onClose,
  onAuthorize,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Authorization Required</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-500">
            By connecting an external storage account, you can easily save your
            order attachments and documents directly to services like{' '}
            <strong>Google Drive</strong>, Dropbox, and more.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Please authorize a storage provider in your Enterprise Settings to
            continue.
          </p>
        </div>

        <DialogFooter>
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={onAuthorize}>
            Authorize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
