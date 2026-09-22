'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import {
  getCustomForm,
  resetCustomForm,
  saveCustomForm,
} from '@/services/Custom_Form_Services/CustomFormServices';
import {
  getFormConfig,
  resetFormConfig,
  saveFormConfig,
} from '@/services/Form_Config_Services/FormConfigServices';

export const ITEM_FIELD_KEYS = [
  'productId',
  'serviceId',
  'batch',
  'quantity',
  'unitPrice',
  'gstPerUnit',
  'totalAmount',
  'totalGstAmount',
  'finalAmount',
  'discount',
  'expiryDate',
  'unitId',
  'rate',
  'price',
];

export function useFormDetailsConfig(
  moduleId,
  isCustomForm,
  isFeatureEnabled,
  hasConfigPermission,
) {
  const [fields, setFields] = useState([]);
  const [initialSystemFields, setInitialSystemFields] = useState([]);
  const [initialCustomFields, setInitialCustomFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Load form configuration
  const {
    data: config,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['get_form_config', moduleId, isCustomForm],
    queryFn: async () => {
      if (isCustomForm) {
        const customData = await getCustomForm(moduleId);
        if (customData) {
          const rawFields = customData.fields || [];
          const fieldsList = rawFields.map((f) => ({
            ...f,
            kind: f.kind || 'CUSTOM',
          }));
          return {
            ...customData,
            id: customData.id || moduleId,
            module: customData.name || customData.module || moduleId,
            isCustom: true,
            fields: fieldsList,
          };
        }
        return {
          id: moduleId,
          module: moduleId,
          isCustom: true,
          fields: [],
          baseVersion: 1,
          revision: 0,
        };
      }
      return getFormConfig(moduleId);
    },
    enabled: isFeatureEnabled && hasConfigPermission && !!moduleId,
  });

  useEffect(() => {
    if (config?.fields) {
      setFields(config.fields);

      const sysFields = config.systemFields?.length
        ? config.systemFields
        : config.fields.filter((f) => f.kind === 'SYSTEM');
      const custFields = config.customFields?.length
        ? config.customFields
        : config.fields.filter((f) => f.kind === 'CUSTOM');

      setInitialSystemFields(JSON.parse(JSON.stringify(sysFields)));
      setInitialCustomFields(JSON.parse(JSON.stringify(custFields)));
    }
  }, [config]);

  // Section categorization
  const headerFields = useMemo(() => {
    return fields.filter(
      (f) => f.kind === 'SYSTEM' && !ITEM_FIELD_KEYS.includes(f.key),
    );
  }, [fields]);

  const itemFields = useMemo(() => {
    return fields.filter(
      (f) => f.kind === 'SYSTEM' && ITEM_FIELD_KEYS.includes(f.key),
    );
  }, [fields]);

  const customFields = useMemo(() => {
    return fields.filter(
      (f) => f.kind === 'CUSTOM' || isCustomForm || !!config?.isCustom,
    );
  }, [fields, isCustomForm, config?.isCustom]);

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Unified Save Form Layout handler
  const handleSaveFormLayout = async () => {
    setIsSaving(true);
    try {
      const origSys = initialSystemFields.length
        ? initialSystemFields
        : fields.filter((f) => f.kind === 'SYSTEM');
      const origCust = initialCustomFields.length
        ? initialCustomFields
        : fields.filter((f) => f.kind === 'CUSTOM');

      const isCustomFormVal = isCustomForm || !!config?.isCustom;
      const targetId = config?.id || config?.formId || moduleId;
      const res = isCustomFormVal
        ? await saveCustomForm(
            targetId,
            fields,
            config?.etag || '',
            config,
            origCust,
          )
        : await saveFormConfig(
            targetId,
            fields,
            config?.baseVersion || 1,
            config?.etag || '',
            origCust,
            origSys,
          );

      const isSuccess =
        res.status === true ||
        res.status === 'success' ||
        res.statusCode === 200 ||
        res.status === 200;

      if (isSuccess) {
        toast.success(
          `Form configuration for ${convertSnakeToTitleCase(
            config?.name || config?.module || moduleId,
          )} saved successfully!`,
        );
        await refetch();
      } else if (
        res.error === 'CUSTOM_FORM_STALE' ||
        res.message?.includes('STALE') ||
        res.message?.includes('revision')
      ) {
        toast.error('Form layout updated. Refetching latest version...');
        await refetch();
      } else {
        toast.error(res.message || 'Failed to save form configuration.');
      }
    } catch (err) {
      toast.error('Error saving form layout.');
    } finally {
      setIsSaving(false);
    }
  };

  // Revert form configuration to default
  const handleResetDefaults = async () => {
    setIsSaving(true);
    try {
      const isCustomFormVal = isCustomForm || !!config?.isCustom;
      const targetId = config?.id || config?.formId || moduleId;

      const res = isCustomFormVal
        ? await resetCustomForm(targetId, config?.etag || '')
        : await resetFormConfig(targetId, config?.etag || '');

      if (res.status !== false) {
        toast.info('Form configuration reverted to default.');
        await refetch();
      } else {
        toast.error(res.message || 'Failed to reset form configuration.');
      }
    } catch (err) {
      toast.error('Error resetting form configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    config,
    isLoading,
    refetch,
    fields,
    setFields,
    formData,
    handleFieldChange,
    headerFields,
    itemFields,
    customFields,
    isSaving,
    handleSaveFormLayout,
    handleResetDefaults,
    initialSystemFields,
    initialCustomFields,
  };
}
