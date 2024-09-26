import { Building2 } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import GoogleImage from '../../../public/google-icon.png';

const DebitNoteComment = ({ comment }) => {
  return (
    <div className="flex justify-start gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-[#A5ABBD]">
        <Building2 size={20} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-sm font-bold">{comment.enterpriseName}</h1>
          <p className="text-sm font-bold text-[#A5ABBD]">
            {comment.commentedAt}
          </p>
        </div>

        <p className="text-sm text-[#7F8185]">{comment.comment}</p>

        {/* if Image contains */}
        <Image
          className="rounded-sm"
          src={GoogleImage}
          alt="comment-attahced-img"
          width={50}
          height={50}
        />
      </div>
    </div>
  );
};

export default DebitNoteComment;
