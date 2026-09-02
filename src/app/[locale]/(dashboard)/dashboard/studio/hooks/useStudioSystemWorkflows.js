'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { usePermission } from '@/hooks/usePermissions';
import { getAllSystemFormConfigs } from '@/services/Form_Config_Services/FormConfigServices';

export function useStudioSystemWorkflows(activeTab = 'system') {
  const isFeatureEnabled = useFeatureFlag('BUILDER_STUDIO');
  const { hasPermission } = usePermission();
  const hasConfigPermission = hasPermission('permission:form-config-manage');

  // Fetch system form configurations (GET /form-configurations)
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

  return {
    systemForms,
    isLoadingSystem,
    isFeatureEnabled,
    hasConfigPermission,
  };
}
