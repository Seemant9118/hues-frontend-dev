import { Building2 } from 'lucide-react';
import moment from 'moment';
import React from 'react';
import ViewImage from '../ui/ViewImage';

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
          <h1 className="text-sm font-bold">
            {comment?.createdbyname ?? 'Name not available'}
          </h1>
          <p className="text-sm font-bold text-[#A5ABBD]">
            {formatDateTime(comment?.commentedat)}
          </p>
        </div>

        <p className="text-sm text-[#7F8185]">{comment.text}</p>

        <div className="flex gap-2">
          {comment?.attachments?.map((attachment) => (
            <div key={attachment?.id}>
              <ViewImage
                mediaName={attachment?.fileName}
                mediaImage={attachment?.document?.url}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebitNoteComment;
