/* eslint-disable jsx-a11y/alt-text */

'use client';

import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { paymentApi } from '@/api/payments/payment_api';
import Tooltips from '@/components/auth/Tooltips';
import Comment from '@/components/comments/Comment';
import InvoicePDFViewModal from '@/components/Modals/InvoicePDFViewModal';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import AcknowledgePayment from '@/components/payments/AcknowledgePayment';
import PaymentOverview from '@/components/payments/PaymentsOverview';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/custom-hooks/useMetaData';
import {
  createComments,
  getComments,
} from '@/services/Debit_Note_Services/DebitNoteServices';
import {
  acknowledgePayment,
  getPaymentsDetails,
  rejectPayment,
} from '@/services/Payment_Services/PaymentServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUp,
  Building2,
  Check,
  FileText,
  Image,
  Paperclip,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const PaymentDetails = () => {
  useMetaData('Hues! - Payments Details', 'HUES PAYMENT DETAILS');
  const translations = useTranslations('sales.sales-payments');
  const translationsComments = useTranslations(
    'sales.sales-debit_notes.debit_notes_details',
  );

  const queryClient = useQueryClient();
  const params = useParams();
  const [files, setFiles] = useState([]);
  const [comment, setComment] = useState({
    files: [],
    contextType: '',
    contextId: null,
    text: '',
  });

  const paymentsOrdersBreadCrumbs = [
    {
      id: 1,
      name: 'sales.sales-payments.title',
      path: '/sales/sales-payments',
      show: true, // Always show
    },
    {
      id: 2,
      name: 'sales.sales-payments.payment-details.title',
      path: `/sales/sales-payments/${params.payment_id}`,
      show: true, // Always show
    },
  ];

  const { data: paymentsDetails } = useQuery({
    queryKey: [paymentApi.getPaymentDetails.endpointKey],
    queryFn: () => getPaymentsDetails(params.payment_id),
    select: (data) => data?.data?.data,
  });

  const uploadMedia = async (file) => {
    setFiles((prev) => [...prev, file]);
    toast.success('File attached successfully!');
  };

  const handleFileRemove = (file) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
  };

  // get comments
  const { data: comments, isLoading: isCommentLoading } = useQuery({
    queryKey: [DebitNoteApi.getComments.endpointKey],
    queryFn: () => getComments(params.payment_id, 'PAYMENT'),
    select: (comments) => comments.data.data,
  });

  const createCommentMutation = useMutation({
    mutationKey: [DebitNoteApi.createComments.endpointKey],
    mutationFn: createComments,
    onSuccess: () => {
      toast.success(translationsComments('successMsg.comment_success'));
      queryClient.invalidateQueries([
        DebitNoteApi.getComments.endpointKey,
        params.payment_id,
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
        error.response.data.message || translationsComments('errorMsg.common'),
      );
    },
  });

  const handleSubmitComment = () => {
    if (!comment.text.trim()) {
      toast.error(translations('errorMsg.comment_error_emtpy'));
      return;
    }

    const formData = new FormData();
    formData.append('contextType', 'PAYMENT'); // assuming fixed or dynamic context
    formData.append('contextId', params.payment_id); // use actual ID here
    formData.append('text', comment.text);

    // handle files if any
    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    createCommentMutation.mutate(formData);
  };

  const AcknowledgePaymentMutation = useMutation({
    mutationKey: [paymentApi.acknowledgePayment.endpointKey],
    mutationFn: acknowledgePayment,
    onSuccess: () => {
      toast.success('Payment Successfully Acknowledged');

      // invalidate
      queryClient.invalidateQueries([paymentApi.getPaymentDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const rejectPaymentMutation = useMutation({
    mutationKey: [paymentApi.rejectPayment.endpointKey],
    mutationFn: rejectPayment,
    onSuccess: () => {
      toast.success('Payment Rejected');

      // invalidate
      queryClient.invalidateQueries([paymentApi.getPaymentDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  return (
    <Wrapper className="flex h-full flex-col py-2">
      <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
        {/* breadcrumbs */}
        <OrderBreadCrumbs
          possiblePagesBreadcrumbs={paymentsOrdersBreadCrumbs}
        />

        {paymentsDetails?.status === 'ACCEPTED' && (
          <InvoicePDFViewModal
            isPaymentReciept={true}
            Url={paymentsDetails?.receiptAttachment}
          />
        )}
      </section>

      {/* OVERVIEW */}
      <PaymentOverview paymentsDetails={paymentsDetails} />

      {/* COMMENTS */}
      <div className="flex h-full flex-col gap-4 p-2">
        <h1 className="text-sm font-bold">
          {translationsComments('comments.title')}
        </h1>

        <div className="relative">
          {/* 1 */}
          <div className="absolute left-5 top-2 flex h-10 w-10 items-center justify-center rounded-full border bg-[#A5ABBD]">
            <Building2 size={20} />
          </div>

          {/* 2 */}
          <Textarea
            name="comment"
            value={comment.text}
            onChange={(e) => {
              setComment((prev) => ({ ...prev, text: e.target.value }));
            }}
            className="w-full flex-1 px-24"
            placeholder={translationsComments('comments.input.placeholder')}
          />

          {/* 3 */}
          <div className="absolute right-10 top-5 flex gap-4 text-[#A5ABBD]">
            <Tooltips
              trigger={
                <label htmlFor="fileUpload">
                  <Paperclip
                    size={20}
                    className="cursor-pointer hover:text-black"
                  />
                </label>
              }
              content={translationsComments(
                'comments.ctas.attach_file.placeholder',
              )}
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
              content={translationsComments('comments.ctas.send.placeholder')}
            />
          </div>
        </div>

        <div className="flex flex-col">
          {/* attached files */}
          {files?.length > 0 && (
            <span className="text-xs font-bold">
              {translationsComments('comments.attached_files_heading')}
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
                invalidateId={params.payment_id}
                comment={comment}
              />
            ))}

          {!isCommentLoading && comments?.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-gray-50 p-4 text-sm text-[#939090]">
              <h1>
                {translationsComments('comments.emtpyStateComponent.title')}
              </h1>
              <p>{translationsComments('comments.emtpyStateComponent.para')}</p>
            </div>
          )}
        </section>
      </div>

      {/* footer ctas */}
      <div className="sticky bottom-0 z-10 flex justify-end border-t bg-white shadow-md">
        {paymentsDetails?.status === 'PENDING' && (
          <section className="flex gap-2 py-2">
            <Button
              variant="outline"
              size="sm"
              className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              onClick={() => {
                rejectPaymentMutation.mutate(params.payment_id);
              }}
            >
              Deny
            </Button>
            <AcknowledgePayment
              poNumber={paymentsDetails?.paymentReferenceNumber}
              onAcknowledged={() => {
                AcknowledgePaymentMutation.mutate(params.payment_id);
              }}
            />
          </section>
        )}
      </div>
    </Wrapper>
  );
};

export default PaymentDetails;
