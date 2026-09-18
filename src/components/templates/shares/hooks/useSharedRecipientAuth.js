'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  requestSharedPrivateOtp,
  validateSharedPrivateIdentity,
  verifySharedPrivateOtp,
} from '@/services/Resource_Share_Services/ResourceShareServices';

const PAN_REGEX = /^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/;

export function useSharedRecipientAuth({ token, onAuthSuccess, onRequireOtp }) {
  const [identity, setIdentity] = useState({
    panNumber: '',
    mobileNumber: '',
    countryCode: '91',
  });
  const [challengeToken, setChallengeToken] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpResendCountdown, setOtpResendCountdown] = useState(0);
  const [shareSessionToken, setShareSessionToken] = useState(null);

  const [isVerifyingIdentity, setIsVerifyingIdentity] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  // Resend Countdown Timer
  useEffect(() => {
    if (otpResendCountdown <= 0) return () => {};
    const interval = setInterval(() => {
      setOtpResendCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpResendCountdown]);

  // Request Private OTP
  const handleRequestOtp = async (cToken = challengeToken) => {
    if (!cToken) return;
    setIsRequestingOtp(true);
    try {
      const res = await requestSharedPrivateOtp(token, cToken);
      if (res?.status === false) {
        toast.error(res?.message || 'Failed to send OTP.');
        return;
      }

      const resendSec = res.data?.resendAfter || 60;
      setOtpResendCountdown(resendSec);
      toast.success('Verification OTP sent successfully.');
    } catch (err) {
      toast.error('Error requesting OTP.');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  // Private Identity Verification Submit
  const handleVerifyIdentity = async (e) => {
    if (e) e.preventDefault();

    if (!PAN_REGEX.test(identity.panNumber)) {
      toast.error('Please enter a valid 10-character PAN (e.g. ABCDE1234F).');
      return;
    }
    if (!identity.mobileNumber || identity.mobileNumber.length < 10) {
      toast.error('Please enter a valid mobile number (at least 10 digits).');
      return;
    }

    setIsVerifyingIdentity(true);
    try {
      const payload = {
        panNumber: identity.panNumber.toUpperCase(),
        mobileNumber: identity.mobileNumber.replace(/\D/g, ''),
        countryCode: identity.countryCode || '91',
      };

      const res = await validateSharedPrivateIdentity(token, payload);
      if (res?.status === false) {
        toast.error(res?.message || 'Details do not match this private link.');
        return;
      }

      const cToken = res.data?.challengeToken;
      setChallengeToken(cToken);

      // Trigger OTP request
      await handleRequestOtp(cToken);
      onRequireOtp?.();
    } catch (err) {
      toast.error('Identity verification failed.');
    } finally {
      setIsVerifyingIdentity(false);
    }
  };

  // Verify Private OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      toast.error('Please enter the valid OTP code.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await verifySharedPrivateOtp(token, {
        challengeToken,
        otpCode: Number(otpCode),
      });

      if (res?.status === false) {
        toast.error(res?.message || 'Invalid or expired OTP.');
        return;
      }

      const sToken = res.data?.shareSessionToken;
      setShareSessionToken(sToken);
      toast.success('Identity verified successfully!');

      if (onAuthSuccess) {
        await onAuthSuccess(sToken);
      }
    } catch (err) {
      toast.error('OTP verification failed.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return {
    identity,
    setIdentity,
    challengeToken,
    setChallengeToken,
    otpCode,
    setOtpCode,
    otpResendCountdown,
    shareSessionToken,
    isVerifyingIdentity,
    isVerifyingOtp,
    isRequestingOtp,
    handleRequestOtp,
    handleVerifyIdentity,
    handleVerifyOtp,
  };
}
