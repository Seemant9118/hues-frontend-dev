'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CheckCircle2, FileText, UploadCloud } from 'lucide-react';
import React from 'react';

export default function CustomWorkflowFinalPreview({
  definition,
  formData = {},
}) {
  const steps = definition?.graph?.steps || definition?.steps || [];
  const allStepValues = formData?.workflowStepValues || {};

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <div>
            <h4 className="text-sm font-bold text-emerald-950">
              Review and Confirm Submission
            </h4>
            <p className="text-xs text-emerald-800">
              Please verify the workflow submission values below before saving.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {steps
          .filter(
            (st) =>
              !st.type ||
              st.type === 'FORM' ||
              st.type === 'APPROVAL' ||
              st.type === 'DOCUMENT_UPLOAD',
          )
          .map((st) => {
            const values = allStepValues[st.key] || {};
            const isDocUpload = st.type === 'DOCUMENT_UPLOAD';
            const attachments = values.attachments || [];
            const hasValues = Object.keys(values).length > 0;

            if (isDocUpload) {
              return (
                <Card key={st.key} className="border bg-white p-4">
                  <div className="mb-3 flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <UploadCloud className="h-4 w-4 text-primary" />
                      <h5 className="text-xs font-bold text-gray-900">
                        {st.label || st.key}
                      </h5>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs font-semibold"
                    >
                      {attachments.length} Attachment(s)
                    </Badge>
                  </div>

                  {attachments.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {attachments.map((att, idx) => (
                        <div
                          key={att.id || att.name || idx}
                          className="flex items-center gap-2.5 rounded-lg border bg-gray-50 p-2.5 text-xs shadow-sm"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          <div className="overflow-hidden">
                            <p
                              className="truncate font-semibold text-gray-800"
                              title={att.name}
                            >
                              {att.name || `Document #${att.id || idx + 1}`}
                            </p>
                            <p className="font-mono text-[10px] text-muted-foreground">
                              {att.id ? `Attachment ID: ${att.id}` : ''}
                              {att.documentId
                                ? ` | Doc ID: ${att.documentId}`
                                : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No documents attached for this step.
                    </p>
                  )}
                </Card>
              );
            }

            return (
              <Card key={st.key} className="border bg-white p-4">
                <div className="mb-3 flex items-center gap-2 border-b pb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h5 className="text-xs font-bold text-gray-900">
                    {st.label || st.key}
                  </h5>
                </div>

                {hasValues ? (
                  <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                    {Object.entries(values).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex flex-col rounded bg-gray-50 p-2"
                      >
                        <span className="text-[11px] font-medium capitalize text-gray-500">
                          {k.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="mt-0.5 break-words font-semibold text-gray-900">
                          {typeof v === 'object'
                            ? JSON.stringify(v)
                            : String(v ?? '-')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No custom fields filled for this step.
                  </p>
                )}
              </Card>
            );
          })}
      </div>
    </div>
  );
}
