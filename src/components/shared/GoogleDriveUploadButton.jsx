import React from 'react';
import { Button } from '@/components/ui/button';
import { HardDriveUpload } from 'lucide-react';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';

export default function GoogleDriveUploadButton({
  s3Url,
  label = 'Save to Google Drive',
  variant = 'default',
  size = 'sm',
  className = '',
  disabled = false,
}) {
  const {
    hasUploadPermission,
    isConnected,
    connect,
    isConnecting,
    upload,
    isUploading,
  } = useGoogleDrive();

  if (!hasUploadPermission) {
    return null;
  }

  const handleClick = () => {
    if (isConnected) {
      upload(s3Url);
    } else {
      connect();
    }
  };

  const isPending = isConnecting || isUploading;

  return (
    <Button
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
      onClick={handleClick}
      disabled={disabled || isPending}
    >
      <HardDriveUpload size={16} />
      {isConnecting
        ? 'Connecting...'
        : isUploading
          ? 'Uploading...'
          : isConnected
            ? label
            : 'Connect Google Drive'}
    </Button>
  );
}
