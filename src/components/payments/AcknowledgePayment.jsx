'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AcknowledgePayment({
  poNumber = '1234',
  onAcknowledged,
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Acknowledge</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Receipt</DialogTitle>
        </DialogHeader>

        <DialogDescription className="text-sm text-muted-foreground">
          You are about to acknowledge the payment advice for{' '}
          <strong>PO #{poNumber}</strong>. Once confirmed, a payment receipt
          will be automatically generated and sent to the client. <br />
          <br />
          This action cannot be undone.
          <br />
          <br />
          Do you want to proceed?
        </DialogDescription>

        <DialogFooter className="flex flex-row justify-end gap-2 pt-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={onAcknowledged}>Confirm & Generate Receipt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
