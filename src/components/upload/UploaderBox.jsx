'use client';

import React, { useState } from 'react';
import { UploadCloud, Upload, Download, Check, MoveLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import { FileUploader } from 'react-drag-drop-files';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import SubHeader from '../ui/Sub-header';

const FileUploadBox = ({
  name = 'Upload',
  onClose,
  sampleDownloadFn,
  uploadDocFn,
  queryClient,
  acceptedTypes = ['xls', 'csv'],
  maxSizeText = 'Max 10MB',
  noteText = 'Trade Enabled for eSigned Inventories Only.',
  containerMinWidth = '700px',
}) => {
  const [files, setFiles] = useState([]);

  // Upload File
  const uploadFile = async (file) => {
    if (!file) return;

    // Prevent duplicate upload
    if (files.some((f) => f.name === file.name)) {
      toast.warning('File already uploaded');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await uploadDocFn({ data: formData });
      toast.success('Upload Successfully');
      setFiles((prev) => [...prev, file]);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    }
  };

  // Sample Download
  const sampleDownloadMutation = useMutation({
    mutationFn: sampleDownloadFn,
    onSuccess: (res) => {
      const publicUrl = res?.data?.data?.publicUrl;
      if (!publicUrl) {
        toast.error('Invalid download URL');
        return;
      }

      toast.success('Sample file downloaded');

      const link = document.createElement('a');
      link.href = publicUrl;
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  return (
    <Wrapper>
      {/* Header */}
      <section className="flex items-end gap-2">
        <MoveLeft className="hover:cursor-pointer" onClick={onClose} />
        <SubHeader name={name}></SubHeader>
      </section>

      <div className="flex grow flex-col items-center justify-center gap-2 py-8">
        <FileUploader
          handleChange={uploadFile}
          onDrop={uploadFile}
          name="file"
          types={acceptedTypes}
        >
          <div className="mb-2 flex w-full min-w-[700px] cursor-pointer items-center justify-between gap-3 rounded border-2 border-dashed border-sky-300 px-5 py-10">
            <div className="flex items-center gap-4">
              <UploadCloud className="text-sky-500" size={40} />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-darkText">
                  Drag & Drop or Select a File ({maxSizeText},
                  <span className="font-bold text-sky-500">
                    {' '}
                    .{acceptedTypes.join('/.')}{' '}
                  </span>
                  )
                </p>
                <p className="text-xs font-normal text-sky-500">{noteText}</p>
              </div>
            </div>

            {/* Visual button ONLY */}
            <Button
              variant="blue_outline"
              size="sm"
              type="button"
              tabIndex={-1}
              aria-hidden="true"
            >
              <Upload size={14} />
              Select
            </Button>
          </div>
        </FileUploader>

        {/* Sample Download */}
        <Button
          variant="outline"
          className="w-full max-w-[700px]"
          onClick={() => sampleDownloadMutation.mutate()}
          disabled={sampleDownloadMutation.isLoading}
          type="button"
        >
          <Download size={14} />
          {sampleDownloadMutation.isLoading ? 'Downloading...' : 'Sample'}
        </Button>

        <div className="mt-auto h-[1px] w-full max-w-[700px] bg-neutral-300" />

        {/* Uploaded Files */}
        {files?.map((file) => (
          <div
            key={file.name}
            className="mt-4 flex items-center justify-between gap-4 rounded-sm border border-neutral-300 p-2"
            style={{ minWidth: containerMinWidth }}
          >
            <div className="flex items-center gap-4">
              <p className="text-xs font-medium">{file.name}</p>

              <div className="h-1 w-1 rounded-full bg-neutral-400" />
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-green-500/10 p-2 text-green-500">
                  <Check size={10} />
                </div>
                <p className="text-xs font-medium text-green-500">
                  Upload Successfully!
                </p>
              </div>
            </div>
            {/* Preview */}
            <Button
              size="sm"
              variant="blue_outline"
              type="button"
              onClick={() => {
                queryClient();
                onClose();
              }}
            >
              Preview
            </Button>
          </div>
        ))}
      </div>
    </Wrapper>
  );
};

export default FileUploadBox;
