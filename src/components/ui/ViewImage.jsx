'use client';

import { getDocument } from '@/services/Template_Services/Template_Services';
import { File } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './dialog';
import Loading from './Loading';

const ViewImage = ({ mediaName, mediaImage }) => {
  const [open, setOpen] = useState(false);
  const [publicUrl, setPublicUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConvertFileToPublicUrl = async () => {
    if (!mediaImage) return;

    try {
      setLoading(true);
      const res = await getDocument(mediaImage);
      const data = res?.data?.data;

      if (data) {
        setPublicUrl(data?.publicUrl);
        setOpen(true);
      } else {
        toast.error('Could not get public URL');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={handleConvertFileToPublicUrl}
          variant="outline"
          className="w-56 cursor-pointer overflow-hidden px-2 hover:text-primary"
          disabled={loading}
        >
          <div className="flex w-full items-center gap-2">
            <File size={14} className="shrink-0" />
            <span className="truncate">{mediaName}</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-5">
        <DialogTitle>Preview Image</DialogTitle>
        <div className="flex items-center justify-center">
          {loading && <Loading />}
          {!loading && publicUrl && (
            <Image
              className="rounded-sm"
              src={publicUrl}
              alt="comment-attached-img"
              width={400}
              height={400}
            />
          )}
          {!loading && !publicUrl && (
            <p className="text-sm text-red-500">Image not available</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewImage;
