'use client';

import { previewMediaInNewTab } from '@/appUtils/mediaPreview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Loading from '@/components/ui/Loading';
import {
  useWorkflowInstanceData,
  useWorkflowInstanceDetail,
} from '@/hooks/workflows/useWorkflowRuntime';
import {
  ExternalLink,
  FileText,
  ImageIcon,
  Network,
  Paperclip,
} from 'lucide-react';
import React from 'react';

export default function WorkflowInstanceDetailModal({
  isOpen,
  onClose,
  instance,
}) {
  const instanceId = instance?.instanceId || instance?.id;

  const { data: detailData, isLoading: isLoadingDetail } =
    useWorkflowInstanceDetail(instanceId, {
      enabled: isOpen && Boolean(instanceId),
    });

  const { data: instanceFormData, isLoading: isLoadingFormData } =
    useWorkflowInstanceData(instanceId, {
      enabled: isOpen && Boolean(instanceId),
    });

  const isLoading = isLoadingDetail || isLoadingFormData;

  const currentInstance = detailData?.instance || instance;
  const forms = instanceFormData?.forms || [];
  const workflowData = instanceFormData?.workflowData || {};
  const attachments =
    workflowData?.attachments ||
    instanceFormData?.attachments ||
    detailData?.attachments ||
    [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              <div>
                <DialogTitle className="text-base font-bold">
                  Instance Details
                </DialogTitle>
                <p className="font-mono text-xs text-muted-foreground">
                  Instance #{instanceId}
                </p>
              </div>
            </div>
            {currentInstance?.status && (
              <Badge
                variant="outline"
                className={`text-xs font-semibold ${
                  currentInstance.status === 'COMPLETED'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : currentInstance.status === 'FAILED'
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-blue-200 bg-blue-50 text-blue-700'
                }`}
              >
                {currentInstance.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-16 text-center">
            <Loading />
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {/* Submitted Forms and Responses */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Submitted Form Responses
              </h4>

              {forms.length === 0 && Object.keys(workflowData).length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                  No form responses recorded for this instance.
                </div>
              ) : (
                <div className="space-y-3">
                  {forms.map((fm) => (
                    <Card
                      key={fm.stepKey || fm.formConfigurationId}
                      className="border p-4"
                    >
                      <div className="mb-3 flex items-center gap-2 border-b pb-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <h5 className="text-xs font-bold text-gray-900">
                          {fm.label || fm.stepKey}
                        </h5>
                        {fm.submitted && (
                          <Badge
                            variant="outline"
                            className="ml-auto bg-emerald-50 text-[10px] text-emerald-700"
                          >
                            Submitted
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                        {fm.values && Object.keys(fm.values).length > 0 ? (
                          Object.entries(fm.values).map(([k, v]) => (
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
                          ))
                        ) : (
                          <p className="col-span-2 text-xs text-muted-foreground">
                            No values submitted for this form.
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Workflow Attachments Section */}
            {attachments.length > 0 && (
              <div className="space-y-3">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>Attachments ({attachments.length})</span>
                </h4>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {attachments.map((att, idx) => {
                    const attUrl = att.url || att.documentSlug;
                    const fileName =
                      att.name || att.fileName || `Attachment-${idx + 1}`;
                    const isImg =
                      att.type?.startsWith('image/') ||
                      /\.(webp|png|jpe?g|gif|svg)$/i.test(attUrl || '');

                    return (
                      <Card
                        key={att.id || att.attachmentId || idx}
                        className="flex items-center justify-between gap-3 border bg-white p-3 shadow-none transition hover:border-gray-300"
                      >
                        <div
                          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5"
                          onClick={() => previewMediaInNewTab(att)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              previewMediaInNewTab(att);
                            }
                          }}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                            {isImg ? (
                              <ImageIcon className="h-4.5 w-4.5 text-primary" />
                            ) : (
                              <FileText className="h-4.5 w-4.5 text-rose-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate text-xs font-semibold text-gray-800 hover:text-primary hover:underline"
                              title={fileName}
                            >
                              {fileName}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              {att.size && (
                                <span>{(att.size / 1024).toFixed(1)} KB</span>
                              )}
                              {att.type && (
                                <span className="uppercase">
                                  {att.type.split('/')[1] || att.type}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => previewMediaInNewTab(att)}
                            title="Preview in new tab (without auto-download)"
                            className="h-7 gap-1.5 px-2.5 text-xs font-medium hover:border-primary hover:text-primary"
                          >
                            <ExternalLink size={12} />
                            <span>Preview in New Tab</span>
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
