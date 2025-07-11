/* eslint-disable import/no-unresolved */

'use client';

import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { capitalize, formattedAmount } from '@/appUtils/helperFunctions';
import Tooltips from '@/components/auth/Tooltips';
import Comment from '@/components/comments/Comment';
import DebitNoteModal from '@/components/Modals/DebitNoteModal';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import { Textarea } from '@/components/ui/textarea';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { useAuth } from '@/context/AuthContext';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import {
  createComments,
  getComments,
  getDebitNote,
} from '@/services/Debit_Note_Services/DebitNoteServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Check,
  FileText,
  Image,
  MessageCircle,
  Paperclip,
  X,
} from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

const ViewDebitNote = () => {
  useMetaData('Hues! - Debit Notes Details', 'HUES DEBITNOTES'); // dynamic title

  const translations = useTranslations(
    'sales.sales-debit_notes.debit_notes_details',
  );

  const { permissions } = useAuth();
  const { hasPermission } = usePermission();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const debitNoteId = params.debit_id;
  const [files, setFiles] = useState([]);
  const [comment, setComment] = useState({
    files: [],
    contextType: '',
    contextId: null,
    text: '',
  });

  const debitNoteBreadCrumbs = [
    {
      id: 1,
      name: translations('title.debit_notes'),
      path: `/dashboard/sales/sales-debitNotes`,
      show: true, // Always show
    },

    {
      id: 2,
      name: translations('title.debit_note_details'),
      path: `/dashboard/sales/sales-debitNotes/${debitNoteId}`,
      show: true, // Always show
    },
  ];

  // get debitNote
  const { data: debitNote, isLoading } = useQuery({
    queryKey: [DebitNoteApi.getDebitNote.endpointKey, debitNoteId],
    queryFn: () => getDebitNote(debitNoteId),
    select: (debitNote) => debitNote.data.data,
    enabled: hasPermission('permission:sales-view'),
  });

  // get comments
  const { data: comments, isLoading: isCommentLoading } = useQuery({
    queryKey: [DebitNoteApi.getComments.endpointKey, debitNoteId],
    queryFn: () => getComments(debitNoteId, 'DEBIT_NOTE'),
    select: (comments) => comments.data.data,
  });

  const uploadMedia = async (file) => {
    setFiles((prev) => [...prev, file]);
    toast.success('File attached successfully!');
  };

  const handleFileRemove = (file) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
  };

  const createCommentMutation = useMutation({
    mutationKey: [DebitNoteApi.createComments.endpointKey],
    mutationFn: createComments,
    onSuccess: () => {
      toast.success('Comment added successfully!');
      queryClient.invalidateQueries([
        DebitNoteApi.getComments.endpointKey,
        debitNoteId,
      ]);
      setComment({
        files: [],
        contextType: '',
        contextId: null,
        text: '',
      });
      setFiles([]);
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translations('errorMsg.common'),
      );
    },
  });

  const handleSubmitComment = () => {
    if (!comment.text.trim()) {
      toast.error('Comment cannot be empty!');
      return;
    }

    const formData = new FormData();
    formData.append('contextType', 'DEBIT_NOTE'); // assuming fixed or dynamic context
    formData.append('contextId', debitNoteId); // use actual ID here
    formData.append('text', comment.text);

    // handle files if any
    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    createCommentMutation.mutate(formData);
  };

  if (!permissions || permissions.length === 0) {
    return null; // or <Loading />
  }

  if (!hasPermission('permission:sales-view')) {
    router.replace('/unauthorized');
    return null;
  }

  return (
    <Wrapper className="h-full py-2">
      <div className="sticky top-0 z-10 flex gap-2 bg-white pt-2">
        {/* breadcrumbs */}
        <OrderBreadCrumbs possiblePagesBreadcrumbs={debitNoteBreadCrumbs} />
      </div>

      {isLoading && <Loading />}
      <section className="scrollBarStyles relative flex h-full w-full flex-col gap-4 overflow-y-auto">
        {/* debitNote overview */}
        {!isLoading && debitNote && (
          <div className="sticky top-0 z-10 flex flex-col gap-8 rounded-lg border bg-white px-8 py-4 shadow-customShadow">
            <section className="flex items-center justify-between">
              <div className="flex flex-col gap-8">
                <h1 className="flex items-center gap-2 text-sm">
                  <span className="font-bold">{debitNote.referenceNumber}</span>
                  <span className="rounded border border-[#EDEEF2] bg-[#F6F7F9] p-1.5 text-xs">
                    {capitalize(debitNote?.status)}
                  </span>
                </h1>
                <div className="flex gap-10">
                  <h1 className="text-sm">
                    <span className="font-bold text-[#ABB0C1]">
                      {translations('label.date')}:{' '}
                    </span>
                    <span className="text-[#363940]">
                      {moment(debitNote.createdAt).format('DD/MM/YYYY')}
                    </span>
                  </h1>
                  <h1 className="text-sm">
                    <span className="font-bold text-[#ABB0C1]">
                      {translations('label.total_amount')} :{' '}
                    </span>
                    <span className="font-bold text-[#363940]">
                      {formattedAmount(debitNote.amount)}
                    </span>
                    <span> (inc. GST)</span>
                  </h1>
                </div>
              </div>
            </section>

            <h1 className="text-sm">
              <span className="font-bold text-[#ABB0C1]">
                {translations('label.reason')} :{' '}
              </span>
              <span className="text-[#363940]">{debitNote.remark}</span>
            </h1>
          </div>
        )}

        {/* comments  */}
        <div className="flex h-full flex-col gap-4 p-2">
          <section className="flex w-full items-center gap-2">
            <MessageCircle size={16} />
            <h1 className="text-sm font-bold">
              {translations('comments.title')}
            </h1>
          </section>

          <div className="relative">
            {/* 1 */}
            <div className="absolute left-5 top-[15px] flex h-10 w-10 items-center justify-center rounded-full border bg-[#A5ABBD]">
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
              placeholder={translations('comments.input.placeholder')}
            />

            {/* 3 */}
            <div className="absolute right-6 top-[18px] flex items-center gap-4 text-[#A5ABBD]">
              <Tooltips
                trigger={
                  <label htmlFor="fileUpload">
                    <Paperclip
                      size={20}
                      className="cursor-pointer hover:text-black"
                    />
                  </label>
                }
                content={translations('comments.ctas.attach_file.placeholder')}
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
                    <Button size="sm" onClick={handleSubmitComment}>
                      Send
                    </Button>
                  )
                }
                content={translations('comments.ctas.send.placeholder')}
              />
            </div>
          </div>

          <div className="flex flex-col">
            {/* attached files */}
            {files?.length > 0 && (
              <span className="text-xs font-bold">
                {translations('comments.attached_files_heading')}
              </span>
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
                  invalidateId={debitNoteId}
                  comment={comment}
                />
              ))}

            {!isCommentLoading && comments?.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-gray-50 p-4 text-sm text-[#939090]">
                <h1>{translations('comments.emtpyStateComponent.title')}</h1>
                <p>{translations('comments.emtpyStateComponent.para')}</p>
              </div>
            )}
          </section>
        </div>
      </section>

      <ProtectedWrapper permissionCode={'permission:sales-debit-note-action'}>
        {/* cta's for accept/reject debit note */}
        {debitNote?.status === 'PENDING' && (
          <div className="sticky bottom-0 z-10 flex w-full justify-end gap-2 bg-white">
            <DebitNoteModal cta="reject" debitNote={debitNote} />
            <DebitNoteModal cta="accept" debitNote={debitNote} />
          </div>
        )}
      </ProtectedWrapper>
    </Wrapper>
  );
};

export default ViewDebitNote;
