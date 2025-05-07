import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { cn } from '@/lib/utils';
import {
  createComments,
  getComments,
} from '@/services/Debit_Note_Services/DebitNoteServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUp,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Image,
  Paperclip,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import Tooltips from '../auth/Tooltips';
import { Button } from '../ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import Loading from '../ui/Loading';
import { Textarea } from '../ui/textarea';
import Comment from './Comment';

const CommentBox = ({ contextId, context }) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [comment, setComment] = useState({
    files: [],
    contextType: '',
    contextId: null,
    text: '',
  });

  // get comments
  const { data: comments, isLoading: isCommentLoading } = useQuery({
    queryKey: [DebitNoteApi.getComments.endpointKey],
    queryFn: () => getComments(contextId, context),
    select: (comments) => comments.data.data,
    enabled: isOpen,
  });

  const createCommentMutation = useMutation({
    mutationKey: [DebitNoteApi.createComments.endpointKey],
    mutationFn: createComments,
    onSuccess: () => {
      toast.success('Commented Successfully');
      queryClient.invalidateQueries([DebitNoteApi.getComments.endpointKey]);
      setComment({
        files: [],
        contextType: '',
        contextId: null,
        text: '',
      });
      setFiles([]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something Went Wrong');
    },
  });

  const uploadMedia = async (file) => {
    setFiles((prev) => [...prev, file]);
    toast.success('File attached successfully!');
  };

  const handleFileRemove = (file) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
  };

  const handleSubmitComment = () => {
    if (!comment.text.trim()) {
      toast.error('Comment cannot be empty!');
      return;
    }

    const formData = new FormData();
    formData.append('contextType', context); // assuming fixed or dynamic context
    formData.append('contextId', contextId); // use actual ID here
    formData.append('text', comment.text);

    // handle files if any
    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    createCommentMutation.mutate(formData);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn('w-full rounded-md px-2 py-1', isOpen ? '' : 'border')}
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
        {/* comment input */}
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
                createCommentMutation?.isPending ? (
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

        {/* upload files */}
        <div className="flex flex-col">
          {/* attached files */}
          {files?.length > 0 && (
            <span className="text-xs font-bold">{'Attched Proofs'}</span>
          )}
          <div className="flex flex-wrap gap-4">
            {files?.map((file) => (
              <div
                key={file.name}
                className="relative flex w-64 flex-col gap-2 rounded-xl border border-neutral-300 bg-white p-4 shadow-sm"
              >
                {/* Remove Button */}
                <X
                  size={16}
                  onClick={() => handleFileRemove(file)}
                  className="absolute right-2 top-2 cursor-pointer text-neutral-500 hover:text-red-500"
                />

                {/* File icon */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                  {file.name.split('.').pop() === 'pdf' ? (
                    <FileText size={16} className="text-red-600" />
                  ) : (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <Image size={16} className="text-primary" />
                  )}
                </div>

                {/* File name */}
                <p className="truncate text-sm font-medium text-neutral-800">
                  {file.name}
                </p>

                {/* Success message */}
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-green-500/10 p-1.5 text-green-600">
                    <Check size={12} />
                  </div>
                  <p className="text-xs font-medium text-green-600">
                    {'File attached'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* comments lists */}
        <section className="flex flex-col gap-2">
          {isCommentLoading && <Loading />}
          {!isCommentLoading &&
            comments?.length > 0 &&
            comments?.map((comment) => (
              <Comment
                key={comment?.id}
                invalidateId={contextId}
                comment={comment}
              />
            ))}

          {!isCommentLoading && comments?.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-gray-50 p-4 text-sm text-[#939090]">
              <h1>{'No Comments Yet'}</h1>
              <p>{'Something say to comment'}</p>
            </div>
          )}
        </section>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CommentBox;
