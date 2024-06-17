'use client';

import React from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ShareModal = ({ currLink }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn(
            'relative flex w-full cursor-pointer select-none items-center justify-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent',
          )}
        >
          Share
        </button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-2">
        <DialogTitle>
          Share your <span className="text-blue-500">Inventory</span>
        </DialogTitle>
        <p>Share this url to give viewer access to someone</p>

        <Button
          variant="outline"
          className="relative flex cursor-text justify-between text-sky-500"
        >
          {currLink}
          <Copy
            size={16}
            className="cursor-pointer font-bold hover:text-green-600"
            onClick={(e) => {
              e.preventDefault();
              navigator.clipboard.writeText(currLink);
              toast.success('Copy to clipboard');
            }}
          />
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
