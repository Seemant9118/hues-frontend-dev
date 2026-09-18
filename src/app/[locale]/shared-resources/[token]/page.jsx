'use client';

import { useParams } from 'next/navigation';
import React from 'react';

import SharedAgreementView from '@/components/templates/shares/components/SharedAgreementView';
import SharedFormSuccess from '@/components/templates/shares/components/SharedFormSuccess';
import SharedFormView from '@/components/templates/shares/components/SharedFormView';
import SharedResourceIdentityGate from '@/components/templates/shares/components/SharedResourceIdentityGate';
import SharedResourceOtpGate from '@/components/templates/shares/components/SharedResourceOtpGate';
import SharedResourceUnavailable from '@/components/templates/shares/components/SharedResourceUnavailable';
import {
  RECIPIENT_STEPS,
  useSharedFormRecipient,
} from '@/components/templates/shares/hooks/useSharedFormRecipient';
import Loading from '@/components/ui/Loading';

export default function SharedResourceRecipientPage() {
  const params = useParams();
  const token = params?.token;

  const {
    currentStep,
    unavailableMessage,
    formDefinition,
    agreementData,
    signedResult,
    isSigningAgreement,
    formValues,
    fieldErrors,
    submissionResult,
    identity,
    setIdentity,
    otpCode,
    setOtpCode,
    otpResendCountdown,
    isSubmitting,
    isVerifyingIdentity,
    isVerifyingOtp,
    isRequestingOtp,
    handleVerifyIdentity,
    handleRequestOtp,
    handleVerifyOtp,
    handleFieldValueChange,
    handleSubmitForm,
    handleSignAgreement,
  } = useSharedFormRecipient(token);

  // 1. Loading Step
  if (currentStep === RECIPIENT_STEPS.LOADING) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
        <Loading />
        <p className="mt-4 text-xs font-semibold text-neutral-500">
          Verifying shared link...
        </p>
      </div>
    );
  }

  // 2. Unavailable / Expired / Revoked Step
  if (currentStep === RECIPIENT_STEPS.UNAVAILABLE) {
    return (
      <div className="min-h-screen bg-neutral-50 py-10">
        <SharedResourceUnavailable message={unavailableMessage} />
      </div>
    );
  }

  // 3. Identity Verification Gate (Private Shares)
  if (currentStep === RECIPIENT_STEPS.IDENTITY_VERIFICATION) {
    return (
      <div className="min-h-screen bg-neutral-50 py-10">
        <SharedResourceIdentityGate
          identity={identity}
          setIdentity={setIdentity}
          onSubmit={handleVerifyIdentity}
          isLoading={isVerifyingIdentity}
        />
      </div>
    );
  }

  // 4. OTP Verification Gate (Private Shares)
  if (currentStep === RECIPIENT_STEPS.OTP_VERIFICATION) {
    return (
      <div className="min-h-screen bg-neutral-50 py-10">
        <SharedResourceOtpGate
          otpCode={otpCode}
          setOtpCode={setOtpCode}
          onSubmit={handleVerifyOtp}
          isLoading={isVerifyingOtp}
          onResendOtp={() => handleRequestOtp()}
          resendCountdown={otpResendCountdown}
          isRequestingOtp={isRequestingOtp}
          mobileNumber={identity.mobileNumber}
        />
      </div>
    );
  }

  // 5. Form Submission Success Screen
  if (currentStep === RECIPIENT_STEPS.SUBMITTED) {
    return (
      <div className="min-h-screen bg-neutral-50 py-10">
        <SharedFormSuccess submissionResult={submissionResult} />
      </div>
    );
  }

  // 6 & 7. Agreement View (Review, Sign, or View Captured Signature Info)
  if (
    currentStep === RECIPIENT_STEPS.AGREEMENT_VIEW ||
    currentStep === RECIPIENT_STEPS.SIGNED
  ) {
    return (
      <SharedAgreementView
        agreementData={agreementData}
        signedResult={signedResult}
        onSignAgreement={handleSignAgreement}
        isSigning={isSigningAgreement}
      />
    );
  }

  // 8. Custom Form View (Fill & Submit Form)
  return (
    <SharedFormView
      formDefinition={formDefinition}
      formValues={formValues}
      fieldErrors={fieldErrors}
      handleFieldValueChange={handleFieldValueChange}
      handleSubmitForm={handleSubmitForm}
      isSubmitting={isSubmitting}
    />
  );
}
