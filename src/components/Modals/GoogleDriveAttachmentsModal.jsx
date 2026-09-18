import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, HardDriveUpload, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { previewMediaInNewTab } from '@/appUtils/mediaPreview';
import InvoiceMediaViewModal from '@/components/Modals/InvoicePDFViewModal';

export default function GoogleDriveAttachmentsModal({
  isOpen,
  onClose,
  attachments = [],
  onSave,
  isSaving = false,
}) {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);

  // Generate a unique key for each attachment for selection state
  const validAttachments =
    attachments?.map((att, idx) => ({
      ...att,
      _uniqueKey: att.isModuleDocument
        ? `${att.documentType}-${att.id}`
        : att.documentUrl || `doc-${idx}`,
    })) || [];

  // Reset selection when modal opens (default all selected)
  useEffect(() => {
    if (isOpen) {
      setSelectedKeys(validAttachments.map((att) => att._uniqueKey));
      setIsSuccess(false);
    }
  }, [isOpen, validAttachments.length]);

  const toggleSelection = (key) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleSave = async () => {
    if (selectedKeys.length === 0) {
      toast.error('Please select at least one attachment to save.');
      return;
    }
    const selectedAttachments = validAttachments.filter((att) =>
      selectedKeys.includes(att._uniqueKey),
    );
    try {
      await onSave(selectedAttachments);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      // Error is handled by useGoogleDrive hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-xl">
        <DialogHeader>
          <DialogTitle>Save to Google Drive</DialogTitle>
        </DialogHeader>

        <div className="overflow-hidden py-4">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-800">
                Upload Successful
              </p>
              <p className="text-sm text-gray-500">
                Your documents have been saved to Google Drive.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-500">
                Select the attachments you want to save to your Google Drive
                account.
              </p>

              <div className="flex max-h-[60vh] w-full flex-col gap-3 overflow-y-auto pr-2">
                {validAttachments.length === 0 ? (
                  <div className="py-4 text-center text-sm italic text-gray-400">
                    No attachments found.
                  </div>
                ) : (
                  validAttachments.map((att, idx) => {
                    const docName =
                      att.documentName ||
                      att.attachmentFileName ||
                      `Document ${idx + 1}`;
                    const isSelected = selectedKeys.includes(att._uniqueKey);

                    const isPdf =
                      att.documentUrl?.toLowerCase().endsWith('.pdf') ||
                      att.attachmentFileName?.toLowerCase().endsWith('.pdf');

                    const EyeButton = (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-gray-500 hover:text-blue-600"
                        title="Preview Attachment"
                        onClick={
                          isPdf
                            ? () =>
                                previewMediaInNewTab(
                                  att.documentUrl,
                                  att.attachmentFileName,
                                  'application/pdf',
                                )
                            : undefined
                        }
                      >
                        <Eye size={16} />
                      </Button>
                    );

                    return (
                      <div
                        key={att._uniqueKey}
                        className="flex w-full min-w-0 items-center justify-between rounded-md border p-3 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              toggleSelection(att._uniqueKey)
                            }
                            className="shrink-0"
                          />
                          <div className="flex min-w-0 flex-1 items-center gap-2 truncate">
                            <FileText
                              className="shrink-0 text-blue-500"
                              size={18}
                            />
                            <span
                              className="truncate text-sm font-medium"
                              title={docName}
                            >
                              {docName}
                            </span>
                          </div>
                        </div>

                        {att.documentUrl && (
                          <div className="ml-2 shrink-0">
                            {isPdf ? (
                              EyeButton
                            ) : (
                              <InvoiceMediaViewModal
                                Url={att.documentUrl}
                                cta={EyeButton}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {!isSuccess && (
            <>
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || selectedKeys.length === 0}
                className="flex items-center gap-2"
              >
                <HardDriveUpload size={16} />
                {isSaving ? 'Saving...' : 'Save to Drive'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
