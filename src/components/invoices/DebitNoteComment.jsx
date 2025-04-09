import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { LocalStorageService } from '@/lib/utils';
import { updateComments } from '@/services/Debit_Note_Services/DebitNoteServices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Pencil, X } from 'lucide-react';
import moment from 'moment';
import React, { useState } from 'react';
import { toast } from 'sonner';
import ViewImage from '../ui/ViewImage';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

const DebitNoteComment = ({ comment, debitNoteId }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [editedComments, setEditedComments] = useState({
    text: comment.text || '',
    files: [],
    attachementsToDelete: [],
    commentId: comment.commentid ?? null,
  });

  const formatDateTime = (itemDateT) => {
    const itemDateTime = moment(itemDateT);
    const now = moment();

    if (itemDateTime.isSame(now, 'day'))
      return `Today ${itemDateTime.format('HH:mm:ss')}`;
    if (itemDateTime.isSame(now.clone().subtract(1, 'days'), 'day'))
      return `Yesterday ${itemDateTime.format('HH:mm:ss')}`;
    return `${itemDateTime.format('DD-MM-YYYY HH:mm:ss')}`;
  };

  const updateCommentMutation = useMutation({
    mutationKey: [DebitNoteApi.updateComments.endpointKey],
    mutationFn: updateComments,
    onSuccess: () => {
      toast.success('Comment updated');
      queryClient.invalidateQueries([
        DebitNoteApi.getComments.endpointKey,
        debitNoteId,
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
    <div className="flex justify-start gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-[#A5ABBD]">
        <Building2 size={20} />
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="flex justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="flex items-center gap-2 text-sm font-bold">
              {comment?.enterprisename ?? 'Name not available'}
              {enterpriseId === comment?.enterpriseid && !isEditing && (
                <Pencil
                  className="cursor-pointer hover:text-primary"
                  size={14}
                  onClick={() => setIsEditing(true)}
                />
              )}
            </h1>
            <p className="text-sm font-bold text-[#A5ABBD]">
              {formatDateTime(comment?.commentedat)}
            </p>
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
                    <ViewImage
                      mediaName={attachment.fileName}
                      mediaImage={attachment.document?.url}
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
            <p className="text-sm text-[#7F8185]">{comment.text}</p>
            <div className="flex flex-wrap gap-2">
              {comment?.attachments?.map((attachment) => (
                <ViewImage
                  key={attachment.id}
                  mediaName={attachment.fileName}
                  mediaImage={attachment.document?.url}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DebitNoteComment;
