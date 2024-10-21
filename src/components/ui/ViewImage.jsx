'use client';

import { Eye } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './dialog';

const ViewImage = (mediaImage) => {
  const [open, setOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const handleMouseEnter = () => {
    setIsPreview(true);
  };

  const handleMouseLeave = () => {
    setIsPreview(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="relative" asChild>
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isPreview && (
            <div className="absolute left-7 top-7 z-10 flex flex-col items-center justify-center gap-1 text-white">
              <Eye size={12} />
              <span className="cursor-pointer text-xs hover:underline">
                Preview
              </span>
            </div>
          )}
          <Image
            key={mediaImage}
            className={
              isPreview ? 'rounded-sm border bg-black/80' : 'rounded-sm border'
            }
            src={mediaImage}
            alt="comment-attached-img"
            width={100}
            height={100}
          />
        </div>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-5">
        <DialogTitle>Preview Image</DialogTitle>
        <div className="flex flex-col items-center justify-center">
          <Image
            key={mediaImage}
            className="rounded-sm"
            src={mediaImage}
            alt="comment-attached-img"
            width={300}
            height={300}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewImage;
