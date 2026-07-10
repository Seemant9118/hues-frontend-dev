'use client';

import { capitalize, getEnterpriseId } from '@/appUtils/helperFunctions';
import InvoicePDFViewModal from '@/components/Modals/InvoicePDFViewModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  createChat,
  getChatComments,
  getOrCreateChatRoom,
  updateChat,
} from '@/services/Chat_Services/ChatServices';
import {
  getDocument,
  viewPdfInNewTab,
} from '@/services/Template_Services/Template_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Image as ImageIcon,
  Paperclip,
  Pencil,
  Send,
  X,
} from 'lucide-react';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const EDIT_TIME_LIMIT_MS = 10 * 60 * 1000; // 10 minutes limit

export default function EnterpriseChat({ enterpriseId, enterpriseType }) {
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState('');
  const [files, setFiles] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [activeAttachment, setActiveAttachment] = useState(null);
  const [activeAttachmentUrl, setActiveAttachmentUrl] = useState(null);
  const [isFetchingAttachment, setIsFetchingAttachment] = useState(false);
  const chatEndRef = useRef(null);

  const currentEnterpriseId = getEnterpriseId();
  const chatType = enterpriseType === 'CLIENT' ? 'CLIENT_CHAT' : 'VENDOR_CHAT';

  // Get or Create Chat Room
  const { data: chatRoom, isLoading: isRoomLoading } = useQuery({
    queryKey: ['chatRoom', enterpriseId, chatType],
    queryFn: async () => {
      const res = await getOrCreateChatRoom({
        relationshipId: Number(enterpriseId),
        chatType,
      });
      return res.data.data;
    },
    enabled: !!enterpriseId,
  });

  const chatRoomId = chatRoom?.id;

  // Fetch comments
  const {
    data: comments,
    isLoading: isCommentsLoading,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ['chatComments', chatRoomId],
    queryFn: async () => {
      const res = await getChatComments(chatRoomId);
      return res.data.data;
    },
    enabled: !!chatRoomId,
  });

  const sortedMessages = React.useMemo(() => {
    if (!comments) return [];
    return [...comments].sort(
      (a, b) =>
        new Date(a.commentedat).getTime() - new Date(b.commentedat).getTime(),
    );
  }, [comments]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sortedMessages]);

  const sendMutation = useMutation({
    mutationFn: createChat,
    onSuccess: () => {
      setReplyText('');
      setFiles([]);
      refetchComments();
      queryClient.invalidateQueries(['chatComments', chatRoomId]);
      toast.success('Message sent successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send message');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateChat,
    onSuccess: () => {
      setEditingMessage(null);
      setReplyText('');
      setFiles([]);
      refetchComments();
      queryClient.invalidateQueries(['chatComments', chatRoomId]);
      toast.success('Message edited successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update message');
    },
  });

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
      toast.success(`${selectedFiles.length} file(s) attached!`);
    }
  };

  const removeFile = (fileToRemove) => {
    setFiles((prev) => prev.filter((f) => f !== fileToRemove));
  };

  const handleAttachmentClick = async (attachment) => {
    const docUrl = attachment.document?.url;
    if (!docUrl) {
      toast.error('Attachment link is missing');
      return;
    }

    if (isFetchingAttachment) return;

    const isPDF = attachment.fileName?.toLowerCase()?.endsWith('.pdf');

    if (isPDF) {
      setIsFetchingAttachment(true);
      const toastId = toast.loading('Opening PDF in a new tab...');
      try {
        await viewPdfInNewTab(docUrl);
        toast.dismiss(toastId);
      } catch (error) {
        toast.error('Error opening PDF', { id: toastId });
      } finally {
        setIsFetchingAttachment(false);
      }
    } else {
      setIsFetchingAttachment(true);
      const toastId = toast.loading('Fetching attachment link...');
      try {
        const res = await getDocument(docUrl);
        const publicUrl = res?.data?.data?.publicUrl;
        if (publicUrl) {
          setActiveAttachmentUrl(publicUrl);
          setActiveAttachment(attachment);
          toast.dismiss(toastId);
        } else {
          toast.error('Failed to get public url', { id: toastId });
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Error fetching attachment link',
          { id: toastId },
        );
      } finally {
        setIsFetchingAttachment(false);
      }
    }
  };

  const handleStartEdit = (msg) => {
    setEditingMessage(msg);
    setReplyText(msg.text || '');
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setReplyText('');
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!replyText.trim() && files.length === 0) {
      toast.error('Please enter a message or attach a file');
      return;
    }

    if (editingMessage) {
      const formData = new FormData();
      formData.append('commentId', editingMessage.commentid);
      formData.append('text', replyText.trim());
      formData.append('attachmentsIdsToDelete', JSON.stringify([]));
      files.forEach((file) => {
        formData.append('files', file);
      });
      updateMutation.mutate(formData);
    } else {
      const formData = new FormData();
      formData.append('chatRoomId', chatRoomId);
      formData.append('text', replyText.trim());
      files.forEach((file) => {
        formData.append('files', file);
      });
      sendMutation.mutate(formData);
    }
  };

  if (isRoomLoading || (isCommentsLoading && !comments)) {
    return (
      <div className="flex h-[520px] items-center justify-center bg-white">
        <p className="text-sm font-semibold text-slate-500">
          Loading chat room...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 bg-white px-2">
      {/* Sub-tabs Header */}
      <div className="flex items-center gap-1 border-b border-slate-100 pb-px">
        <button
          type="button"
          className="relative border-b-2 border-primary px-4 py-2.5 text-sm font-bold text-slate-800 transition-colors"
        >
          Conversation
        </button>
      </div>

      {/* Chat Messages Log Panel */}
      <div className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/20 shadow-sm md:h-[540px]">
        {/* Message Bubble List */}
        <div className="scrollBarStyles flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {sortedMessages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-slate-400">
              <p className="text-sm font-medium">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            sortedMessages.map((msg) => {
              const isMe =
                msg.enterpriseid?.toString() ===
                currentEnterpriseId?.toString();
              const isEdited =
                msg.updatedat &&
                msg.commentedat &&
                new Date(msg.updatedat).getTime() !==
                  new Date(msg.commentedat).getTime();
              const diff =
                new Date().getTime() - new Date(msg.commentedat).getTime();
              const canEdit = isMe && Math.abs(diff) < EDIT_TIME_LIMIT_MS;
              const formattedTime = moment(msg.commentedat).format('hh:mm A');

              return (
                <div
                  key={msg.commentid}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Name */}
                  <span
                    className={`mb-0.5 block text-[10px] font-semibold text-slate-400 ${
                      isMe ? 'text-right' : 'text-left'
                    }`}
                  >
                    {capitalize(msg.createdbyname) || 'Unknown'} -{' '}
                    {msg.enterprisename || 'Unknown'}
                  </span>

                  {/* Chat Bubble */}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed shadow-sm transition-all ${
                      isMe
                        ? 'rounded-tr-none bg-primary text-white'
                        : 'rounded-tl-none border border-slate-100 bg-white text-slate-700'
                    }`}
                  >
                    {msg.text && (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}

                    {/* Attachments inside bubble */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div
                        className={`mt-2 flex flex-col gap-1.5 border-t border-dashed pt-2 ${
                          isMe ? 'border-white/20' : 'border-slate-100'
                        }`}
                      >
                        {msg.attachments.map((attachment) => {
                          const isPDF = attachment.fileName
                            ?.toLowerCase()
                            ?.endsWith('.pdf');
                          return (
                            <div
                              key={attachment.id}
                              onClick={() => handleAttachmentClick(attachment)}
                              className={`flex max-w-[220px] cursor-pointer items-center gap-2 overflow-hidden truncate rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                                isMe
                                  ? 'border-primary bg-accent text-primary'
                                  : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {isPDF ? (
                                <FileText
                                  size={14}
                                  className="shrink-0 text-rose-500"
                                />
                              ) : (
                                <ImageIcon
                                  size={14}
                                  className="shrink-0 text-primary"
                                />
                              )}
                              <span className="truncate">
                                {attachment.fileName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {/* Timestamp & Edit Icon */}
                  <span
                    className={`mt-1.5 flex items-center gap-1.5 px-1 text-[10px] font-semibold text-slate-400/80 ${
                      isMe ? 'mr-1 justify-end' : 'ml-1 justify-start'
                    }`}
                  >
                    <span>{formattedTime}</span>
                    {isEdited && <span className="italic">Edited</span>}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(msg)}
                        className="rounded p-0.5 transition-colors hover:bg-slate-200 hover:text-blue-600"
                        title="Edit message"
                      >
                        <Pencil size={10} className="shrink-0" />
                      </button>
                    )}
                  </span>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Selected Files Preview List (Above Input Field) */}
        {files.length > 0 && (
          <div className="scrollBarStyles flex max-h-[85px] shrink-0 flex-wrap gap-2 overflow-y-auto border-t border-slate-100 bg-slate-50 p-3">
            {files.map((file) => (
              <div
                key={`${file.name}-${file.lastModified}-${file.size}`}
                className="animate-fadeIn flex max-w-xs items-center gap-2 rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-1.5 text-xs font-semibold text-slate-600 shadow-sm"
              >
                <span className="max-w-[150px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(file)}
                  className="rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Editing Message Banner */}
        {editingMessage && (
          <div className="flex shrink-0 items-center justify-between border-t border-blue-100 bg-blue-50/80 px-4 py-2 text-xs font-semibold text-blue-800">
            <span>Editing message...</span>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-blue-600 transition-colors hover:text-blue-900"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Input Form Box */}
        <form
          onSubmit={handleSend}
          className="flex shrink-0 items-center gap-3 border-t border-slate-100 bg-slate-50/50 p-3.5"
        >
          {/* File Input */}
          <input
            type="file"
            id="chat-file-upload"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={sendMutation.isPending || updateMutation.isPending}
          />
          <label
            htmlFor="chat-file-upload"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-100/50 hover:text-slate-700"
          >
            <Paperclip size={18} />
          </label>

          {/* Text Input */}
          <Input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type a message..."
            disabled={sendMutation.isPending || updateMutation.isPending}
            className="h-10 flex-grow rounded-sm border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
          />

          {/* Send/Save Button */}
          <Button
            size="sm"
            type="submit"
            disabled={
              (!replyText.trim() && files.length === 0) ||
              sendMutation.isPending ||
              updateMutation.isPending
            }
            className="flex items-center justify-center bg-primary text-white shadow-sm transition-all"
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
      {activeAttachment && activeAttachmentUrl && (
        <InvoicePDFViewModal
          open={!!activeAttachment}
          onOpenChange={(open) => {
            if (!open) {
              setActiveAttachment(null);
              setActiveAttachmentUrl(null);
            }
          }}
          cta={<></>}
          Url={activeAttachment.document?.url}
          resolvedUrl={activeAttachmentUrl}
          isDownloadable={true}
        />
      )}
    </div>
  );
}
