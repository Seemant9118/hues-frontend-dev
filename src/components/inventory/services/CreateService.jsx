/* eslint-disable no-promise-executor-return */
import React, { useMemo } from 'react';
import { toast } from 'sonner';

import MultiStepForm from '@/components/shared/MultiStepForm/MultiStepForm';
import { Button } from '@/components/ui/button';
import {
  CreateProductServices,
  getServiceConfigFields,
  UpdateProductServices,
} from '@/services/Inventories_Services/Services_Inventories/Services_Inventories';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { LocalStorageService } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { servicesApi } from '@/api/inventories/services/services';
import { capitalize } from '@/appUtils/helperFunctions';
import { stepsServiceConfig } from './ServiceConfig';

const CreateService = ({
  createServiceBreadCrumbs,
  setIsEditing,
  servicesToEdit,
}) => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const translation = useTranslations('components.addService');
  const router = useRouter();
  const [formData, setFormData] = React.useState(() => {
    if (servicesToEdit) {
      return {
        enterpriseId,
        serviceName: servicesToEdit.serviceName || '',
        serviceCode: servicesToEdit.serviceCode || '',
        serviceCategoryId: servicesToEdit.serviceCategoryId || '',
        serviceSubTypeId: servicesToEdit.serviceSubTypeId || '',
        defaultFieldsWithValues: Object.fromEntries(
          Object.entries(servicesToEdit.config || {}).map(([key, value]) => [
            key,
            typeof value === 'object' ? value : { defaultValue: value },
          ]),
        ),
      };
    }

    return {
      enterpriseId,
      // Overview Step top-level fields
      serviceName: '',
      serviceCode: '',
      serviceCategoryId: '',
      serviceSubTypeId: '',
      defaultFieldsWithValues: {},
    };
  });
  const [errors, setErrors] = React.useState({});

  // Fetch config fields when serviceSubTypeId changes
  const { data: configFieldsData, isLoading: isConfigLoading } = useQuery({
    queryKey: [
      servicesApi.getServiceConfigFields.endpointKey,
      formData.serviceSubTypeId,
    ],
    queryFn: () => getServiceConfigFields({ id: formData.serviceSubTypeId }),
    enabled: !!formData.serviceSubTypeId,
  });

  // Transform API response into step-grouped sections for Layout components
  const configFields = useMemo(() => {
    // Utility to find the object containing "config" inside potentially nested layers
    const findConfigTarget = (obj) => {
      if (!obj || typeof obj !== 'object') return null;
      if (obj.config && obj.config.fields) return obj;
      // Also check if obj.data has it
      if (obj.data) return findConfigTarget(obj.data);
      // Also check obj.data.data .. etc. Just a simple check up to a few levels
      return null;
    };

    const actualData = findConfigTarget(configFieldsData);
    if (!actualData?.config?.fields) return null;

    let allFields = actualData.config.fields;

    // Safety check just in case it's a JSON string
    if (typeof allFields === 'string') {
      try {
        allFields = JSON.parse(allFields);
      } catch (e) {
        return null;
      }
    }

    const stepMapping = {
      overview: [], // `service_name` and `service_code` are handled by top-level state
      pricing: [
        'pricing_model',
        'unit_of_measure',
        'base_price',
        'gst_rate_percent',
        'sac_hsn_code',
      ],
      operations: ['delivery_mode', 'default_duration_minutes'],
      SLAAndWarranty: ['sla_response_hours', 'sla_completion_hours'],
      description: [
        'whats_included',
        'whats_not_included',
        'input_requirements',
      ],
      addOns: ['add_on_service_codes', 'bundle_codes'],
      termsAndControls: [
        'requires_internal_approval',
        'requires_client_signoff',
        'is_active',
      ],
      contracts: [
        'contract_template_id',
        'required_consents',
        'execution_form_template_id',
        'requires_execution_record',
        'execution_source',
      ],
    };

    const transformed = {};

    Object.keys(stepMapping).forEach((stepKey) => {
      const fieldNames = stepMapping[stepKey];
      const stepFields = allFields.filter((f) => fieldNames.includes(f.name));

      if (stepFields.length > 0) {
        transformed[stepKey] = stepFields.map((field) => {
          const processedField = { ...field, required: field.isRequired };
          if (processedField.options && Array.isArray(processedField.options)) {
            processedField.options = processedField.options.map((opt) => ({
              ...opt,
              label: opt.label ? capitalize(opt.label) : opt.label,
            }));
          }

          return {
            key: field.name,
            label: capitalize(field.label) || capitalize(field.name),
            enabledByDefault: false,
            isRequired: field.isRequired || false,
            fields: [processedField],
          };
        });
      } else {
        transformed[stepKey] = [];
      }
    });

    return transformed;
  }, [configFieldsData]);

  // create service
  const createServiceMutation = useMutation({
    mutationFn: CreateProductServices,
    onSuccess: (res) => {
      toast.success('Service created successfully!');
      // Reset form
      setFormData({
        enterpriseId,
        serviceName: '',
        serviceCode: '',
        serviceCategoryId: '',
        serviceSubTypeId: '',
        defaultFieldsWithValues: {},
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

  const removeRedundantValues = (obj) => {
    const cleanedRoot = Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== null),
    );

    if (cleanedRoot.defaultFieldsWithValues) {
      cleanedRoot.defaultFieldsWithValues = Object.fromEntries(
        Object.entries(cleanedRoot.defaultFieldsWithValues)
          .filter(([, value]) => value !== null)
          .map(([key, value]) => {
            if (value?.options) {
              return [
                key,
                {
                  ...value,
                  options: value.options.filter((opt) => opt.value !== 'ADD'),
                },
              ];
            }

            return [key, value];
          }),
      );
    }

    return cleanedRoot;
  };

  const handleSubmit = () => {
    const newErrors = {};
    let hasErrors = false;

    if (configFields) {
      Object.values(configFields).forEach((stepSections) => {
        stepSections.forEach((section) => {
          section.fields.forEach((field) => {
            if (field.isRequired || field.required) {
              const fieldState = formData.defaultFieldsWithValues?.[field.name];
              const value = fieldState?.defaultValue;
              const isEnabled = !!fieldState;

              if (
                !isEnabled ||
                value === '' ||
                value === null ||
                value === undefined ||
                value?.length === 0
              ) {
                newErrors[field.name] =
                  `${field.label || field.name} is required`;
                hasErrors = true;
              }
            }
          });
        });
      });
    }

    if (hasErrors) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      toast.error('Please fill all required fields');
      return;
    }

    const cleanedPayload = removeRedundantValues(formData);

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
    if (setIsEditing) {
      setIsEditing(false);
      return;
    }
    router.push('/dashboard/inventory/services');
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
      configFields={configFields}
      isConfigLoading={isConfigLoading}
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
