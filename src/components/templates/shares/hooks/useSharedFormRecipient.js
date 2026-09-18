'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

import {
  getSharedResource,
  getSharedResourceData,
  signSharedAgreement,
  submitSharedForm,
} from '@/services/Resource_Share_Services/ResourceShareServices';
import { useSharedRecipientAuth } from '@/components/templates/shares/hooks/useSharedRecipientAuth';

export const RECIPIENT_STEPS = {
  LOADING: 'LOADING',
  UNAVAILABLE: 'UNAVAILABLE',
  IDENTITY_VERIFICATION: 'IDENTITY_VERIFICATION',
  OTP_VERIFICATION: 'OTP_VERIFICATION',
  FORM_VIEW: 'FORM_VIEW',
  AGREEMENT_VIEW: 'AGREEMENT_VIEW',
  SUBMITTED: 'SUBMITTED',
  SIGNED: 'SIGNED',
};

export function useSharedFormRecipient(token) {
  const [currentStep, setCurrentStep] = useState(RECIPIENT_STEPS.LOADING);
  const [unavailableMessage, setUnavailableMessage] = useState('');

  // Share metadata, Form definition & Agreement data
  const [shareMeta, setShareMeta] = useState(null);
  const [formDefinition, setFormDefinition] = useState(null);
  const [agreementData, setAgreementData] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [signedResult, setSignedResult] = useState(null);
  const [isSigningAgreement, setIsSigningAgreement] = useState(false);

  // Form input answers & field errors
  const [formValues, setFormValues] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guard refs to prevent duplicate calls and circular dependency loops
  const isVerifyingLinkRef = useRef(false);
  const isLoadingResourceRef = useRef(false);
  const verifiedTokenRef = useRef(null);
  const shareMetaRef = useRef(null);

  // 1. Fetch Form / Agreement Resource
  const loadResourceData = useCallback(
    async (sessionToken, meta = null) => {
      if (!token || isLoadingResourceRef.current) return;
      isLoadingResourceRef.current = true;

      try {
        const res = await getSharedResourceData(token, sessionToken);

        if (!res || res.status === false) {
          setUnavailableMessage(
            res?.message || 'Failed to load the shared resource content.',
          );
          setCurrentStep(RECIPIENT_STEPS.UNAVAILABLE);
          return;
        }

        const effectiveMeta = meta || shareMetaRef.current;
        const resourceType =
          effectiveMeta?.resourceType ||
          res.data?.resourceType ||
          (res.data?.form
            ? 'CUSTOM_FORM'
            : res.data?.agreement || res.data?.content
              ? 'AGREEMENT'
              : 'CUSTOM_FORM');

        if (resourceType === 'AGREEMENT') {
          const rawAgreement =
            res.data?.agreement || res.data?.template || res.data || {};
          const agreement = {
            ...(res.data?.share || {}),
            ...rawAgreement,
            generatedDocumentUrl:
              rawAgreement?.generatedDocumentUrl ||
              res.data?.generatedDocumentUrl ||
              res.data?.agreement?.generatedDocumentUrl ||
              null,
            signedDocumentUrl:
              rawAgreement?.signedDocumentUrl ||
              res.data?.signedDocumentUrl ||
              res.data?.agreement?.signedDocumentUrl ||
              null,
          };
          setAgreementData(agreement);

          if (
            agreement?.signedDocumentUrl ||
            agreement?.isSigned ||
            agreement?.signedDocument ||
            agreement?.status === 'SIGNED'
          ) {
            setCurrentStep(RECIPIENT_STEPS.SIGNED);
          } else {
            setCurrentStep(RECIPIENT_STEPS.AGREEMENT_VIEW);
          }
          return;
        }

        const form = res.data?.form || res.data || null;
        setFormDefinition(form);

        // Initialize blank values from form fields
        if (form?.fields && Array.isArray(form.fields)) {
          const initial = {};
          form.fields.forEach((f) => {
            if (f.key) initial[f.key] = '';
          });
          setFormValues(initial);
        }

        setCurrentStep(RECIPIENT_STEPS.FORM_VIEW);
      } finally {
        isLoadingResourceRef.current = false;
      }
    },
    [token],
  );

  // 2. Initial Link Verification
  const verifyLink = useCallback(async () => {
    if (!token || isVerifyingLinkRef.current) return;
    isVerifyingLinkRef.current = true;
    setCurrentStep(RECIPIENT_STEPS.LOADING);

    try {
      const res = await getSharedResource(token);

      if (!res || res.status === false) {
        setUnavailableMessage(
          res?.message || 'This shared link is unavailable or has expired.',
        );
        setCurrentStep(RECIPIENT_STEPS.UNAVAILABLE);
        return;
      }

      const data = res.data || res;
      shareMetaRef.current = data;
      setShareMeta(data);

      if (data.requiresIdentityVerification) {
        setCurrentStep(RECIPIENT_STEPS.IDENTITY_VERIFICATION);
      } else {
        await loadResourceData(null, data);
      }
    } finally {
      isVerifyingLinkRef.current = false;
    }
  }, [token, loadResourceData]);

  useEffect(() => {
    if (!token) return;
    if (verifiedTokenRef.current === token) return;
    verifiedTokenRef.current = token;
    verifyLink();
  }, [token, verifyLink]);

  // Private Identity & OTP Verification via extracted custom hook
  const {
    identity,
    setIdentity,
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
  } = useSharedRecipientAuth({
    token,
    onRequireOtp: () => setCurrentStep(RECIPIENT_STEPS.OTP_VERIFICATION),
    onAuthSuccess: async (sToken) => {
      await loadResourceData(sToken, shareMetaRef.current);
    },
  });

  // Form value change handler
  const handleFieldValueChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // 6. Submit Form
  const handleSubmitForm = async (e) => {
    if (e) e.preventDefault();

    // Client-side required checks
    const errors = {};
    if (formDefinition?.fields) {
      formDefinition.fields.forEach((f) => {
        if (
          f.required &&
          (!formValues[f.key] || formValues[f.key].toString().trim() === '')
        ) {
          errors[f.key] = `${f.label || f.key} is required.`;
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        values: formValues,
        formConfig: {
          baseVersion: formDefinition?.baseVersion || 1,
          revision: formDefinition?.revision || 0,
        },
      };

      const res = await submitSharedForm(token, payload, shareSessionToken);

      if (res?.status === false) {
        if (res.error === 'FORM_CONFIG_STALE') {
          toast.warning('Form configuration was updated. Refreshing form...');
          await loadResourceData(shareSessionToken, shareMetaRef.current);
          return;
        }

        if (res.data?.errors && Array.isArray(res.data.errors)) {
          const apiErrs = {};
          res.data.errors.forEach((err) => {
            const key = err.path?.replace('values.', '');
            if (key) apiErrs[key] = err.message;
          });
          setFieldErrors(apiErrs);
        }

        toast.error(res.message || 'Form submission failed.');
        return;
      }

      setSubmissionResult(res.data || res);
      setCurrentStep(RECIPIENT_STEPS.SUBMITTED);
      toast.success('Form submitted successfully!');
    } catch (err) {
      toast.error('Error submitting form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 7. Sign Shared Agreement (using /shared-resources/:token/agreement/sign)
  const handleSignAgreement = async (signaturePayload) => {
    if (!token) {
      toast.error('Shared resource token not found.');
      return false;
    }

    setIsSigningAgreement(true);
    try {
      const payload = {
        signatureData: signaturePayload?.signatureData,
        signatureType: signaturePayload?.signatureType || 'DRAWN',
        signedAt: signaturePayload?.signedAt || new Date().toISOString(),
        signerName:
          signaturePayload?.signerName ||
          agreementData?.recipient?.name ||
          agreementData?.recipientName ||
          agreementData?.name ||
          'Signer',
      };

      const res = await signSharedAgreement(token, payload, shareSessionToken);

      if (!res || res.status === false) {
        const errorMsg =
          res?.message || 'Failed to submit agreement signature.';
        toast.error(errorMsg);
        return false;
      }

      const resultData = res?.data?.data || res?.data || res;

      setSignedResult(resultData);
      setAgreementData((prev) => ({
        ...prev,
        isSigned: true,
        status: 'SIGNED',
        signedAt: payload.signedAt,
        signatureData: payload.signatureData,
        signatureType: payload.signatureType,
        signedDocumentUrl:
          resultData?.agreement?.signedDocumentUrl ||
          resultData?.signedDocumentUrl ||
          resultData?.signedDocument?.documentSlug ||
          prev?.signedDocumentUrl ||
          prev?.generatedDocumentUrl,
        signedDocument: resultData?.signedDocument || prev?.signedDocument,
      }));
      setCurrentStep(RECIPIENT_STEPS.SIGNED);
      toast.success('Signature captured successfully!');
      return true;
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit agreement signature.';
      toast.error(errorMsg);
      return false;
    } finally {
      setIsSigningAgreement(false);
    }
  };

  return {
    currentStep,
    unavailableMessage,
    shareMeta,
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
    reloadResource: () =>
      loadResourceData(shareSessionToken, shareMetaRef.current),
  };
}
