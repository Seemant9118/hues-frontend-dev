/* eslint-disable import/no-extraneous-dependencies */

'use client';

import { uploadMediaInComments } from '@/services/Debit_Note_Services/DebitNoteServices';
import ImageUploader from 'quill-image-uploader';
import 'quill-image-uploader/dist/quill.imageUploader.min.css';
import React, { useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'sonner';
import { Button } from './button';

Quill.register('modules/imageUploader', ImageUploader);

const RichTextEditorNew = ({ comment, setComment, onSubmit }) => {
  const modules = useMemo(() => {
    return {
      toolbar: [
        [{ header: '1' }, { header: '2' }, { font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [
          { list: 'ordered' },
          { list: 'bullet' },
          { indent: '-1' },
          { indent: '+1' },
        ],
        ['image'],
      ],
      clipboard: {
        matchVisual: false,
      },
      imageUploader: {
        upload: async (file) => {
          const formData = new FormData();
          formData.append('files', file);

          try {
            const { data } = await uploadMediaInComments(formData);
            toast.success('Upload Successful');

            // Use a functional state update to ensure you're appending correctly
            setComment((prevComment) => ({
              ...prevComment,
              mediaLinks: [...prevComment.mediaLinks, data.data[0]], // Append the new link to the existing array
            }));

            return data.data[0];
          } catch (error) {
            const errorMessage =
              error.response?.data?.message || 'Something went wrong';
            toast.error(errorMessage);
            throw new Error(errorMessage); // Throw error to notify Quill of failure
          }
        },
      },
    };
  }, []);

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'image',
  ];

  const handleClear = () => {
    setComment({ ...comment, comment: '', mediaLinks: [] }); // Clear media links as well
  };

  return (
    <div className="quill-container mt-2 flex flex-col gap-2">
      <ReactQuill
        value={comment.comment}
        onChange={(content) => {
          setComment((prev) => ({ ...prev, comment: content }));
        }}
        modules={modules}
        formats={formats}
        theme="snow"
        className="rounded-lg"
      />

      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          onClick={handleClear}
          className="bg-red-500 p-2 text-white hover:bg-red-600"
        >
          Clear
        </Button>

        <Button
          size="sm"
          onClick={onSubmit}
          className="bg-blue-500 p-2 text-white hover:bg-blue-600"
        >
          Comment
        </Button>
      </div>
    </div>
  );
};

export default RichTextEditorNew;
