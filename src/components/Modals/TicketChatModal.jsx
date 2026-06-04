'use client';

import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { capitalize, getEnterpriseId } from '@/appUtils/helperFunctions';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  createComments,
  getComments,
} from '@/services/Debit_Note_Services/DebitNoteServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Paperclip, Send, X } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import InvoicePDFViewModal from './InvoicePDFViewModal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Loading from '../ui/Loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export default function TicketChatModal({
  isOpen,
  onOpenChange,
  ticket,
  onStatusChange,
}) {
  const queryClient = useQueryClient();
  const translations = useTranslations('components.commentBox');
  const currentEnterpriseId = getEnterpriseId();
  const ticketId = ticket?.id || ticket?._id;
  const canChangeStatus =
    Number(ticket?.sourceEnterpriseId) === Number(currentEnterpriseId) &&
    ticket?.sourceEnterpriseType === 'ENTERPRISE';

  const [replyText, setReplyText] = useState('');
  const [files, setFiles] = useState([]);
  const chatEndRef = useRef(null);
  const [localStatus, setLocalStatus] = useState(ticket?.status || 'OPEN');

  useEffect(() => {
    if (ticket?.status) {
      setLocalStatus(ticket.status);
    }
  }, [ticket?.status]);

  // Fetch comments
  const {
    data: comments,
    isLoading: isCommentLoading,
    refetch: refetchComments,
  } = useQuery({
    queryKey: [DebitNoteApi.getComments.endpointKey, ticketId],
    queryFn: () => getComments(ticketId, 'TICKET'),
    select: (res) => res?.data?.data,
    enabled: isOpen && !!ticketId,
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationKey: [DebitNoteApi.createComments.endpointKey],
    mutationFn: createComments,
    onSuccess: () => {
      toast.success('Message sent successfully');
      queryClient.invalidateQueries([
        DebitNoteApi.getComments.endpointKey,
        ticketId,
      ]);
      refetchComments();
      setReplyText('');
      setFiles([]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          translations('toast_general_error') ||
          'Failed to send comment',
      );
    },
  });

  // Auto scroll to bottom when a new message is received or when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [comments, isOpen]);

  if (!ticket) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim() && files.length === 0) {
      toast.error('Please enter a message');
      return;
    }

    const formData = new FormData();
    formData.append('contextType', 'TICKET');
    formData.append('contextId', ticketId);
    formData.append('text', replyText);

    // handle files if any
    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    createCommentMutation.mutate(formData);
  };

  const formatDateTime = (itemDateT) => {
    if (!itemDateT) return '';
    const itemDateTime = moment(itemDateT);
    const now = moment();

    if (itemDateTime.isSame(now, 'day')) {
      return itemDateTime.format('hh:mm A');
    }

    return itemDateTime.format('D MMMM, YYYY hh:mm A');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-sm p-6 shadow-xl focus:outline-none">
        {/* Ticket Header details */}
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              {ticket.ticketNumber && (
                <span className="rounded bg-slate-100 px-2 py-0.5 font-sans text-xs font-semibold text-slate-500">
                  {ticket.ticketNumber}
                </span>
              )}
              {ticket.referenceNumber && (
                <span className="rounded bg-blue-50 px-2 py-0.5 font-sans text-xs font-semibold text-blue-600">
                  Ref: {ticket.referenceNumber}
                </span>
              )}
            </div>
            <h2 className="mt-1.5 text-xl font-bold leading-tight tracking-tight text-slate-800">
              {ticket.title}
            </h2>
            <p className="mt-1 font-sans text-xs font-semibold text-slate-400">
              {ticket.subCategory &&
                `${capitalize(ticket.subCategory.replace(/_/g, ' '))}`}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold shadow-sm ${
              localStatus === 'OPEN'
                ? 'border-amber-200/50 bg-amber-50 text-amber-600'
                : localStatus === 'WAITING'
                  ? 'border-blue-200/50 bg-blue-50 text-blue-600'
                  : localStatus === 'RESOLVED'
                    ? 'border-emerald-200/50 bg-emerald-50 text-emerald-600'
                    : 'border-gray-200/50 bg-gray-50 text-gray-600'
            }`}
          >
            {localStatus}
          </span>
        </div>

        {/* Remarks and details */}
        {ticket.remarks && (
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs text-slate-600">
            <span className="mb-1 block font-semibold text-slate-700">
              Remarks:
            </span>
            {ticket.remarks}
          </div>
        )}

        {/* Linked Transaction Details */}
        {ticket.transaction && (
          <div className="rounded-sm border bg-white p-2 text-sm font-semibold">
            Linked to: {ticket.transaction}
          </div>
        )}

        {/* Status Dropdown */}
        <Select
          value={localStatus}
          disabled={!canChangeStatus}
          onValueChange={(val) => {
            setLocalStatus(val);
            onStatusChange(ticketId, val);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue className="text-md font-medium" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="WAITING">Waiting</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>

        {/* Chat Box Container */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {/* Chat Messages */}
          <div className="scrollBarStyles max-h-[200px] flex-1 flex-grow space-y-4 overflow-y-auto bg-slate-50/30 p-4">
            {isCommentLoading ? (
              <div className="flex h-full items-center justify-center text-slate-400">
                <Loading />
              </div>
            ) : comments && comments.length > 0 ? (
              [...comments].reverse().map((msg) => {
                const isMyComment = msg.enterpriseid === currentEnterpriseId;
                return (
                  <div
                    key={msg.id || msg.commentid}
                    className={`flex flex-col ${
                      isMyComment ? 'items-end' : 'items-start'
                    }`}
                  >
                    <span className="mb-0.5 block px-1 text-[10px] font-bold text-slate-400">
                      {msg.enterprisename || 'System'}
                    </span>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        isMyComment
                          ? 'rounded-tr-none bg-blue-600 font-medium text-white'
                          : 'rounded-tl-none bg-slate-100 font-medium text-slate-700'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Attachments inside bubble */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2 border-t border-dashed border-white/20 pt-2">
                          {msg.attachments.map((attachment) => {
                            return (
                              <InvoicePDFViewModal
                                key={attachment.id}
                                cta={
                                  <div
                                    className={`flex max-w-[200px] cursor-pointer items-center gap-1.5 overflow-hidden truncate rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                                      isMyComment
                                        ? 'border-blue-500 bg-blue-700/30 text-blue-100 hover:bg-blue-700/50'
                                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <Paperclip size={12} className="shrink-0" />
                                    <span className="truncate">
                                      {attachment?.fileName}
                                    </span>
                                  </div>
                                }
                                Url={attachment?.document?.url}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <span
                      className={`mt-1 block text-[10px] font-semibold text-slate-400 ${
                        isMyComment ? 'mr-1' : 'ml-1'
                      }`}
                    >
                      {formatDateTime(msg.commentedat)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center text-slate-400">
                <p className="text-sm font-medium">
                  No conversation history yet.
                </p>
                {ticket.description && (
                  <p className="mt-1 max-w-[80%] text-xs italic text-slate-400">
                    Description: &ldquo;{ticket.description}&rdquo;
                  </p>
                )}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Files preview list */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50 p-3">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex max-w-xs items-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1 pl-2 pr-1 text-xs font-medium text-slate-600"
                >
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFiles((prev) => prev.filter((f) => f !== file))
                    }
                    className="rounded-full p-0.5 text-slate-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Chat Reply Form */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2.5 border-t border-slate-100 bg-slate-50/50 p-3.5"
          >
            <input
              type="file"
              id="fileUpload"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files) {
                  const newFiles = Array.from(e.target.files);
                  setFiles((prev) => [...prev, ...newFiles]);
                  toast.success(
                    translations('toast_file_attached') ||
                      'Files attached successfully!',
                  );
                }
              }}
            />
            <label
              htmlFor="fileUpload"
              className="shrink-0 cursor-pointer text-slate-400 transition-colors hover:text-slate-600"
            >
              <Paperclip size={20} />
            </label>
            <Input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type a reply..."
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <Button
              type="submit"
              disabled={!replyText.trim() && files.length === 0}
              size="sm"
            >
              <Send
                size={16}
                className="-translate-y-[0.5px] translate-x-[0.5px]"
              />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
