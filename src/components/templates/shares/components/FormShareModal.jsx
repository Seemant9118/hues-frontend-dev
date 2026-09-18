'use client';

import { ArrowRight, ShieldAlert } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ActiveShareCard from './ActiveShareCard';
import ShareModeSelector from './ShareModeSelector';
import SharePrivateConfig from './SharePrivateConfig';
import SharePublicConfig from './SharePublicConfig';
import { useFormShare } from '../hooks/useFormShare';

export default function FormShareModal({
  customForm,
  isOpen,
  onClose,
  onSuccess,
}) {
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
  } = useFormShare(customForm, onSuccess);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isCreating && onClose()}
    >
      <DialogContent className="flex max-h-[90vh] max-w-[700px] flex-col p-6">
        <DialogHeader className="mb-2 shrink-0">
          <DialogTitle className="text-xl font-semibold">
            Create Share Link
          </DialogTitle>
        </DialogHeader>

        {/* Permission Guard */}
        {!canManageShares ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-neutral-800">
              Sharing Permission Required
            </h3>
            <p className="mt-1 max-w-sm text-xs text-neutral-500">
              You do not have permission to generate share links for this form.
            </p>
          </div>
        ) : activeShare ? (
          /* Active Share View */
          <div className="space-y-4">
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
          /* Form Sharing Configuration View */
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="scrollBarStyles flex-1 overflow-y-auto">
              <div className="space-y-4">
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
              </div>
            </div>

            {/* Submit Action Bar */}
            <div className="mt-4 flex shrink-0 items-center justify-end gap-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onClose}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isCreating}
                onClick={handleCreateShare}
              >
                {isCreating ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Generate {sharingType === 'PUBLIC' ? 'Public' : 'Private'}{' '}
                      Link
                    </span>
                    <ArrowRight size={14} />
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
