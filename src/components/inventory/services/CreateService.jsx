/* eslint-disable no-promise-executor-return */
import React from 'react';
import { toast } from 'sonner';

import MultiStepForm from '@/components/shared/MultiStepForm/MultiStepForm';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { stepsServiceConfig } from './ServiceConfig';

const CreateService = ({ createServiceBreadCrumbs }) => {
  const translation = useTranslations('components.addService');
  const [formData, setFormData] = React.useState({
    buyerContext: {
      buyerId: '',
      contactPerson: '',
      email: '',
      mobile: '',
      billingAddress: '',
      serviceLocation: '',
    },
    services: [],
    offerTerms: {
      paymentTerms: '',
      offerValidity: '',
      notes: '',
      customerNotes: '',
      governingLaw: '',
      disputeResolution: '',
      deliveryAcceptance: '',
    },
  });
  const [errors, setErrors] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Sales Service created successfully!');
      // Reset form or redirect as needed
    } catch (error) {
      toast.error('Failed to create Sales Service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      toast.warning(
        'Are you sure you want to cancel? All changes will be lost.',
        {
          action: {
            label: 'Cancel',
            onClick: () => toast.dismiss(),
          },
        },
      )
    ) {
      // Reset form or redirect as needed
    }
  };

  return (
    <MultiStepForm
      steps={stepsServiceConfig}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      setErrors={setErrors}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
      breadcrumbs={createServiceBreadCrumbs}
      breadcrumbHome="/dashboard/inventory/services"
      breadcrumbHomeText="Create Service Master"
      breadcrumbTitle="Service Master"
      translation={translation}
      finalStepActions={({ handleFinalSubmit, isSubmitting }) => (
        <Button
          size="sm"
          onClick={() => handleFinalSubmit('submit')}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : '✓ Create Service'}
        </Button>
      )}
    />
  );
};

export default CreateService;
