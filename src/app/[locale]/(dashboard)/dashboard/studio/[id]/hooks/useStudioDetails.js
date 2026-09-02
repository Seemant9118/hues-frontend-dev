'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import { mapStudioModuleToWorkflowModule } from '@/components/studio/StudioWorkflowOverviewPane';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { usePermission } from '@/hooks/usePermissions';
import { useWorkflowDefinitions } from '@/hooks/workflows/useWorkflowBuilder';
import { getCustomForm } from '@/services/Custom_Form_Services/CustomFormServices';
import { getFormConfig } from '@/services/Form_Config_Services/FormConfigServices';

export function useStudioDetails() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const moduleId = params?.id;
  const formType = searchParams.get('type');
  const isCustomForm = formType === 'CUSTOM';

  const isFeatureEnabled = useFeatureFlag('BUILDER_STUDIO');
  const { hasPermission } = usePermission();
  const hasConfigPermission = hasPermission('permission:form-config-manage');

  const [activeTab, setActiveTab] = useState('overview');

  // Workflow Overview Header Control States
  const [selectedDefinitionId, setSelectedDefinitionId] = useState(null);
  const [hasUserManuallySelected, setHasUserManuallySelected] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreatingNewFlow, setIsCreatingNewFlow] = useState(false);

  // Build New Workflow Modal State
  const [isNewWorkflowModalOpen, setIsNewWorkflowModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');

  // Load form configuration for specific module
  const { data: config, isLoading } = useQuery({
    queryKey: ['get_form_config', moduleId, isCustomForm],
    queryFn: async () => {
      if (isCustomForm) {
        const customData = await getCustomForm(moduleId);
        if (customData) {
          return {
            ...customData,
            id: customData.id || moduleId,
            module: customData.name,
            isCustom: true,
          };
        }
        return {
          id: moduleId,
          module: moduleId,
          isCustom: true,
        };
      }
      return getFormConfig(moduleId);
    },
    enabled: isFeatureEnabled && hasConfigPermission && !moduleId,
  });

  const targetModule = mapStudioModuleToWorkflowModule(
    config?.module || moduleId,
  );
  const { data: definitions = [], isLoading: isDefinitionsLoading } =
    useWorkflowDefinitions(targetModule);

  // Combine definitions with local temporary draft entry when creating new workflow
  const combinedDefinitions = useMemo(() => {
    if (isCreatingNewFlow && newWorkflowName) {
      const localTempDef = {
        id: 'LOCAL_TEMP_DRAFT',
        name: `${newWorkflowName} (New Draft)`,
        status: 'DRAFT',
        active: false,
        isLocalTemp: true,
      };
      return [localTempDef, ...definitions];
    }
    return definitions;
  }, [definitions, isCreatingNewFlow, newWorkflowName]);

  const hasNoDefinitions =
    !isDefinitionsLoading && definitions.length === 0 && !isCreatingNewFlow;

  // Auto-select ACTIVE workflow definition by default on initial load
  useEffect(() => {
    if (isCreatingNewFlow) {
      setSelectedDefinitionId('LOCAL_TEMP_DRAFT');
      return;
    }
    if (definitions.length > 0 && !hasUserManuallySelected) {
      const activeDef =
        definitions.find(
          (d) =>
            d.active === true ||
            String(d.status || '').toUpperCase() === 'ACTIVE' ||
            String(d.status || '').toUpperCase() === 'PUBLISHED',
        ) || definitions[0];

      if (activeDef) {
        setSelectedDefinitionId(activeDef.id);
      }
    }
  }, [definitions, isCreatingNewFlow, hasUserManuallySelected]);

  // Open Build New Workflow Modal
  const handleOpenNewWorkflowModal = () => {
    setNewWorkflowName('');
    setIsNewWorkflowModalOpen(true);
  };

  // Submit Build New Workflow Modal
  const handleCreateWorkflowSubmit = (e) => {
    e?.preventDefault();
    if (!newWorkflowName.trim()) {
      toast.error('Please enter a name for the new workflow.');
      return;
    }
    setIsCreatingNewFlow(true);
    setSelectedDefinitionId('LOCAL_TEMP_DRAFT');
    setIsEditMode(true);
    setIsNewWorkflowModalOpen(false);
    toast.success(
      `Started building new workflow "${newWorkflowName}" for ${targetModule}.`,
    );
  };

  // Cancel Building New Workflow Handler
  const handleCancelNewWorkflow = () => {
    setIsCreatingNewFlow(false);
    setNewWorkflowName('');
    setHasUserManuallySelected(false);
    const activeDef =
      definitions.find(
        (d) =>
          d.active === true ||
          String(d.status || '').toUpperCase() === 'ACTIVE' ||
          String(d.status || '').toUpperCase() === 'PUBLISHED',
      ) || definitions[0];

    if (activeDef) {
      setSelectedDefinitionId(activeDef.id);
    }
    toast.info('Cancelled building new workflow.');
  };

  const titleName = convertSnakeToTitleCase(
    config?.module || 'Studio (Workflow)',
  );

  return {
    router,
    moduleId,
    config,
    isLoading,
    titleName,
    targetModule,
    activeTab,
    setActiveTab,
    definitions,
    combinedDefinitions,
    isDefinitionsLoading,
    hasNoDefinitions,
    selectedDefinitionId,
    setSelectedDefinitionId,
    setHasUserManuallySelected,
    isEditMode,
    setIsEditMode,
    isCreatingNewFlow,
    setIsCreatingNewFlow,
    isNewWorkflowModalOpen,
    setIsNewWorkflowModalOpen,
    newWorkflowName,
    setNewWorkflowName,
    handleOpenNewWorkflowModal,
    handleCreateWorkflowSubmit,
    handleCancelNewWorkflow,
  };
}
