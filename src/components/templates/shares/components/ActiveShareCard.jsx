'use client';

import {
  Ban,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import React, { useState } from 'react';

import RevokeShareDialog from '@/components/templates/shares/components/RevokeShareDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ActiveShareCard({
  activeShare,
  onCopy,
  copied,
  onRevoke,
  isRevoking,
  onReset,
}) {
  const [isConfirmRevokeOpen, setIsConfirmRevokeOpen] = useState(false);

  const isRevoked = activeShare?.status === 'REVOKED';
  const isPublic = activeShare?.sharingType === 'PUBLIC';

  const formatExpiry = (isoString) => {
    if (!isoString) return 'Does not expire';
    try {
      return new Date(isoString).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (e) {
      return isoString;
    }
  };

  const handleConfirmRevoke = () => {
    setIsConfirmRevokeOpen(false);
    onRevoke();
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      {/* Header with status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isRevoked
                ? 'bg-neutral-100 text-neutral-500'
                : isPublic
                  ? 'bg-emerald-100/70 text-emerald-600'
                  : 'bg-blue-100/70 text-blue-600'
            }`}
          >
            {isPublic ? (
              <Globe className="h-5 w-5" />
            ) : (
              <ShieldCheck className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-800">
                {isPublic ? 'Public Form Share' : 'Private Form Share'}
              </h3>
              <Badge
                variant={isRevoked ? 'destructive' : 'outline'}
                className={`gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  !isRevoked &&
                  'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isRevoked ? 'bg-red-500' : 'animate-pulse bg-emerald-500'
                  }`}
                />
                {activeShare?.status || 'ACTIVE'}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-neutral-500">
              Share ID: #{activeShare?.shareId || 'N/A'}
            </p>
          </div>
        </div>

        {/* Action: Generate another link */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-1.5"
        >
          <Plus size={13} />
          <span>Create New Share Link</span>
        </Button>
      </div>

      {/* Share URL Row */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-neutral-700">
          Shareable Link URL
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Input
              type="text"
              readOnly
              value={activeShare?.shareUrl || ''}
              className="h-10 w-full rounded-lg border-neutral-200 bg-neutral-50/80 font-mono text-xs text-neutral-700 selection:bg-primary/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={isRevoked || !activeShare?.shareUrl}
              onClick={onCopy}
              className="h-10 gap-1.5 px-4 font-bold"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
            </Button>

            {activeShare?.shareUrl && (
              <Button asChild variant="outline" size="sm" className="h-10 px-3">
                <a
                  href={activeShare.shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Open link in new tab"
                >
                  <ExternalLink size={14} />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Expiry & Meta Details */}
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-neutral-100 bg-neutral-50/50 p-3.5 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <Clock className="h-4 w-4 text-neutral-400" />
          <span>
            <strong>Expiration:</strong> {formatExpiry(activeShare?.expiresAt)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <ShieldCheck className="h-4 w-4 text-neutral-400" />
          <span>
            <strong>Access:</strong>{' '}
            {isPublic
              ? 'Unrestricted (Public)'
              : 'Protected (PAN & OTP Required)'}
          </span>
        </div>
      </div>

      {/* Persistence notice */}
      <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 p-3 text-[11px] text-amber-800">
        <span className="font-bold">Important Security Note:</span> The raw
        token is uniquely generated and hashed by the backend. Ensure you copy
        the link now; subsequent share queries return metadata only without
        revealing the raw URL token.
      </div>

      {/* Danger Zone: Revoke */}
      {!isRevoked && (
        <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
          <div>
            <span className="text-xs font-bold text-red-600">
              Revoke Share Link
            </span>
            <p className="text-[11px] text-neutral-500">
              Immediately invalidate this link so no further responses can be
              submitted.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isRevoking}
            onClick={() => setIsConfirmRevokeOpen(true)}
            className="gap-1.5 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
          >
            <Ban size={13} />
            <span>{isRevoking ? 'Revoking...' : 'Revoke Link'}</span>
          </Button>
        </div>
      )}

      {/* Revoke Confirmation Dialog */}
      <RevokeShareDialog
        isOpen={isConfirmRevokeOpen}
        onOpenChange={setIsConfirmRevokeOpen}
        onConfirm={handleConfirmRevoke}
        isRevoking={isRevoking}
      />
    </div>
  );
}
