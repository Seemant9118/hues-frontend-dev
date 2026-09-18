'use client';

import { ArrowRight, FileText, ShieldAlert } from 'lucide-react';
import React from 'react';

import ActiveShareCard from '@/components/templates/shares/components/ActiveShareCard';
import ShareModeSelector from '@/components/templates/shares/components/ShareModeSelector';
import SharePrivateConfig from '@/components/templates/shares/components/SharePrivateConfig';
import SharePublicConfig from '@/components/templates/shares/components/SharePublicConfig';
import { useAgreementShare } from '@/components/templates/shares/hooks/useAgreementShare';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AgreementShareModal({ isOpen, onClose, agreement }) {
  const {
    sharingType,
    setSharingType,
    hasExpiry,
    setHasExpiry,
    expiryDate,
    setExpiryDate,
    expiryTime,
    setExpiryTime,
    recipient,
    handleRecipientChange,
    errors,
    activeShare,
    copied,
    canManageShares,
    isCreating,
    isRevoking,
    handleCreateShare,
    handleRevokeShare,
    handleCopyLink,
    handleResetShare,
  } = useAgreementShare(agreement);

  const agreementTitle = agreement?.name || 'Agreement';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-[650px] overflow-y-auto p-6">
        <DialogHeader className="border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileText size={18} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-neutral-800">
                Share Agreement
              </DialogTitle>
              <p className="text-xs text-neutral-500">
                Generate a public or restricted link for{' '}
                <span className="font-semibold text-neutral-700">
                  {agreementTitle}
                </span>
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Permission Guard */}
        {!canManageShares ? (
          <div className="my-4 flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-neutral-800">
              Sharing Permission Required
            </h3>
            <p className="mt-1 max-w-sm text-xs text-neutral-500">
              You do not have permission (
              <code className="font-mono text-[11px] font-semibold text-neutral-700">
                permission:resource-share-manage
              </code>
              ) to generate or revoke share links for this agreement.
            </p>
          </div>
        ) : activeShare ? (
          /* Active Share View */
          <div className="my-2 space-y-4">
            <ActiveShareCard
              activeShare={activeShare}
              onCopy={handleCopyLink}
              copied={copied}
              onRevoke={handleRevokeShare}
              isRevoking={isRevoking}
              onReset={handleResetShare}
            />
          </div>
        ) : (
          /* Share Configuration View */
          <div className="my-2 space-y-4">
            {/* Mode Selector */}
            <ShareModeSelector
              sharingType={sharingType}
              onChange={setSharingType}
              disabled={isCreating}
            />

            {/* Sharing Details Component */}
            {sharingType === 'PUBLIC' ? (
              <SharePublicConfig
                hasExpiry={hasExpiry}
                setHasExpiry={setHasExpiry}
                expiryDate={expiryDate}
                setExpiryDate={setExpiryDate}
                expiryTime={expiryTime}
                setExpiryTime={setExpiryTime}
                errors={errors}
                disabled={isCreating}
              />
            ) : (
              <SharePrivateConfig
                recipient={recipient}
                onRecipientChange={handleRecipientChange}
                hasExpiry={hasExpiry}
                setHasExpiry={setHasExpiry}
                expiryDate={expiryDate}
                setExpiryDate={setExpiryDate}
                expiryTime={expiryTime}
                setExpiryTime={setExpiryTime}
                errors={errors}
                disabled={isCreating}
              />
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isCreating}
                onClick={handleCreateShare}
                size="sm"
              >
                {isCreating ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Generating Link...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Generate {sharingType === 'PUBLIC' ? 'Public' : 'Private'}{' '}
                      Share Link
                    </span>
                    <ArrowRight size={14} className="ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
