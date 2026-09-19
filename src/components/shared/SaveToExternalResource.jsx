import ExternalStorageAuthModal from '@/components/Modals/ExternalStorageAuthModal';
import GoogleDriveAttachmentsModal from '@/components/Modals/GoogleDriveAttachmentsModal';
import { Button } from '@/components/ui/button';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import Image from 'next/image';
import React, { useState } from 'react';

export default function SaveToExternalResource({ attachments }) {
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { isConnected, connect, bulkUpload, isBulkUploading } =
    useGoogleDrive();

  const handleDriveClick = () => {
    if (!isConnected) {
      setIsAuthModalOpen(true);
    } else {
      setIsDriveModalOpen(true);
    }
  };

  const handleAuthorize = () => {
    setIsAuthModalOpen(false);
    connect();
  };

  const handleSaveAttachments = async (selectedAttachments) => {
    const s3Urls = [];
    const documents = [];

    selectedAttachments.forEach((att) => {
      if (att.isModuleDocument) {
        documents.push({
          documentType: att.documentType,
          ids: [att.id],
        });
      } else if (att.documentUrl) {
        s3Urls.push(att.documentUrl);
      }
    });

    const payload = {
      provider: 'google_drive',
    };
    if (s3Urls.length > 0) payload.s3_urls = s3Urls;
    if (documents.length > 0) payload.documents = documents;

    return bulkUpload(payload);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDriveClick}
        className="flex items-center gap-2 font-bold text-gray-700 max-sm:hidden"
      >
        {/* google drive icon */}
        <Image
          src="/google-drive.png"
          alt="Google Drive"
          width={16}
          height={16}
        />
        Save to G-drive
      </Button>

      <GoogleDriveAttachmentsModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        attachments={attachments}
        onSave={handleSaveAttachments}
        isSaving={isBulkUploading}
      />
      <ExternalStorageAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthorize={handleAuthorize}
      />
    </>
  );
}
