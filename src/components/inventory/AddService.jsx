import { saveDraftToSession } from '@/appUtils/helperFunctions';
import { LocalStorageService, SessionStorageService } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreateProductServices,
  UpdateProductServices,
} from '@/services/Inventories_Services/Services_Inventories/Services_Inventories';
import { servicesApi } from '@/api/inventories/services/services';
import Wrapper from '../wrappers/Wrapper';
import MultiStepForm from './multi-step-form/MultiStepForm';
import { stepsServiceConfig } from './multi-step-form/services-form-configs/stepsConfig';

const AddService = ({ setIsCreatingService, servicesToEdit }) => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const draftData = SessionStorageService.get(`${enterpriseId}_ServiceData`);
  const translation = useTranslations('components.addService');
  const queryClient = useQueryClient();

  const [service, setService] = useState({
    enterpriseId,
    // Basic Service Info
    serviceName: '',
    serviceCategory: '',
    serviceSubType: '',
    deliveryMode: '',
    unitOfMeasure: '',

    defaultDuration: '',
    defaultCapacityRule: '',
    tags: [],

    // Pricing & Tax
    basePrice: null,
    currency: 'INR',
    pricingModel: '',
    taxClass: '',
    gstPercentage: null,
    sacCode: '',

    // Operation
    rolesRequired: null,
    locationRequirements: '',
    resourceConstraints: {
      maxServicesPerDay: null,
      maxParallelBookings: null,
    },
    requiredInputs: [],

    // SLA & Warranty
    slaConfig: {
      standardSLA: '',
      responseTimeSLA: '',
      revisionPolicy: {
        numberOfRevisions: null,
        revisionWindowDays: null,
      },
      warranty: {
        description: '',
      },
      penaltyLogic: '',
    },

    // Description
    shortDescription: '',
    longDescription: '',

    serviceInclusions: {
      included: [],
      excluded: [],
    },

    // Add-on Services
    addOnServices: null,

    // Contracts
    contractsConfig: {
      defaultServiceAgreementTemplateId: null,
      requiredConsents: null,
      complianceNotes: '',
    },
  });
  const [errors, setErrors] = useState(null);

  // prefilled from draftData
  useEffect(() => {
    if (!draftData) return; // Only proceed if draft exists

    setService((prev) => {
      // Merge top-level keys
      const merged = {
        ...prev,
        ...draftData,
        resourceConstraints: {
          ...prev.resourceConstraints,
          ...draftData.resourceConstraints,
        },
        slaConfig: {
          ...prev.slaConfig,
          ...draftData.slaConfig,
          revisionPolicy: {
            ...prev.slaConfig.revisionPolicy,
            ...draftData.slaConfig?.revisionPolicy,
          },
          warranty: {
            ...prev.slaConfig.warranty,
            ...draftData.slaConfig?.warranty,
          },
        },
        serviceInclusions: {
          ...prev.serviceInclusions,
          ...draftData.serviceInclusions,
        },
      };

      // Only update state if there are changes to avoid infinite loops
      const isEqual = JSON.stringify(prev) === JSON.stringify(merged);
      return isEqual ? prev : merged;
    });
  }, []);

  // Prefill when editing an existing service
  useEffect(() => {
    if (!servicesToEdit) return;

    setService((prev) => {
      const merged = {
        ...prev,
        ...servicesToEdit,
        gstPercentage: Number(servicesToEdit?.gstPercentage),

        resourceConstraints: {
          ...prev.resourceConstraints,
          ...servicesToEdit.resourceConstraints,
        },

        slaConfig: {
          ...prev.slaConfig,
          ...servicesToEdit.slaConfig,
          revisionPolicy: {
            ...prev.slaConfig.revisionPolicy,
            ...servicesToEdit.slaConfig?.revisionPolicy,
          },
          warranty: {
            ...prev.slaConfig.warranty,
            ...servicesToEdit.slaConfig?.warranty,
          },
        },

        serviceInclusions: {
          ...prev.serviceInclusions,
          ...servicesToEdit.serviceInclusions,
        },

        contractsConfig: {
          ...prev.contractsConfig,
          ...servicesToEdit.contractsConfig,
        },
      };

      delete merged.defaultDurationMinutes;
      // Prevent infinite re-renders
      const isEqual = JSON.stringify(prev) === JSON.stringify(merged);
      return isEqual ? prev : merged;
    });
  }, [servicesToEdit]);

  const addServiceMutation = useMutation({
    mutationFn: CreateProductServices,
    onSuccess: () => {
      toast.success('Services Added Successfully');
      queryClient.invalidateQueries({
        queryKey: [servicesApi.getAllProductServices.endpointKey],
      });
      setIsCreatingService(false);
      SessionStorageService.remove(`${enterpriseId}_ServiceData`);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: UpdateProductServices,
    onSuccess: () => {
      toast.success('Service Updated Successfully');
      queryClient.invalidateQueries({
        queryKey: [servicesApi.getAllProductServices.endpointKey],
      });
      queryClient.invalidateQueries({
        queryKey: [servicesApi.getProductServices.endpointKey],
      });
      setIsCreatingService(false);
      SessionStorageService.remove(`${enterpriseId}_ServiceData`);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleSubmit = async (type = 'save') => {
    const hours = String(Number(service.hours || 0)).padStart(2, '0');
    const minutes = String(Number(service.minutes || 0)).padStart(2, '0');
    const basePrice = Number(service.basePrice) || 0;

    const payload = {
      ...service,
      basePrice,
      defaultDuration: `${hours}H:${minutes}M`,
    };

    // SAVE DRAFT (only when creating a new service)
    if (type === 'save') {
      saveDraftToSession({ key: `${enterpriseId}_ServiceData`, data: payload });
      setIsCreatingService(false);
      toast.success('Service Added Successfully');
      return;
    }

    // UPDATE existing service
    if (servicesToEdit) {
      updateServiceMutation.mutate({ id: servicesToEdit.id, data: payload });
      return;
    }

    // CREATE new service
    addServiceMutation.mutate(payload);
  };

  return (
    <Wrapper className="h-full">
      {/* HEADER */}
      <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
        <h2 className="text-xl font-bold text-zinc-900">
          {translation('title')}
        </h2>
      </section>

      {/* Main Form */}
      <MultiStepForm
        isEditing={!!servicesToEdit}
        id={enterpriseId}
        config={stepsServiceConfig}
        formData={service}
        setFormData={setService}
        errors={errors}
        setErrors={setErrors}
        onFinalSubmit={handleSubmit}
        isSubmitting={addServiceMutation?.isPending}
        onCancel={() => setIsCreatingService(false)}
        translation={translation}
      />
    </Wrapper>
  );
};

export default AddService;
