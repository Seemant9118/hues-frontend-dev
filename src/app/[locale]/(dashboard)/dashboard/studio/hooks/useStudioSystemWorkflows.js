'use client';

import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { usePermission } from '@/hooks/usePermissions';
import { getAllSystemFormConfigs } from '@/services/Form_Config_Services/FormConfigServices';
import { getWorkflowDefinitions } from '@/services/Workflow_Builder_Services/WorkflowBuilderServices';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

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

  // Fetch custom workflow definitions (GET /workflow-builder/definitions?module=CUSTOM_WORKFLOW)
  const { data: apiCustomDefinitions = [], isLoading: isLoadingCustomDefs } =
    useQuery({
      queryKey: ['get_workflow_definitions_custom_workflow'],
      queryFn: async () => {
        const res = await getWorkflowDefinitions('CUSTOM_WORKFLOW');
        return res.data?.data || res.data || [];
      },
      enabled:
        isFeatureEnabled && hasConfigPermission && activeTab === 'custom',
    });

  // Map system forms for card display, guaranteeing all 6 system workflows are represented
  const systemForms = useMemo(() => {
    const defaultModules = [
      { id: 'SALES_ORDER', name: 'Sales Order', module: 'SALES_ORDER' },
      {
        id: 'PURCHASE_ORDER',
        name: 'Purchase Order',
        module: 'PURCHASE_ORDER',
      },
      {
        id: 'SALES_B2BINVOICE',
        name: 'Sales B2B Invoice',
        module: 'SALES_B2BINVOICE',
      },
      {
        id: 'PURCHASE_B2BINVOICE',
        name: 'Purchase B2B Invoice',
        module: 'PURCHASE_B2BINVOICE',
      },
      { id: 'B2CINVOICE', name: 'B2C Invoice', module: 'B2CINVOICE' },
      { id: 'PAYMENT', name: 'Payment', module: 'PAYMENT' },
    ];

    const apiFormsList = Array.isArray(apiSystemForms) ? apiSystemForms : [];
    const existingModulesSet = new Set(
      apiFormsList.map((item) => String(item.module || item.id).toUpperCase()),
    );

    const mappedApiForms = apiFormsList.map((configItem) => {
      const moduleKey = configItem.module || configItem.id;
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
        description: `System Workflow - Base Version v${configItem.baseVersion || 1}, Revision ${configItem.revision || 0}`,
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

    const fallbackForms = defaultModules
      .filter((defMod) => !existingModulesSet.has(defMod.id))
      .map((defMod) => ({
        id: defMod.id,
        name: defMod.name,
        title: defMod.name,
        formName: defMod.module,
        type: 'SYSTEM',
        description: `System Workflow (${defMod.name})`,
        version: 'v1.0',
        lastSaved: 'System Default',
        modified: 'System Default',
        fieldsCount: 0,
      }));

    return [...mappedApiForms, ...fallbackForms];
  }, [apiSystemForms]);

  // Map custom forms and custom workflow definitions for custom workflows tab display
  const customWorkflows = useMemo(() => {
    const list = [];
    const seenIds = new Set();

    // 1. Add workflow definitions
    if (Array.isArray(apiCustomDefinitions)) {
      apiCustomDefinitions.forEach((def) => {
        const { id } = def;
        seenIds.add(id);
        list.push({
          id,
          name: def.name || 'Custom Workflow',
          title: def.name || 'Custom Workflow',
          formName: def.name || 'Custom Workflow',
          type: 'CUSTOM',
          isCustom: true,
          status: def.status || (def.active ? 'Active' : 'Draft'),
          description: `Custom Workflow Definition (${def.module || 'CUSTOM'})`,
          version:
            typeof def.version === 'number'
              ? `v${def.version}.0`
              : def.version || 'v1.0',
          lastSaved: def.updatedAt
            ? new Date(def.updatedAt).toLocaleDateString()
            : 'Recently',
          modified: def.updatedAt
            ? new Date(def.updatedAt).toLocaleDateString()
            : 'Recently',
        });
      });
    }
    return list;
  }, [apiCustomDefinitions]);

  return {
    systemForms,
    customWorkflows,
    isLoadingSystem,
    isLoadingCustom: isLoadingCustomDefs,
    isFeatureEnabled,
    hasConfigPermission,
  };
}
