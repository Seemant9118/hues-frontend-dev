'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Copy, Sparkles, FileJson } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkflowJsonViewModal({
  isOpen,
  onClose,
  workflowJson,
  title = 'Workflow Architecture (JSON View)',
}) {
  const [copied, setCopied] = useState(false);

  const jsonString = React.useMemo(() => {
    if (!workflowJson) return '{}';
    try {
      return JSON.stringify(workflowJson, null, 2);
    } catch (e) {
      return String(workflowJson);
    }
  }, [workflowJson]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast.success('Workflow JSON copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy JSON');
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[85vh] max-h-[85vh] w-full max-w-3xl flex-col gap-0 overflow-hidden rounded-xl border bg-white p-6 shadow-2xl sm:max-w-3xl">
        {/* Header */}
        <DialogHeader className="shrink-0 border-b pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
                <FileJson className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="overflow-hidden">
                <DialogTitle className="flex items-center gap-2 truncate text-base font-bold text-gray-900 sm:text-lg">
                  {title}
                </DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Module:</span>
                  <strong className="font-mono text-gray-800">
                    {workflowJson?.graph?.module ||
                      workflowJson?.module ||
                      'ORDER'}
                  </strong>
                  {workflowJson?.version && (
                    <>
                      <span>| Version:</span>
                      <strong className="font-mono text-gray-800">
                        v{workflowJson.version}
                      </strong>
                    </>
                  )}
                  <span>| Status:</span>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] uppercase"
                  >
                    {workflowJson?.status || 'DRAFT'}
                  </Badge>
                </DialogDescription>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="gap-1.5 text-xs font-semibold text-slate-700"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  Copy JSON
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Banner for Architecture View */}
        <div className="mt-3 flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-2 text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-indigo-600" />
            <span>
              <strong>JSON View Mode:</strong> Displaying complete workflow
              topology architecture.
            </span>
          </div>
          <Badge className="bg-indigo-600 text-[10px] text-white">
            JSON View Architecture
          </Badge>
        </div>

        {/* Scrollable JSON Code Container */}
        <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-800 bg-slate-950 p-4 shadow-inner">
          <pre className="scrollBarStyles h-full w-full overflow-auto font-mono text-xs leading-relaxed text-emerald-400">
            <code>{jsonString}</code>
          </pre>
        </div>

        {/* Footer Action */}
        <div className="mt-3 flex shrink-0 items-center justify-end border-t pt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="text-xs"
          >
            Close JSON View
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
