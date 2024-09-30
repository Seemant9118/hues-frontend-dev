/* eslint-disable import/no-unresolved */

'use client';

import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import DebitNoteComment from '@/components/invoices/DebitNoteComment';
import DebitNoteModal from '@/components/Modals/DebitNoteModal';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import Loading from '@/components/ui/Loading';
import RichTextEditorNew from '@/components/ui/RichTextEditorNew';
import Wrapper from '@/components/wrappers/Wrapper';
import {
  createComments,
  getComments,
  getDebitNote,
} from '@/services/Debit_Note_Services/DebitNoteServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

const ViewDebitNote = () => {
  const queryClient = useQueryClient();
  const params = useParams();
  const debitNoteId = params.debit_id;

  const [comment, setComment] = useState({
    debitNoteId,
    comment: '',
    mediaLinks: [],
  });

  const debitNoteBreadCrumbs = [
    {
      id: 1,
      name: 'Debit Notes',
      path: `/sales/sales-invoices/`,
      show: true, // Always show
    },

    {
      id: 2,
      name: 'Debit Note Details',
      path: `/sales/sales-invoices/${debitNoteId}`,
      show: true, // Always show
    },
  ];

  // get debitNote
  const { data: debitNote, isLoading } = useQuery({
    queryKey: [DebitNoteApi.getDebitNote.endpointKey, debitNoteId],
    queryFn: () => getDebitNote(debitNoteId),
    select: (debitNote) => debitNote.data.data,
  });

  // get comments
  const { data: comments, isLoading: isCommentLoading } = useQuery({
    queryKey: [DebitNoteApi.getComments.endpointKey, debitNoteId],
    queryFn: () => getComments(debitNoteId),
    select: (comments) => comments.data.data,
  });

  const formattedAmount = (amount) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
    return formattedAmount;
  };

  const createCommentMutation = useMutation({
    mutationKey: [DebitNoteApi.createComments.endpointKey],
    mutationFn: createComments,
    onSuccess: () => {
      toast.success('Comment Successfully');
      queryClient.invalidateQueries([
        DebitNoteApi.getComments.endpointKey,
        debitNoteId,
      ]);
      setComment({
        debitNoteId,
        comment: '',
        mediaLinks: [],
      });
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleSubmitComment = () => {
    if (!comment.comment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    createCommentMutation.mutate({
      ...comment,
      mediaLinks: [...comment.mediaLinks], // Ensure mediaLinks is correctly passed
    });
  };

  return (
    <Wrapper className="relative">
      <div className="sticky top-0 z-10 flex gap-2 bg-white pt-2">
        {/* breadcrumbs */}
        <OrderBreadCrumbs possiblePagesBreadcrumbs={debitNoteBreadCrumbs} />
      </div>

      {isLoading && <Loading />}
      <section className="scrollBarStyles flex w-full flex-col justify-between gap-2 overflow-y-auto">
        {/* debitNote overview */}
        {!isLoading && debitNote && (
          <div className="flex flex-col gap-8 rounded-lg border bg-white px-8 py-4 shadow-customShadow">
            <section className="flex items-center justify-between">
              <div className="flex flex-col gap-8">
                <h1 className="flex items-center gap-2 text-sm font-bold">
                  {debitNote.referenceNumber}
                  <ConditionalRenderingStatus status={debitNote.status} />
                </h1>
                <div className="flex gap-10">
                  <h1 className="text-sm">
                    <span className="font-bold text-[#ABB0C1]">Date : </span>
                    <span className="text-[#363940]">
                      {moment(debitNote.createdAt).format('DD/MM/YYYY')}
                    </span>
                  </h1>
                  <h1 className="text-sm">
                    <span className="font-bold text-[#ABB0C1]">
                      Total Amount :{' '}
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
              <span className="font-bold text-[#ABB0C1]">Reason : </span>
              <span className="text-[#363940]">{debitNote.remark}</span>
            </h1>

            {debitNote?.status === 'PENDING' && (
              <div className="flex justify-end gap-2">
                <DebitNoteModal cta="reject" debitNote={debitNote} />
                <DebitNoteModal cta="accept" debitNote={debitNote} />
              </div>
            )}
          </div>
        )}

        {/* comments box */}
        <div className="flex flex-col gap-6 p-2">
          <h1 className="text-sm font-bold">Comments</h1>
          <section className="flex flex-col gap-2">
            {isCommentLoading && <Loading />}
            {!isCommentLoading &&
              comments.length > 0 &&
              comments.map((comment) => (
                <DebitNoteComment key={comment.id} comment={comment} />
              ))}

            {!isCommentLoading && comments.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-gray-50 p-4 text-sm text-[#939090]">
                <h1>No Comments yet</h1>
                <p>Say Something to start the conversation</p>
              </div>
            )}
          </section>
        </div>

        {/* comment input - rich text editor : show if status is pending */}

        {debitNote?.status === 'PENDING' && (
          <div className="w-full bg-white">
            <RichTextEditorNew
              comment={comment}
              setComment={setComment}
              onSubmit={handleSubmitComment}
            />
          </div>
        )}
      </section>
    </Wrapper>
  );
};

export default ViewDebitNote;
