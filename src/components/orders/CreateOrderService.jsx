/* eslint-disable no-promise-executor-return */
import React from 'react';
import { toast } from 'sonner';
import MultiStepForm from '../shared/MultiStepForm/MultiStepForm';
import { Button } from '../ui/button';
import { getSalesServiceFormSteps } from './Sales_Service_MultiStep_Form/Create-Sales-Service-config';

const CreateOrderService = ({ createSalesServiceBreadCrumbs }) => {
  const directServiceOrderSteps = getSalesServiceFormSteps();

  const [formData, setFormData] = React.useState({});
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
      steps={directServiceOrderSteps}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      setErrors={setErrors}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
      breadcrumbs={createSalesServiceBreadCrumbs}
      breadcrumbHome="/dashboard/sales/sales-orders"
      breadcrumbHomeText="Sales Orders"
      breadcrumbTitle="Create Sales Service"
      finalStepActions={({ handleFinalSubmit, isSubmitting }) => (
        <Button
          size="sm"
          onClick={() => handleFinalSubmit('submit')}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : '✓ Create Sales Service'}
        </Button>
      )}
    />
  );
};

export default CreateOrderService;
