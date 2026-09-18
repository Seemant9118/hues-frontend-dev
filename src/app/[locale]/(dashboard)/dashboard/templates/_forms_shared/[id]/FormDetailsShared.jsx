'use client';

import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import FormVersionsTab from '@/components/shared/FormVersionsTab';
import SharedLinksListTab from '@/components/templates/shares/components/SharedLinksListTab';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { useDeveloperMode } from '@/context/DeveloperModeContext';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { usePermission } from '@/hooks/usePermissions';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import FormPreviewTab from '@/app/[locale]/(dashboard)/dashboard/templates/_forms_shared/[id]/components/FormPreviewTab';
import { useFormDetailsConfig } from '@/app/[locale]/(dashboard)/dashboard/templates/_forms_shared/[id]/hooks/useFormDetailsConfig';

export default function FormDetailsShared({ isCustomRoute }) {
  const params = useParams();
  const router = useRouter();
  const moduleId = params?.id;
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab');

  const { hasPermission } = usePermission();
  const isFeatureEnabled = useFeatureFlag('BUILDER_FORMS');
  const { isDeveloperMode, setDeveloperMode } = useDeveloperMode();
  const hasConfigPermission = hasPermission('permission:form-config-manage');

  const [activeTab, setActiveTab] = useState(() => tabParam || 'preview');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const isCustomForm = isCustomRoute || false;

  const {
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
  } = useFormDetailsConfig(
    moduleId,
    isCustomForm,
    isFeatureEnabled,
    hasConfigPermission,
  );

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
                type="button"
                onClick={() =>
                  router.push(
                    `/dashboard/templates/${isCustomForm ? 'custom-forms' : 'system-forms'}`,
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-100"
                title={`Back to ${isCustomForm ? 'Custom' : 'System'} Forms`}
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
              <FormPreviewTab
                isDeveloperMode={isDeveloperMode}
                setDeveloperMode={setDeveloperMode}
                config={config}
                moduleId={moduleId}
                titleName={titleName}
                isCustomForm={isCustomForm}
                fields={fields}
                setFields={setFields}
                formData={formData}
                handleFieldChange={handleFieldChange}
                headerFields={headerFields}
                itemFields={itemFields}
                customFields={customFields}
                initialSystemFields={initialSystemFields}
                initialCustomFields={initialCustomFields}
                isSaving={isSaving}
                handleSaveFormLayout={handleSaveFormLayout}
                handleResetDefaults={handleResetDefaults}
                refetch={refetch}
              />
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
                <SharedLinksListTab
                  resourceType="CUSTOM_FORM"
                  resourceId={config?.id}
                  customForm={config}
                />
              </TabsContent>
            )}
          </Tabs>
        </Wrapper>
      </ProtectedWrapper>
    </FeatureFlagWrapper>
  );
}
