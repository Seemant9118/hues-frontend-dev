import { Building2 } from 'lucide-react';
import moment from 'moment';
import Image from 'next/image';
import React from 'react';

const DebitNoteComment = ({ comment }) => {
  // Date & time formatter
  const formatDateTime = (itemDateT) => {
    const itemDateTime = moment(itemDateT);
    const now = moment();
    let displayDate;

    if (itemDateTime.isSame(now, 'day')) {
      displayDate = 'Today';
    } else if (itemDateTime.isSame(now.clone().subtract(1, 'days'), 'day')) {
      displayDate = 'Yesterday';
    } else {
      displayDate = itemDateTime.format('DD-MM-YYYY');
    }
    return `${displayDate} ${itemDateTime.format('HH:mm:ss')}`;
  };
  return (
    <div className="flex justify-start gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-[#A5ABBD]">
        <Building2 size={20} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-sm font-bold">{comment.enterpriseName}</h1>
          <p className="text-sm font-bold text-[#A5ABBD]">
            {formatDateTime(comment.commentedAt)}
          </p>
        </div>

        <p
          className="isImageComment text-sm text-[#7F8185]"
          dangerouslySetInnerHTML={{ __html: comment.comment }}
        ></p>

        <div className="flex gap-2">
          {comment?.mediaLinks?.map((mediaImage) => (
            <Image
              key={mediaImage}
              className="rounded-sm"
              src={mediaImage}
              alt="comment-attahced-img"
              width={50}
              height={50}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebitNoteComment;
