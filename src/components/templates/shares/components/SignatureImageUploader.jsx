'use client';

import { Check, Upload } from 'lucide-react';
import React from 'react';

const MAX_IMAGE_SIZE_BYTES = 20480; // 20 KB
const VALID_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export default function SignatureImageUploader({
  isActive,
  signatureBase64,
  uploadedFileName,
  onSignatureChange,
  onError,
}) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name;
    onSignatureChange?.(null, fileName);
    onError?.(null);

    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      onError?.('Unsupported format. Please select PNG, JPG, or JPEG.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      onError?.(
        `File size (${(file.size / 1024).toFixed(1)} KB) exceeds the 20 KB limit.`,
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onSignatureChange?.(event.target.result, fileName);
    };
    reader.onerror = () => {
      onError?.('Failed to read signature image. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  if (!isActive) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium text-neutral-500">
        Upload image of your signature (PNG, JPG, max 20 KB):
      </span>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50/70 p-6 transition hover:border-blue-400 hover:bg-blue-50/30">
        <Upload className="h-8 w-8 text-neutral-400" />
        <span className="mt-2 text-xs font-medium text-neutral-700">
          {uploadedFileName || 'Choose a signature image'}
        </span>
        <span className="text-[10px] text-neutral-400">
          PNG, JPG or JPEG up to 20 KB
        </span>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>

      {signatureBase64 && (
        <div className="mt-1 flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-2">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={signatureBase64}
              alt="Signature preview"
              className="h-10 max-w-[120px] object-contain"
            />
            <span className="max-w-[180px] truncate text-xs text-neutral-600">
              {uploadedFileName}
            </span>
          </div>
          <Check size={16} className="text-emerald-500" />
        </div>
      )}
    </div>
  );
}
