'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getCustomForm } from '@/services/Custom_Form_Services/CustomFormServices';
import { submitStandaloneCustomForm } from '@/services/Form_Submission_Services/FormSubmissionServices';

export const useStandaloneFormFiller = (formId) => {
  const router = useRouter();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // 1. Fetch form definition
  const {
    data: rawForm,
    isLoading: isLoadingSchema,
    error: schemaError,
  } = useQuery({
    queryKey: ['get_custom_form_standalone', formId],
    queryFn: () => getCustomForm(formId),
  });

  // Extract fields normalized
  const fields = useMemo(() => {
    if (!rawForm) return [];
    if (
      Array.isArray(rawForm.customFields) &&
      rawForm.customFields.length > 0
    ) {
      return rawForm.customFields;
    }
    if (Array.isArray(rawForm.fields)) {
      return rawForm.fields;
    }
    return [];
  }, [rawForm]);

  // Handler for field change
  const handleChange = useCallback((fieldKey, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [fieldKey]: null,
    }));
  }, []);

  // Validation routine
  const validateForm = useCallback(() => {
    const newErrors = {};
    fields.forEach((field) => {
      if (field.required && field.visible !== false) {
        const val = formData[field.key];
        if (val === undefined || val === null || val === '') {
          newErrors[field.key] = `${field.label || field.key} is required`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, formData]);

  // 2. Submit mutation
  const submitMutation = useMutation({
    mutationFn: (payload) => submitStandaloneCustomForm(payload),
    onSuccess: (res) => {
      if (res && res.status) {
        toast.success(res.message || 'Form submitted successfully!');
        setFormData({});
        router.push('/dashboard/custom-forms?tab=submissions');
      } else {
        toast.error(res?.message || 'Failed to submit form.');
      }
    },
    onError: (err) => {
      const errorMsg =
        err?.response?.data?.message || 'Error occurred while submitting form.';
      toast.error(errorMsg);
    },
  });

  const handleSubmit = useCallback(
    (e) => {
      if (e) e.preventDefault();

      if (!validateForm()) {
        toast.error('Please fix validation errors before submitting.');
        return;
      }

      const numericId = Number(rawForm?.id || formId);
      const payload = {
        formConfigurationId: Number.isNaN(numericId) ? formId : numericId,
        values: formData,
        formConfig: {
          baseVersion: rawForm?.baseVersion ?? 1,
          revision: rawForm?.activeRevision ?? rawForm?.revision ?? 0,
        },
      };

      submitMutation.mutate(payload);
    },
    [validateForm, rawForm, formId, formData, submitMutation],
  );

  return {
    form: rawForm,
    fields,
    formData,
    errors,
    isLoadingSchema,
    isSubmitting: submitMutation.isPending,
    schemaError,
    handleChange,
    handleSubmit,
  };
};
