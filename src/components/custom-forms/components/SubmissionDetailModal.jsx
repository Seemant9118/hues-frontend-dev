'use client';

import React from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export const SubmissionDetailModal = ({ isOpen, onClose, submission }) => {
  if (!submission) return null;

  const values = submission.values || {};
  const entries = Object.entries(values);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-hidden p-0 sm:rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-neutral-800">
                Form Submission #{submission.id}
              </DialogTitle>
              <p className="text-xs text-neutral-500">
                Form Configuration ID: #{submission.formConfigurationId} (Rev v
                {submission.formRevision})
              </p>
            </div>
          </div>
        </div>

        {/* Submission Metadata Bar */}
        <div className="grid grid-cols-2 gap-4 border border-b border-neutral-100 bg-white px-6 py-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-600">
            Submitted On <Calendar size={14} className="text-neutral-400" />
            <span>
              {submission.createdAt
                ? new Date(submission.createdAt).toLocaleString()
                : '-'}
            </span>
          </div>
          <div className="flex items-center justify-end">
            <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
              {submission.status}
            </Badge>
          </div>
        </div>

        {/* Submitted Values Grid */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
            Submitted Form Fields & Values
          </h4>

          {entries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-200 p-8 text-center text-xs text-neutral-400">
              No field responses recorded for this submission.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {entries.map(([key, val]) => (
                <div
                  key={key}
                  className="flex flex-col rounded-lg border border-neutral-100 bg-neutral-50/50 p-3"
                >
                  <span className="text-[11px] font-semibold text-neutral-500">
                    {key}
                  </span>
                  <span className="mt-1 break-words text-sm font-bold text-neutral-800">
                    {typeof val === 'object'
                      ? JSON.stringify(val)
                      : String(val || '-')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-neutral-100 bg-neutral-50/50 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-primary bg-primary px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-transparent hover:text-primary"
          >
            Close Details
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionDetailModal;
