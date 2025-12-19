/* eslint-disable jsx-a11y/alt-text */
import { Building2, Check, FileText, Image, Paperclip, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';
import { toast } from 'sonner';
import Tooltips from '../auth/Tooltips';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

const RemarkBox = ({
  remarks,
  setRemarks,
  attachedFiles,
  setAttachedFiles,
}) => {
  const translations = useTranslations('components.remarksBox');

  const uploadMedia = async (file) => {
    setAttachedFiles((prev) => [...prev, file]);
    toast.success(translations('label_file_attached'));
  };

  const handleFileRemove = (file) => {
    setAttachedFiles((prevFiles) =>
      prevFiles.filter((f) => f.name !== file.name),
    );
  };

  return (
    <section className="mt-6 flex flex-col gap-2">
      <Label>Remarks (Optional)</Label>
      {/* remark input */}
      <div className="relative">
        {/* 1 */}
        <div className="absolute left-5 top-[15px] flex h-10 w-10 items-center justify-center rounded-full bg-[#A5ABBD]">
          <Building2 size={20} />
        </div>

        {/* 2 */}
        <Textarea
          name="remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="min-h-[70px] px-20 pt-[20px]" // set min-height as needed
          placeholder={translations('placeholder_remarks')}
        />

        {/* 3 */}
        <div className="absolute right-5 top-[25px] flex items-center gap-4 text-[#A5ABBD]">
          <Tooltips
            trigger={
              <label htmlFor="fileAttached">
                <Paperclip
                  size={20}
                  className="cursor-pointer hover:text-black"
                />
              </label>
            }
            content={translations('tooltip_attach_file')}
          />

          <input
            type="file"
            id="fileAttached"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files[0]) {
                uploadMedia(e.target.files[0]);
              }
            }}
          />
        </div>
      </div>

      {/* upload files */}
      <div className="flex flex-col">
        {/* attached files */}
        {attachedFiles?.length > 0 && (
          <span className="text-xs font-bold">
            {translations('label_attached_proofs')}
          </span>
        )}
        <div className="flex flex-wrap gap-4">
          {attachedFiles?.map((file) => (
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
                  // eslint-disable-next-line jsx-a11y/alt-text
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
                  {translations('label_file_attached')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RemarkBox;
