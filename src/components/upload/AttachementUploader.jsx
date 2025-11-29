'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, FileText, Image, Upload, UploadCloud, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FileUploader } from 'react-drag-drop-files';
import { toast } from 'sonner';

export default function AttachmentUploader({
  label = 'Attachments',
  acceptedTypes = ['png', 'pdf', 'jpg', 'jpeg'],
  files,
  setFiles,
}) {
  const translations = useTranslations('components.attachment_uploader');
  const handleAdd = (file) => {
    const updated = [...files, file];
    setFiles(updated);
    toast.success(translations('toast.fileAttached'));
  };

  const handleRemove = (file) => {
    const updated = files.filter((f) => f !== file);
    setFiles(updated);
    toast.warning(translations('toast.fileRemoved'));
  };

  const getIcon = (file) => {
    const ext = file.name.split('.').pop();
    if (ext === 'pdf') return <FileText size={16} className="text-red-600" />;
    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image size={16} className="text-primary" />;
  };

  return (
    <div className="flex flex-col gap-2 p-1">
      <Label className="text-sm font-semibold">{label}</Label>

      {/* Uploaded Files */}
      <div className="flex flex-wrap gap-4">
        {files.map((file) => (
          <div
            key={file.name}
            className="relative flex w-64 flex-col gap-2 rounded-xl border border-neutral-300 bg-white p-4 shadow-sm"
          >
            {/* Remove */}
            <X
              size={16}
              onClick={() => handleRemove(file)}
              className="absolute right-2 top-2 cursor-pointer text-neutral-500 hover:text-red-500"
            />

            {/* File Icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
              {getIcon(file)}
            </div>

            {/* File name */}
            <p className="truncate text-sm font-medium text-neutral-800">
              {file.name}
            </p>

            {/* Success */}
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-green-500/10 p-1.5 text-green-600">
                <Check size={12} />
              </div>
              <p className="text-xs font-medium text-green-600">
                {translations('fileStatus')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* File Dropzone */}
      <FileUploader handleChange={handleAdd} name="file" types={acceptedTypes}>
        <div className="mb-2 flex min-w-[700px] cursor-pointer items-center justify-between gap-3 rounded border-2 border-dashed border-[#288AF9] px-5 py-10">
          <div className="flex items-center gap-4">
            <UploadCloud className="text-[#288AF9]" size={40} />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-darkText">
                {translations('upload.dropzoneTitle')}
              </p>
              <p className="text-xs font-normal text-[#288AF9]">
                {translations('upload.supportedFormatsLabel')}{' '}
                {acceptedTypes.join(', ').toUpperCase()}
              </p>
            </div>
          </div>
          <Button variant="blue_outline">
            <Upload />
            {translations('upload.selectButton')}
          </Button>
        </div>
      </FileUploader>
    </div>
  );
}
