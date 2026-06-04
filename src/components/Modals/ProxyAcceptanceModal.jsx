import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, UploadCloud, X, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProxyAcceptanceModal({
  open,
  setOpen,
  orderId,
  orderRefNumber,
  userRole = 'Sender',
  onConfirm,
  isPending = false,
}) {
  const [reason, setReason] = useState('');
  const [consentNote, setConsentNote] = useState('');
  const [includeUploads, setIncludeUploads] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset state
    setReason('');
    setConsentNote('');
    setIncludeUploads(false);
    setSelectedFiles([]);
  };

  const handleProceed = async () => {
    if (!reason) {
      toast.error('Please select a reason for accepting on behalf.');
      return;
    }
    if (!consentNote.trim()) {
      toast.error('Please enter a consent note.');
      return;
    }

    try {
      await onConfirm({
        reason,
        consentNote,
        files: includeUploads ? selectedFiles : [],
      });

      handleClose();
    } catch (error) {
      toast.error(error?.message || 'Failed to proceed with proxy acceptance.');
    }
  };

  const currentTimestamp = new Date().toLocaleString('en-US', { hour12: true });

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-md flex-col overflow-hidden rounded-xl p-0">
        <DialogTitle className="sr-only">
          Accepting on Behalf of Counterparty
        </DialogTitle>

        {/* Header */}
        <div className="flex shrink-0 items-start gap-3 border-b bg-white p-6 pb-4 pr-12">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <User className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold leading-tight text-slate-900">
              Accepting on Behalf of Counterparty
            </h2>
            <p className="text-xs leading-normal text-slate-500">
              This records a delegated action. It does not represent
              counterparty activity on Hues.
            </p>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          {/* Reason Select */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-0.5 text-xs font-semibold text-slate-700">
              Reason for accepting on behalf{' '}
              <span className="text-red-500">*</span>
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="h-11 rounded-xl border-2 border-[#288AF9] bg-white px-3 text-sm font-medium text-slate-800 focus:border-[#288AF9] focus:outline-none focus:ring-0">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Client confirmed via email">
                  Client confirmed via email
                </SelectItem>
                <SelectItem value="Client confirmed via phone call">
                  Client confirmed via phone call
                </SelectItem>
                <SelectItem value="Authorized by contract">
                  Authorized by contract
                </SelectItem>
                <SelectItem value="Internal manager approval">
                  Internal manager approval
                </SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Consent Note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Consent note / supporting details{' '}
              <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={consentNote}
              onChange={(e) => setConsentNote(e.target.value)}
              className="min-h-[90px] rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500"
              placeholder="Describe the confirmation or internal authorization relied upon (example: 'Vendor confirmed quantity and rate over phone on 4 Feb 2026, 3:15 PM')."
            />
          </div>

          {/* Evidence */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-slate-600">
              Evidence (optional)
            </h3>

            {/* Include Uploads */}
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="includeUploads"
                checked={includeUploads}
                onCheckedChange={setIncludeUploads}
                className="mt-0.5"
              />
              <div className="flex w-full flex-col gap-0.5">
                <label
                  htmlFor="includeUploads"
                  className="cursor-pointer select-none text-xs font-semibold text-slate-800"
                >
                  Include my uploads as evidence
                </label>
                <span className="text-[10px] leading-normal text-slate-500">
                  When enabled, Hues will attach the files you upload or select
                  here to Order Details → Attachments.
                </span>

                {/* Upload Zone (If checkbox checked) */}
                {includeUploads && (
                  <div className="mt-2.5 flex flex-col gap-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#288AF9] bg-slate-50/50 p-3 transition-colors duration-200 hover:bg-blue-50/20"
                    >
                      <UploadCloud className="mb-0.5 h-6 w-6 text-blue-500" />
                      <span className="text-[10px] font-semibold text-slate-700">
                        Click to upload files
                      </span>
                      <span className="text-[9px] text-slate-400">
                        PDF, PNG, JPG, JPEG
                      </span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />

                    {/* File List */}
                    {selectedFiles.length > 0 && (
                      <div className="flex max-h-[120px] flex-col gap-1.5 overflow-y-auto">
                        {selectedFiles.map((file, i) => (
                          <div
                            key={`${file.name}-${file.size}`}
                            className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2 text-[10px]"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <FileText className="h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                              <span className="truncate font-medium text-slate-700">
                                {file.name}
                              </span>
                              <span className="text-[8px] text-slate-400">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedFiles((prev) =>
                                  prev.filter((_, idx) => idx !== i),
                                )
                              }
                              className="p-0.5 text-slate-400 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Banner */}
          <div className="flex flex-col gap-1 rounded-lg bg-slate-50 p-3 text-[10px] font-medium text-slate-500">
            <div>
              <span className="font-semibold text-slate-700">Order ID:</span>{' '}
              {orderRefNumber || orderId}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Your Role:</span>{' '}
              {userRole}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Timestamp:</span>{' '}
              {currentTimestamp}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t bg-white p-6 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            disabled={isPending || !reason || !consentNote.trim()}
            size="sm"
          >
            {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
            Proceed with Proxy Acceptance
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
