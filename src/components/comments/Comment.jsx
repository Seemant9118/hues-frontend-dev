import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { LocalStorageService } from '@/lib/utils';
import { updateComments } from '@/services/Debit_Note_Services/DebitNoteServices';
import { viewPdfInNewTab } from '@/services/Template_Services/Template_Services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Dot, File, X } from 'lucide-react';
import moment from 'moment';
import React, { useState } from 'react';
import { toast } from 'sonner';
import InvoicePDFViewModal from '../Modals/InvoicePDFViewModal';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

const Comment = ({ comment, invalidateId }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [editedComments, setEditedComments] = useState({
    text: '',
    files: [],
    attachementsToDelete: [],
    commentId: null,
  });

  const formatDateTime = (itemDateT) => {
    const itemDateTime = moment(itemDateT);
    const now = moment();

    if (itemDateTime.isSame(now, 'day')) {
      return itemDateTime.format('hh:mm A'); // e.g., 10:00 AM
    }

    return itemDateTime.format('D MMMM, YYYY'); // e.g., 12 April, 2025
  };

  const updateCommentMutation = useMutation({
    mutationKey: [DebitNoteApi.updateComments.endpointKey],
    mutationFn: updateComments,
    onSuccess: () => {
      toast.success('Comment updated');
      queryClient.invalidateQueries([
        DebitNoteApi.getComments.endpointKey,
        invalidateId,
      ]);
      setIsEditing(false);
      setEditedComments((prev) => ({
        ...prev,
        files: [],
        attachementsToDelete: [],
      }));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  const handleFileChange = (e) => {
    setEditedComments((prev) => ({
      ...prev,
      files: [...prev.files, ...Array.from(e.target.files)],
    }));
  };

  const handleRemoveNewFile = (index) => {
    setEditedComments((prev) => {
      const updatedFiles = [...prev.files];
      updatedFiles.splice(index, 1);
      return { ...prev, files: updatedFiles };
    });
  };

  const handleRemoveExistingAttachment = (id) => {
    setEditedComments((prev) => ({
      ...prev,
      attachementsToDelete: [...prev.attachementsToDelete, id],
    }));
  };

  const handleSave = () => {
    if (!editedComments.text.trim()) {
      toast.error('Comment cannot be empty!');
      return;
    }

    const formData = new FormData();
    formData.append('text', editedComments.text);
    formData.append('commentId', editedComments.commentId);

    // Append new files to add
    if (editedComments.files.length > 0) {
      editedComments.files.forEach((file) => {
        formData.append('files', file);
      });
    }
    // Append attachments to delete as a JSON string
    if (editedComments.attachementsToDelete.length > 0) {
      formData.append(
        'attachmentsIdsToDelete',
        JSON.stringify(editedComments.attachementsToDelete),
      );
    }

    updateCommentMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedComments({
      text: comment.text || '',
      files: [],
      attachementsToDelete: [],
      commentId: comment.id ?? null,
    });
  };

  return (
    <div className="flex justify-start gap-2 px-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A5ABBD]">
        <Building2 size={20} />
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="flex justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="flex items-center text-sm font-bold">
              {comment?.enterprisename ?? 'Name not available'}
              <Dot size={16} className="text-[#A5ABBD]" />
              <p className="text-xs font-semibold text-[#A5ABBD]">
                {formatDateTime(comment?.commentedat)}
              </p>
              <Dot size={16} className="text-[#A5ABBD]" />
              {enterpriseId === comment?.enterpriseid && !isEditing && (
                <span
                  className="cursor-pointer text-xs text-primary hover:underline"
                  onClick={() => {
                    setIsEditing(true);
                    setEditedComments({
                      text: comment.text || '',
                      files: [],
                      attachementsToDelete: [],
                      commentId: comment.commentid ?? null,
                    });
                  }}
                >
                  Edit
                </span>
              )}
            </h1>
          </div>
        </div>

        {isEditing ? (
          <>
            <Textarea
              className="w-full rounded border border-gray-300 p-2 text-sm"
              value={editedComments.text}
              onChange={(e) =>
                setEditedComments((prev) => ({ ...prev, text: e.target.value }))
              }
            />

            {/* Existing Attachments */}
            <div className="flex flex-wrap gap-2">
              {comment.attachments
                .filter(
                  (att) =>
                    !editedComments.attachementsToDelete.includes(att.id),
                )
                .map((attachment) => (
                  <div key={attachment.id} className="relative">
                    <InvoicePDFViewModal
                      key={attachment.id}
                      cta={
                        <Button
                          variant="outline"
                          className="w-56 cursor-pointer overflow-hidden px-2 hover:text-primary"
                        >
                          <div className="flex w-full items-center gap-2">
                            <File size={14} className="shrink-0" />
                            <span className="truncate">
                              {attachment?.fileName}
                            </span>
                          </div>
                        </Button>
                      }
                      Url={attachment?.document?.url}
                      name={attachment?.fileName}
                    />
                    <X
                      size={18}
                      className="absolute right-0 top-0 cursor-pointer rounded-full text-red-500"
                      onClick={() =>
                        handleRemoveExistingAttachment(attachment.id)
                      }
                    />
                  </div>
                ))}
            </div>

            {/* New Files */}
            <div className="flex flex-wrap gap-2">
              {editedComments.files.map((file, index) => (
                <div
                  key={`${file.name}-${file.lastModified}`}
                  className="relative w-56 overflow-hidden rounded-md border p-2 text-sm text-gray-700"
                >
                  <div className="flex w-full items-center gap-2">
                    <span className="text-xs text-green-600">(new)</span>
                    <span className="truncate">{file.name}</span>
                  </div>
                  <X
                    size={18}
                    className="absolute right-0 top-0 cursor-pointer rounded-full text-red-500"
                    onClick={() => handleRemoveNewFile(index)}
                  />
                </div>
              ))}
            </div>

            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="text-sm text-gray-700"
            />

            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm">{comment.text}</p>
            <div className="flex flex-wrap gap-2">
              {comment?.attachments?.length > 0 &&
                comment.attachments.map((attachment) => {
                  const isPdf = attachment?.document?.url
                    ?.toLowerCase()
                    .endsWith('.pdf');

                  const handleClick = () => {
                    if (isPdf) {
                      viewPdfInNewTab(attachment?.document?.url);
                    } else {
                      // Open modal manually (if modal logic allows it)
                      // Or rely on `InvoicePDFViewModal` for non-PDFs
                    }
                  };

                  return isPdf ? (
                    <Button
                      key={attachment.id}
                      variant="outline"
                      onClick={handleClick}
                      className="w-56 cursor-pointer overflow-hidden px-2 hover:text-primary"
                    >
                      <div className="flex w-full items-center gap-2">
                        <File size={14} className="shrink-0" />
                        <span className="truncate">{attachment?.fileName}</span>
                      </div>
                    </Button>
                  ) : (
                    <InvoicePDFViewModal
                      key={attachment.id}
                      cta={
                        <Button
                          variant="outline"
                          className="w-56 cursor-pointer overflow-hidden px-2 hover:text-primary"
                        >
                          <div className="flex w-full items-center gap-2">
                            <File size={14} className="shrink-0" />
                            <span className="truncate">
                              {attachment?.fileName}
                            </span>
                          </div>
                        </Button>
                      }
                      Url={attachment?.document?.url}
                      name={attachment?.fileName}
                    />
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Comment;
