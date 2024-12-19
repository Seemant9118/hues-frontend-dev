import { useQuery } from '@tanstack/react-query';
import { Copy, Share2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import Loading from '../ui/Loading';

const ShareOrderInvoice = ({ heading = 'Share', queryFn, queryKey }) => {
  const params = useParams();
  const [open, setOpen] = useState(false);

  // api call
  const { data: publicLink, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: () => queryFn(params.order_id),
    select: (data) => data?.data?.data?.publicUrl,
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Share2 size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col justify-center gap-6">
        <DialogTitle>{heading}</DialogTitle>

        <p className="text-sm font-bold">Share this url to anyone</p>

        {isLoading && <Loading />}

        {!isLoading && (
          <div className="flex w-full cursor-text items-center gap-2 rounded-md border p-2 shadow-md">
            <span className="w-5/6 truncate text-sm font-semibold">
              {publicLink}
            </span>
            <Copy
              size={16}
              className="flex w-1/6 cursor-pointer font-bold text-sky-500 hover:text-green-600"
              onClick={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText(publicLink ?? 'copied url');
                toast.success('Copied to clipboard');
              }}
            />
          </div>
        )}

        <DialogFooter>
          <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareOrderInvoice;
