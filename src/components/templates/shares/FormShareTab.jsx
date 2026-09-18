'use client';

import { ArrowRight, ShieldAlert } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import ActiveShareCard from './components/ActiveShareCard';
import ShareModeSelector from './components/ShareModeSelector';
import SharePrivateConfig from './components/SharePrivateConfig';
import SharePublicConfig from './components/SharePublicConfig';
import { useFormShare } from './hooks/useFormShare';

export default function FormShareTab({ customForm }) {
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
  } = useFormShare(customForm);

  // Permission Guard
  if (!canManageShares) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
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
          ) to generate or revoke share links for this form.
        </p>
      </div>
    );
  }

  // Active Share View
  if (activeShare) {
    return (
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
    );
  }

  // Form Sharing Configuration View
  return (
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

      {/* Submit Action Bar */}
      <div className="flex items-center justify-end rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
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
                Generate {sharingType === 'PUBLIC' ? 'Public' : 'Private'} Share
                Link
              </span>
              <ArrowRight size={14} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
