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
    // Overview Step top-level fields
    serviceName: '',
    serviceCode: '',
    serviceCategory: '',
    serviceSubType: '',

    defaultFieldsWithValues: {
      // Overview
      delivery_mode: null,
      unit: null,
      training_topics: [],
      max_participants: null,
      default_duration_hours: null,

      // Pricing Step
      base_price: '',
      pricing_model: '',
      per_participant_rate: '',
      gst_percentage: '',
      sac_code: '',

      // Operations Step
      roles_required: [],
      materials_provided: [],
      equipment_needed: [],
      requires_execution_record: null,

      // SLA & Warranty Step
      standard_sla: '',
      cancellation_policy: '',

      // Description Step
      short_description: '',
      long_description: '',
      whats_included: [],
      whats_not_included: [],

      // Add-ons Step
      addon_service_codes: [],
      bundle_codes: [],

      // Terms & Controls Step
      payment_terms: '',
      offer_validity: '',
      governing_law: '',
      dispute_resolution: '',
      delivery_acceptance_reference: '',

      // Contracts and Consents Step
      contract_template: '',
      required_consents: [],
    },
  });
  const [errors, setErrors] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // console.log('--- Final Service Creation Payload ---');
    // console.log(JSON.stringify(formData, null, 2));

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
