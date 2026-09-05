'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  FileText,
  GitBranch,
  Package,
  RotateCcw,
  Save,
  Sliders,
  Wrench,
} from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import DynamicFormRenderer from '@/components/shared/DynamicFormRenderer';
import FormVersionsTab from '@/components/shared/FormVersionsTab';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ComingSoon from '@/components/ui/ComingSoon';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { useDeveloperMode } from '@/context/DeveloperModeContext';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { usePermission } from '@/hooks/usePermissions';
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

const ITEM_FIELD_KEYS = [
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

export default function FormDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params?.id;

  const { hasPermission } = usePermission();
  const isFeatureEnabled = useFeatureFlag('BUILDER_FORMS');
  const { isDeveloperMode, setDeveloperMode } = useDeveloperMode();
  const hasConfigPermission = hasPermission('permission:form-config-manage');

  const [fields, setFields] = useState([]);
  const [initialSystemFields, setInitialSystemFields] = useState([]);
  const [initialCustomFields, setInitialCustomFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('preview');
  const [isSaving, setIsSaving] = useState(false);

  const searchParams = useSearchParams();
  const formType = searchParams.get('type') || searchParams.get('formType');

  const isCustomForm =
    formType === 'CUSTOM' ||
    searchParams.get('isCustom') === 'true' ||
    moduleId?.startsWith('custom') ||
    false;

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

      if (res.status) {
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

  if (isLoading) {
    return (
      <FeatureFlagWrapper flag="BUILDER_FORMS" redirectTo="/dashboard">
        <ProtectedWrapper permissionCode="permission:form-config-manage">
          <Wrapper>
            <SubHeader name="Form Details" />
            <Loading />
          </Wrapper>
        </ProtectedWrapper>
      </FeatureFlagWrapper>
    );
  }

  const titleName = convertSnakeToTitleCase(
    config?.name || config?.module || moduleId || 'Form',
  );

  const isSystemForm = !(isCustomForm || config?.isCustom);

  return (
    <FeatureFlagWrapper flag="BUILDER_FORMS" redirectTo="/dashboard">
      <ProtectedWrapper permissionCode="permission:form-config-manage">
        <Wrapper>
          {/* Header & Actions */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard/templates/forms')}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-100"
                title="Back to Forms"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-end gap-3">
                  <SubHeader name={`${titleName}`} />
                  {isSystemForm ? (
                    <Badge variant="outline">System Form</Badge>
                  ) : (
                    <Badge variant="outline">Custom Form</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  Preview end-user form layout, inspect version history,
                  activate versions, and share form.
                </p>
              </div>
            </div>

            {/* CTA to Check Workflow - Rendered ONLY for System Forms */}
            {isSystemForm && hasConfigPermission && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  router.push(`/dashboard/studio/${moduleId}`);
                }}
                className="gap-1.5 border-primary/40 text-xs font-semibold text-primary shadow-sm hover:bg-primary/5"
              >
                <GitBranch size={14} />
                Check Workflow
              </Button>
            )}
          </div>

          {/* Navigation Tabs Section */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="border border-neutral-200 bg-neutral-50 p-1">
              <TabsTrigger value="preview">Form Preview</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
              {isCustomForm && (
                <TabsTrigger value="share">Share Form</TabsTrigger>
              )}
            </TabsList>

            {/* Tab 1: Form Preview */}
            <TabsContent value="preview" className="space-y-4">
              {isDeveloperMode ? (
                <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-800">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-blue-600" />
                    <span>
                      <strong>Developer Mode Active:</strong> Edit labels, field
                      visibility, constraint requirements, reorder elements, or
                      add custom fields below section by section.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800">
                  <span>
                    To customize section layout boundaries or add custom fields,
                    activate <strong>Developer Mode</strong>.
                  </span>
                  <button
                    onClick={() => setDeveloperMode(true)}
                    className="rounded-lg bg-amber-600 px-3 py-1 text-[11px] font-bold text-white shadow hover:bg-amber-700"
                  >
                    Enable Dev Mode
                  </button>
                </div>
              )}

              {/* Section 1: General & Header Details */}
              {headerFields.length > 0 && (
                <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
                      <FileText className="h-4 w-4 text-primary" />
                      General & Header Information
                    </h4>
                    <span className="text-xs text-neutral-400">
                      {headerFields.length}{' '}
                      {headerFields.length === 1 ? 'field' : 'fields'}
                    </span>
                  </div>
                  <DynamicFormRenderer
                    module={config?.module || moduleId}
                    fields={fields}
                    setFields={setFields}
                    formData={formData}
                    onChange={handleFieldChange}
                    filterFn={(f) =>
                      f.kind === 'SYSTEM' && !ITEM_FIELD_KEYS.includes(f.key)
                    }
                    allowAddField={false}
                    showSaveControls={false}
                    isConfigurable={true}
                    isCustom={isCustomForm || !!config?.isCustom}
                    customFormMeta={config}
                    baseVersion={config?.baseVersion}
                    etag={config?.etag}
                    originalCustomFields={initialCustomFields}
                    originalSystemFields={initialSystemFields}
                    onSaveSuccess={() => refetch()}
                  />
                </div>
              )}

              {/* Section 2: Line Item & Calculation Details */}
              {itemFields.length > 0 && (
                <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
                      <Package className="h-4 w-4 text-primary" />
                      Line Item & Calculation Information
                    </h4>
                    <span className="text-xs text-neutral-400">
                      {itemFields.length}{' '}
                      {itemFields.length === 1 ? 'field' : 'fields'}
                    </span>
                  </div>
                  <DynamicFormRenderer
                    module={config?.module || moduleId}
                    fields={fields}
                    setFields={setFields}
                    formData={formData}
                    onChange={handleFieldChange}
                    filterFn={(f) =>
                      f.kind === 'SYSTEM' && ITEM_FIELD_KEYS.includes(f.key)
                    }
                    allowAddField={false}
                    showSaveControls={false}
                    isConfigurable={true}
                    isCustom={isCustomForm || !!config?.isCustom}
                    customFormMeta={config}
                    baseVersion={config?.baseVersion}
                    etag={config?.etag}
                    originalCustomFields={initialCustomFields}
                    originalSystemFields={initialSystemFields}
                    onSaveSuccess={() => refetch()}
                  />
                </div>
              )}

              {/* Section 3: Custom & Additional Fields */}
              <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
                    <Sliders className="h-4 w-4 text-primary" />
                    Custom & Additional Fields
                  </h4>
                  <span className="text-xs text-neutral-400">
                    {customFields.length}{' '}
                    {customFields.length === 1 ? 'field' : 'fields'}
                  </span>
                </div>
                <DynamicFormRenderer
                  module={config?.module || moduleId}
                  fields={fields}
                  setFields={setFields}
                  formData={formData}
                  onChange={handleFieldChange}
                  filterFn={(f) =>
                    f.kind === 'CUSTOM' || isCustomForm || !!config?.isCustom
                  }
                  allowAddField={true}
                  showSaveControls={false}
                  isConfigurable={true}
                  isCustom={isCustomForm || !!config?.isCustom}
                  customFormMeta={config}
                  baseVersion={config?.baseVersion}
                  etag={config?.etag}
                  originalCustomFields={initialCustomFields}
                  originalSystemFields={initialSystemFields}
                  onSaveSuccess={() => refetch()}
                />
              </div>

              {/* Unified Single Save Form Layout CTA Bar */}
              {isDeveloperMode && (
                <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-xl border border-blue-200 bg-white/95 p-4 shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Wrench className="h-4 w-4 shrink-0 text-blue-600" />
                    <span>
                      Saving will update system field overrides and custom
                      fields for the entire form ({titleName}).
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleResetDefaults}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 active:bg-slate-200 disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset Defaults
                    </button>
                    <button
                      onClick={handleSaveFormLayout}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {isSaving ? 'Saving...' : 'Save Form Layout'}
                    </button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Versions */}
            <TabsContent value="versions">
              <FormVersionsTab
                moduleName={config?.module || moduleId}
                formId={config?.id || moduleId}
                currentBaseVersion={config?.baseVersion}
                currentRevision={config?.revision}
                isCustom={isCustomForm || !!config?.isCustom}
                onVersionActivated={() => refetch()}
              />
            </TabsContent>

            {/* Tab 3: Share Form */}
            {isCustomForm && (
              <TabsContent value="share" className="space-y-4">
                <ComingSoon />
              </TabsContent>
            )}
          </Tabs>
        </Wrapper>
      </ProtectedWrapper>
    </FeatureFlagWrapper>
  );
}
