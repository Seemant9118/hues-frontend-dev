'use client';

import TemplateCard from '@/components/templates/TemplateCard';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { usePermission } from '@/hooks/usePermissions';
import { getAllSystemFormConfigs } from '@/services/Form_Config_Services/FormConfigServices';
import { useQuery } from '@tanstack/react-query';
import { Clock, FileText, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

export default function StudioPage() {
  const router = useRouter();
  const isFeatureEnabled = useFeatureFlag('BUILDER_STUDIO');
  const { hasPermission } = usePermission();
  const hasConfigPermission = hasPermission('permission:form-config-manage');

  const [activeMenu, setActiveMenu] = useState(null);
  const [activeTab, setActiveTab] = useState('system');

  // Fetch system form configurations (GET /form-configurations) - enabled only when system tab is active
  const { data: apiSystemForms = [], isLoading: isLoadingSystem } = useQuery({
    queryKey: ['get_all_system_form_configs'],
    queryFn: getAllSystemFormConfigs,
    enabled: isFeatureEnabled && hasConfigPermission && activeTab === 'system',
  });
  // Map system forms for card display
  const systemForms = useMemo(() => {
    if (!Array.isArray(apiSystemForms)) return [];
    return apiSystemForms.map((configItem) => {
      const moduleKey = configItem.module;
      const versionVal =
        configItem.activeRevision === 0
          ? configItem.baseVersion
          : configItem.activeRevision;
      const version =
        typeof versionVal === 'number' ? `v${versionVal}.0` : versionVal;
      const formattedTitle = moduleKey
        ? moduleKey.replace(/_/g, ' ')
        : 'Module';

      return {
        id: moduleKey,
        name: formattedTitle,
        title: formattedTitle,
        formName: moduleKey,
        type: 'SYSTEM',
        description: `System Form - Base Version v${configItem.baseVersion || 1}, Revision ${configItem.revision || 0}`,
        version: version || 'v1.0',
        lastSaved: configItem.updatedAt
          ? new Date(configItem.updatedAt).toLocaleDateString()
          : 'Recently',
        modified: configItem.updatedAt
          ? new Date(configItem.updatedAt).toLocaleDateString()
          : 'Recently',
        fieldsCount: (configItem.fields || []).length,
      };
    });
  }, [apiSystemForms]);

  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const handleContinueFormType = (type) => {
  //   setIsModalOpen(false);
  //   router.push(`/dashboard/studio/create?type=${type}`);
  // };

  // Fetch custom forms (GET /custom-forms) - enabled only when custom tab is active
  // const { data: apiCustomForms = [], isLoading: isLoadingCustom } = useQuery({
  //   queryKey: ['get_all_custom_forms'],
  //   queryFn: getAllCustomForms,
  //   enabled: isFeatureEnabled && hasConfigPermission && activeTab === 'custom',
  // });
  // Map custom forms for card display
  // const customForms = useMemo(() => {
  //   if (!Array.isArray(apiCustomForms)) return [];
  //   const apiMapped = apiCustomForms.map((t) => {
  //     const { name } = t;
  //     const versionVal =
  //       t.activeRevision === 0 ? t.baseVersion : t.activeRevision;
  //     const version =
  //       typeof versionVal === 'number' ? `v${versionVal}.0` : versionVal;
  //     const targetId = t.id;
  //     const formTitle = name || `Custom Form #${targetId}`;

  //     return {
  //       id: targetId,
  //       name: formTitle,
  //       title: formTitle,
  //       formName: formTitle,

  //       formId: targetId,
  //       isCustom: true,
  //       type: 'CUSTOM',
  //       description: `Custom Form - Base Version v${t.baseVersion || 1}, Revision ${t.revision || 0}`,
  //       version: version || 'v1.0',
  //       lastSaved: t.updatedAt
  //         ? new Date(t.updatedAt).toLocaleDateString()
  //         : 'Recently',
  //       modified: t.updatedAt
  //         ? new Date(t.updatedAt).toLocaleDateString()
  //         : 'Recently',
  //       fieldsCount: (t.fields || []).length,
  //     };
  //   });
  //   return apiMapped;
  // }, [apiCustomForms]);

  const handleCardClick = (template) => {
    if (template.isCustom) {
      router.push(`/dashboard/studio/${template.id}?type=CUSTOM`);
    } else {
      router.push(`/dashboard/studio/${template.id}`);
    }
  };

  const renderFormGrid = (forms, emptyMessage) => {
    if (forms.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center text-xs text-neutral-500">
          <FileText className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
          <p className="font-semibold">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* {activeTab === 'custom' && (
          <CreateNewFormCard onClick={() => setIsModalOpen(true)} />
        )} */}
        {forms.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onClick={() => handleCardClick(template)}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
          />
        ))}
      </div>
    );
  };

  return (
    <FeatureFlagWrapper flag="BUILDER_STUDIO" redirectTo="/dashboard">
      <ProtectedWrapper
        permissionCode="permission:form-config-manage"
        redirectTo="/dashboard"
      >
        <Wrapper>
          <SubHeader name="Studio (Workflows)" />
          <p className="mb-4 text-xs text-neutral-500">
            Manage system form configurations and custom dynamic forms for your
            workspace.
          </p>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3">
              <TabsList className="border border-neutral-200 bg-neutral-50 p-1">
                <TabsTrigger value="system">System Workflows</TabsTrigger>
                {/* <TabsTrigger value="custom">Custom Forms</TabsTrigger> */}
              </TabsList>

              <div className="flex items-center gap-3 text-xs text-neutral-500">
                <div className="flex items-center gap-1.5 font-medium text-neutral-500">
                  <LayoutGrid size={16} />
                  <span>Grid View</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} />
                  <span>Sorted by last modified</span>
                </div>
              </div>
            </div>

            {/* System Forms Tab */}
            <TabsContent value="system" className="mt-3">
              {isLoadingSystem ? (
                <div className="py-20 text-center">
                  <Loading />
                </div>
              ) : (
                renderFormGrid(systemForms, 'No system forms found')
              )}
            </TabsContent>

            {/* Custom Forms Tab */}
            {/* <TabsContent value="custom" className="mt-3">
              {isLoadingCustom ? (
                <div className="py-20 text-center">
                  <Loading />
                </div>
              ) : (
                renderFormGrid(customForms, 'No custom forms found')
              )}
            </TabsContent> */}
          </Tabs>

          {/* <FormTypeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onContinue={handleContinueFormType}
            title="Create New Form"
            description="Enter the form type to start building your dynamic form layout."
          /> */}
        </Wrapper>
      </ProtectedWrapper>
    </FeatureFlagWrapper>
  );
}
