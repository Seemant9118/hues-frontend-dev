import {
  ArrowUp,
  Building2,
  ChevronDown,
  ChevronUp,
  Paperclip,
} from 'lucide-react';
import React, { useState } from 'react';
import Tooltips from '../auth/Tooltips';
import { Button } from '../ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import Loading from '../ui/Loading';
import { Textarea } from '../ui/textarea';

const CommentBox = ({
  createCommentMutation,
  handleSubmitComment,
  uploadMedia,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState({
    files: [],
    contextType: '',
    contextId: null,
    text: '',
  });

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full rounded-md border px-2 py-1"
    >
      <div
        className={
          isOpen
            ? 'flex items-center justify-between gap-2'
            : 'flex items-center justify-between gap-2'
        }
      >
        {!isOpen && (
          <section className="flex w-full animate-fadeInUp items-center justify-between">
            <h1 className="text-sm font-bold">Comments</h1>
          </section>
        )}
        {isOpen && <h1 className="text-sm font-bold">{'Comments'}</h1>}
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" debounceTime="0">
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="animate-fadeInUp space-y-2">
        <div className="relative">
          {/* 1 */}
          <div className="absolute left-5 top-[15px] flex h-10 w-10 items-center justify-center rounded-full bg-[#A5ABBD]">
            <Building2 size={20} />
          </div>

          {/* 2 */}
          <Textarea
            name="comment"
            value={comment.text}
            onChange={(e) => {
              setComment((prev) => ({ ...prev, text: e.target.value }));
            }}
            className="px-20 pt-[20px]"
            placeholder={'Type your comment here...'}
          />

          {/* 3 */}
          <div className="absolute right-6 top-[24px] flex gap-4 text-[#A5ABBD]">
            <Tooltips
              trigger={
                <label htmlFor="fileUpload">
                  <Paperclip
                    size={20}
                    className="cursor-pointer hover:text-black"
                  />
                </label>
              }
              content={'attach file'}
            />

            <input
              type="file"
              id="fileUpload"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files[0]) {
                  uploadMedia(e.target.files[0]);
                }
              }}
            />

            <Tooltips
              trigger={
                createCommentMutation.isPending ? (
                  <Loading />
                ) : (
                  <ArrowUp
                    size={20}
                    onClick={handleSubmitComment}
                    className={'cursor-pointer hover:text-black'}
                  />
                )
              }
              content={'send'}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CommentBox;
