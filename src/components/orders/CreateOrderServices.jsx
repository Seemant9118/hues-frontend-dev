'use client';

import React from 'react';
import MultiStepForm from '@/components/shared/MultiStepForm/MultiStepForm';
import { Button } from '@/components/ui/button';
import { useCreateOrderServices } from './hooks/useCreateOrderServices';

const CreateOrderServices = ({
  createSalesServiceBreadCrumbs,
  cta,
  orderId,
  setIsCreatingSalesService,
}) => {
  const {
    formData,
    setFormData,
    errors,
    setErrors,
    directServiceOrderSteps,
    handleSubmit,
    handleCancel,
    handleBeforeNext,
    isSubmitting,
  } = useCreateOrderServices({
    cta,
    orderId,
    setIsCreatingSalesService,
  });

  return (
    <MultiStepForm
      steps={directServiceOrderSteps}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      setErrors={setErrors}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onBeforeNext={handleBeforeNext}
      isSubmitting={isSubmitting}
      breadcrumbs={createSalesServiceBreadCrumbs}
      breadcrumbHome={
        cta === 'offer'
          ? '/dashboard/sales/sales-orders'
          : '/dashboard/purchases/purchase-orders'
      }
      breadcrumbHomeText={cta === 'offer' ? 'Sales Orders' : 'Purchase Orders'}
      breadcrumbTitle={
        cta === 'offer' ? 'Create Sales Service' : 'Create Purchase Service'
      }
      finalStepActions={({
        handleFinalSubmit,
        isSubmitting: isStepSubmitting,
      }) => (
        <Button
          size="sm"
          onClick={() => handleFinalSubmit('submit')}
          disabled={isStepSubmitting}
        >
          {isStepSubmitting
            ? orderId
              ? 'Updating...'
              : 'Creating...'
            : orderId
              ? cta === 'offer'
                ? 'Revise Offer'
                : 'Revise Bid'
              : cta === 'offer'
                ? 'Create Offer'
                : 'Create Bid'}
        </Button>
      )}
    />
  );
};

export default CreateOrderServices;
