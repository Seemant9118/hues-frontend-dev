'use client';

import {
  FileSignature,
  Loader2,
  PenTool,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import SignatureDrawPad from '@/components/templates/shares/components/SignatureDrawPad';
import SignatureImageUploader from '@/components/templates/shares/components/SignatureImageUploader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SharedAgreementSignDialog({
  isOpen,
  onClose,
  agreementTitle = 'Agreement',
  enterpriseName = 'Company',
  onSignSubmit,
  isSubmitting = false,
}) {
  const [activeTab, setActiveTab] = useState('draw'); // 'draw' | 'upload'
  const [signatureBase64, setSignatureBase64] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [signerName, setSignerName] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  // Reset states when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSignatureBase64(null);
      setUploadError(null);
      setUploadedFileName('');
      setSignerName('');
      setConsentChecked(false);
      setActiveTab('draw');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!signatureBase64) {
      toast.error('Please provide a signature before submitting.');
      return;
    }
    if (!consentChecked) {
      toast.error('You must agree to the consent terms to sign legally.');
      return;
    }

    onSignSubmit({
      signatureData: signatureBase64,
      signatureType: activeTab === 'draw' ? 'DRAWN' : 'IMAGE_UPLOAD',
      signedAt: new Date().toISOString(),
      signerName: signerName.trim() || 'Signer',
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <DialogContent className="max-h-[92vh] max-w-[540px] overflow-y-auto p-6">
        <DialogHeader className="border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-neutral-800">
                Sign Agreement
              </DialogTitle>
              <p className="text-xs text-neutral-500">
                {agreementTitle} • Offered by {enterpriseName}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Method tabs */}
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-neutral-100 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('draw');
                setUploadError(null);
                setSignatureBase64(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-md py-1.5 text-xs font-semibold transition ${
                activeTab === 'draw'
                  ? 'bg-white text-neutral-800 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <PenTool size={14} />
              Draw Signature
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('upload');
                setUploadError(null);
                setSignatureBase64(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-md py-1.5 text-xs font-semibold transition ${
                activeTab === 'upload'
                  ? 'bg-white text-neutral-800 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <Upload size={14} />
              Upload Image
            </button>
          </div>

          {/* Draw Tab */}
          <SignatureDrawPad
            isOpen={isOpen}
            isActive={activeTab === 'draw'}
            onSignatureChange={setSignatureBase64}
            onError={setUploadError}
          />

          {/* Upload Tab */}
          <SignatureImageUploader
            isActive={activeTab === 'upload'}
            signatureBase64={signatureBase64}
            uploadedFileName={uploadedFileName}
            onSignatureChange={(base64, name) => {
              setSignatureBase64(base64);
              if (name) setUploadedFileName(name);
            }}
            onError={setUploadError}
          />

          {/* Error display */}
          {uploadError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
              {uploadError}
            </div>
          )}

          {/* Signer Legal Name */}
          <div>
            <Label
              htmlFor="signerFullName"
              className="text-xs font-semibold text-neutral-700"
            >
              Signer Full Name
            </Label>
            <Input
              id="signerFullName"
              type="text"
              placeholder="e.g. Amit Sharma"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              maxLength={120}
              className="mt-1 h-9 text-xs"
            />
          </div>

          {/* Consent Checkbox */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5">
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="consentCheck"
                checked={consentChecked}
                onCheckedChange={setConsentChecked}
                className="mt-0.5"
              />
              <Label
                htmlFor="consentCheck"
                className="cursor-pointer text-xs leading-relaxed text-neutral-600"
              >
                I agree to electronically sign this agreement and understand
                that this electronic signature is as legally binding as a
                handwritten signature under applicable law.
              </Label>
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!signatureBase64 || !consentChecked || isSubmitting}
              className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitting Signature...</span>
                </>
              ) : (
                <>
                  <FileSignature size={14} />
                  <span>Sign & Submit Agreement</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
