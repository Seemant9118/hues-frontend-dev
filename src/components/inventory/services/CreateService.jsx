/* eslint-disable no-promise-executor-return */
import React from 'react';
import { toast } from 'sonner';

import MultiStepForm from '@/components/shared/MultiStepForm/MultiStepForm';
import { Button } from '@/components/ui/button';
import {
  CreateProductServices,
  UpdateProductServices,
} from '@/services/Inventories_Services/Services_Inventories/Services_Inventories';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { LocalStorageService } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { stepsServiceConfig } from './ServiceConfig';

const CreateService = ({ createServiceBreadCrumbs, servicesToEdit }) => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const translation = useTranslations('components.addService');
  const router = useRouter();
  const [formData, setFormData] = React.useState(() => {
    if (servicesToEdit) {
      return {
        enterpriseId,
        serviceName: servicesToEdit.serviceName || '',
        serviceCode: servicesToEdit.serviceCode || '',
        serviceCategory: servicesToEdit.serviceCategory || '',
        serviceSubType: servicesToEdit.serviceSubType || '',
        defaultFieldsWithValues: { ...servicesToEdit.config } || {},
      };
    }

    return {
      enterpriseId,
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
        base_price: null,
        pricing_model: null,
        per_participant_rate: null,
        gst_percentage: null,
        sac_code: null,

        // Operations Step
        roles_required: null,
        materials_provided: null,
        equipment_needed: null,
        requires_execution_record: null,

        // SLA & Warranty Step
        standard_sla: null,
        cancellation_policy: null,

        // Description Step
        short_description: null,
        long_description: null,
        whats_included: null,
        whats_not_included: null,

        // Add-ons Step
        addon_service_codes: null,
        bundle_codes: null,

        // Terms & Controls Step
        payment_terms: null,
        offer_validity: null,
        governing_law: null,
        dispute_resolution: null,
        delivery_acceptance_reference: null,

        // Contracts and Consents Step
        contract_template: null,
        required_consents: null,
      },
    };
  });
  const [errors, setErrors] = React.useState({});

  // create service
  const createServiceMutation = useMutation({
    mutationFn: CreateProductServices,
    onSuccess: (res) => {
      toast.success('Service created successfully!');
      // Reset form or redirect as needed
      setFormData({
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
      router.push(`/dashboard/inventory/services/${res?.data?.data?.id}`);
    },
    onError: () => {
      toast.error('Failed to create Service. Please try again.');
    },
  });
  // update service
  const updateServiceMutation = useMutation({
    mutationFn: UpdateProductServices,
    onSuccess: () => {
      toast.success('Service updated successfully!');
      router.push(`/dashboard/inventory/services/${servicesToEdit?.id}`);
    },
    onError: () => {
      toast.error('Failed to update Service. Please try again.');
    },
  });

  const removeNullValues = (obj) => {
    const cleanedRoot = Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== null),
    );

    if (cleanedRoot.defaultFieldsWithValues) {
      cleanedRoot.defaultFieldsWithValues = Object.fromEntries(
        Object.entries(cleanedRoot.defaultFieldsWithValues).filter(
          ([, value]) => value !== null,
        ),
      );
    }

    return cleanedRoot;
  };

  const handleSubmit = () => {
    const cleanedPayload = removeNullValues(formData);

    if (servicesToEdit) {
      updateServiceMutation.mutate({
        id: servicesToEdit?.id,
        data: cleanedPayload,
      });
    } else {
      createServiceMutation.mutate(cleanedPayload);
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
      breadcrumbs={createServiceBreadCrumbs}
      breadcrumbHome="/dashboard/inventory/services"
      breadcrumbHomeText="Create Service Master"
      breadcrumbTitle="Service Master"
      translation={translation}
      finalStepActions={({ handleFinalSubmit }) => (
        <Button
          size="sm"
          onClick={() => handleFinalSubmit('submit')}
          disabled={
            createServiceMutation.isPending || updateServiceMutation.isPending
          }
        >
          {createServiceMutation.isPending || updateServiceMutation.isPending
            ? 'Creating...'
            : servicesToEdit
              ? '✓ Update Service'
              : '✓ Create Service'}
        </Button>
      )}
    />
  );
};

export default CreateService;
