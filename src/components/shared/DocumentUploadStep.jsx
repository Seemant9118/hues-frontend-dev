'use client';

import React, { useState } from 'react';
import {
  Check,
  FileText,
  Loader2,
  Trash2,
  Upload,
  UploadCloud,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { createAttachements } from '@/services/attachment_services/AttachementServices';

export default function DocumentUploadStep({
  formData,
  setFormData,
  stepKey,
  stepData,
}) {
  const [isUploading, setIsUploading] = useState(false);

  const targetStep = stepData || {};
  const stepIdentifier =
    stepKey || targetStep.key || targetStep.id || 'DOCUMENT_UPLOAD';

  // Get current step uploaded attachments from formData
  const currentStepData = formData?.workflowStepValues?.[stepIdentifier] || {};
  const uploadedFiles = currentStepData.attachments || [];

  const updateFormDataDocuments = (newUploadedList) => {
    const attachmentIds = newUploadedList
      .map((f) => f.id)
      .filter((id) => id !== undefined && id !== null);

    const documentIds = newUploadedList
      .map((f) => f.documentId)
      .filter((id) => id !== undefined && id !== null);

    setFormData?.((prev) => {
      const prevDocuments = Array.isArray(prev?.documents)
        ? prev.documents
        : [];

      const existingIndex = prevDocuments.findIndex(
        (d) => d.stepKey === stepIdentifier,
      );

      const stepDocumentObject = {
        stepKey: stepIdentifier,
        attachmentIds,
        documentIds,
      };

      const updatedDocuments = [...prevDocuments];
      if (existingIndex !== -1) {
        updatedDocuments[existingIndex] = stepDocumentObject;
      } else {
        updatedDocuments.push(stepDocumentObject);
      }

      return {
        ...prev,
        documents: updatedDocuments,
        workflowStepValues: {
          ...(prev?.workflowStepValues || {}),
          [stepIdentifier]: {
            ...(prev?.workflowStepValues?.[stepIdentifier] || {}),
            attachments: newUploadedList,
            attachmentIds,
            documentIds,
          },
        },
      };
    });
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);

    try {
      const uploadResults = await Promise.all(
        selectedFiles.map(async (file) => {
          const filePayload = new FormData();
          filePayload.append('contextType', 'DOCUMENT_UPLOAD');
          filePayload.append('files', file);

          const response = await createAttachements(filePayload);
          const responseBody = response?.data || response;
          const dataList = Array.isArray(responseBody?.data)
            ? responseBody.data
            : [responseBody?.data || responseBody];

          const firstItem = dataList[0] || {};
          const { id: attachmentId, documentId } = firstItem;

          return {
            id: attachmentId,
            documentId,
            name: file.name,
            size: file.size,
            type: file.type,
            url: firstItem.url || firstItem.fileUrl || '',
            uploadedAt: new Date().toISOString(),
          };
        }),
      );

      const newUploadedList = [...uploadedFiles, ...uploadResults];
      updateFormDataDocuments(newUploadedList);

      toast.success(`${selectedFiles.length} file(s) uploaded successfully!`);
    } catch (err) {
      toast.error('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveFile = (fileId) => {
    const newUploadedList = uploadedFiles.filter((f) => f.id !== fileId);
    updateFormDataDocuments(newUploadedList);
    toast.info('Attachment removed.');
  };

  return (
    <div className="space-y-6">
      {/* Main Upload Card */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Upload Attachments
          </h4>
          <Badge variant="secondary" className="text-xs font-semibold">
            {uploadedFiles.length} File(s) Attached
          </Badge>
        </div>

        {/* Dropzone Container */}
        <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary bg-primary/30 p-8 text-center transition hover:border-primary hover:bg-primary/60">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />

          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
          </div>

          <p className="text-sm font-bold text-gray-800">
            {isUploading
              ? 'Uploading file(s)...'
              : 'Click or Drag files here to upload'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Supports PDF, PNG, JPG, JPEG, CSV, DOCX (Max 10MB per file)
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            className="pointer-events-none mt-4 border-primary text-primary hover:bg-primary/10"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-3.5 w-3.5" />
                Select File
              </>
            )}
          </Button>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3 pt-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Uploaded Documents List ({uploadedFiles.length})
            </Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id || file.name}
                  className="flex items-center justify-between rounded-lg border bg-gray-50 p-3 text-xs shadow-sm transition hover:bg-white"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p
                        className="truncate font-semibold text-gray-800"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        Attachment ID: {file.id} | Doc ID: {file.documentId}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <div className="flex items-center gap-1 rounded border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                      <Check className="h-3 w-3" />
                      Uploaded
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      title="Remove file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
