'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { usePermission } from '@/hooks/usePermissions';
import {
  createResourceShare,
  revokeResourceShare,
} from '@/services/Resource_Share_Services/ResourceShareServices';

const PAN_REGEX = /^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/;

export function useFormShare(customForm, onSuccessCallback) {
  const { hasPermission } = usePermission();
  const canShareForNowWithPermissions = true;
  const canManageShares =
    hasPermission('permission:resource-share-manage') ||
    canShareForNowWithPermissions;

  const [sharingType, setSharingType] = useState('PUBLIC');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryTime, setExpiryTime] = useState('23:59');

  const [recipient, setRecipient] = useState({
    panNumber: '',
    mobileNumber: '',
    countryCode: '91',
  });

  const [errors, setErrors] = useState({});
  const [activeShare, setActiveShare] = useState(null);
  const [copied, setCopied] = useState(false);

  // Expiry calculation
  const getExpiresAtISO = () => {
    if (!hasExpiry || !expiryDate) return undefined;
    const combined = new Date(`${expiryDate}T${expiryTime || '23:59'}:00`);
    return Number.isNaN(combined.getTime())
      ? undefined
      : combined.toISOString();
  };

  // Change recipient field
  const handleRecipientChange = (field, value) => {
    setRecipient((prev) => {
      let val = value;
      if (field === 'panNumber') {
        val = value.toUpperCase().slice(0, 10);
      } else if (field === 'mobileNumber') {
        val = value.replace(/\D/g, '').slice(0, 15);
      }
      return { ...prev, [field]: val };
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Validation
  const validate = () => {
    const errs = {};

    if (hasExpiry && !expiryDate) {
      errs.expiryDate = 'Please specify an expiry date.';
    }

    if (sharingType === 'PRIVATE') {
      if (!recipient.panNumber) {
        errs.panNumber = 'Recipient PAN number is required.';
      } else if (!PAN_REGEX.test(recipient.panNumber)) {
        errs.panNumber = 'Invalid PAN format (e.g. ABCDE1234F).';
      }

      if (!recipient.mobileNumber) {
        errs.mobileNumber = 'Recipient mobile number is required.';
      } else if (recipient.mobileNumber.length < 10) {
        errs.mobileNumber = 'Mobile number must be at least 10 digits.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Create share mutation
  const createShareMutation = useMutation({
    mutationFn: async () => {
      const targetId = customForm?.id || customForm?.formId;
      if (!targetId) {
        throw new Error('Custom form ID is missing.');
      }

      const expiresAt = getExpiresAtISO();

      const payload = {
        resourceType: 'CUSTOM_FORM',
        resourceId: String(targetId),
        sharingType,
        ...(expiresAt ? { expiresAt } : {}),
        ...(sharingType === 'PRIVATE'
          ? {
              recipient: {
                panNumber: recipient.panNumber.toUpperCase(),
                mobileNumber: recipient.mobileNumber.replace(/\D/g, ''),
                countryCode: recipient.countryCode || '91',
              },
            }
          : {}),
      };

      const res = await createResourceShare(payload);
      if (res?.status === false) {
        throw new Error(res?.message || 'Failed to create share link.');
      }
      return res?.data || res;
    },
    onSuccess: (data) => {
      setActiveShare(data);
      toast.success(
        `${sharingType === 'PUBLIC' ? 'Public' : 'Private'} share link created successfully!`,
      );
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (err) => {
      toast.error(err.message || 'Error creating share link.');
    },
  });

  // Revoke share mutation
  const revokeShareMutation = useMutation({
    mutationFn: async (shareId) => {
      const res = await revokeResourceShare(shareId);
      if (res?.status === false) {
        throw new Error(res?.message || 'Failed to revoke share link.');
      }
      return res?.data || res;
    },
    onSuccess: (data) => {
      setActiveShare((prev) =>
        prev
          ? { ...prev, status: 'REVOKED', revokedAt: data?.revokedAt }
          : null,
      );
      toast.info('Share link has been revoked and is now unavailable.');
    },
    onError: (err) => {
      toast.error(err.message || 'Error revoking share link.');
    },
  });

  // Submit action
  const handleCreateShare = () => {
    if (!validate()) return;
    createShareMutation.mutate();
  };

  // Revoke action
  const handleRevokeShare = () => {
    if (!activeShare?.shareId) return;
    revokeShareMutation.mutate(activeShare.shareId);
  };

  // Copy link action
  const handleCopyLink = () => {
    if (!activeShare?.shareUrl) return;
    navigator.clipboard.writeText(activeShare.shareUrl);
    setCopied(true);
    toast.success('Share link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Reset to create another share
  const handleResetShare = () => {
    setActiveShare(null);
    setErrors({});
  };

  return {
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
    isCreating: createShareMutation.isPending,
    isRevoking: revokeShareMutation.isPending,
    handleCreateShare,
    handleRevokeShare,
    handleCopyLink,
    handleResetShare,
  };
}
