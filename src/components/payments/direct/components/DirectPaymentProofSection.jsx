/* eslint-disable jsx-a11y/alt-text */
import { Check, FileText, Image, Upload, UploadCloud, X } from 'lucide-react';
import React from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function DirectPaymentProofSection({
  files,
  handleAttached,
  handleFileRemove,
  translations,
}) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:p-5">
      <Label className="text-sm font-semibold">
        {translations('form.upload_proof.title')}
      </Label>
      <div className="flex flex-wrap gap-4">
        {files?.map((file) => (
          <div
            key={file.name}
            className="relative flex w-full flex-col gap-2 rounded-xl border border-neutral-300 bg-white p-4 shadow-sm sm:w-64"
          >
            <X
              size={16}
              onClick={() => handleFileRemove(file)}
              className="absolute right-2 top-2 cursor-pointer text-neutral-500 hover:text-red-500"
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
              {file.name.split('.').pop() === 'pdf' ? (
                <FileText size={16} className="text-red-600" />
              ) : (
                <Image size={16} className="text-primary" />
              )}
            </div>
            <p className="truncate text-sm font-medium text-neutral-800">
              {file.name}
            </p>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-green-500/10 p-1.5 text-green-600">
                <Check size={12} />
              </div>
              <p className="text-xs font-medium text-green-600">
                {translations('successMsg.attached_success')}
              </p>
            </div>
          </div>
        ))}
      </div>
      <FileUploader
        handleChange={handleAttached}
        name="file"
        types={['png', 'pdf']}
      >
        <div className="mb-2 flex w-full cursor-pointer flex-col items-start justify-between gap-4 rounded-xl border-2 border-dashed border-[#288AF9] px-4 py-6 sm:px-5 md:flex-row md:items-center md:py-10">
          <div className="flex items-start gap-4 md:items-center">
            <UploadCloud className="text-[#288AF9]" size={40} />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-darkText">
                {translations('form.upload_proof.para')}
              </p>
              <p className="text-xs font-normal text-[#288AF9]">
                {translations('form.upload_proof.note')}
              </p>
            </div>
          </div>
          <Button variant="blue_outline" className="w-full md:w-auto">
            <Upload />
            {translations('form.upload_proof.ctas.select')}
          </Button>
        </div>
      </FileUploader>
    </section>
  );
}
