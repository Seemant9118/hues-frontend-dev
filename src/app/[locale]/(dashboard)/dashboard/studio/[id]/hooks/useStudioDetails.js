'use client';

import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import { mapStudioModuleToWorkflowModule } from '@/components/studio/StudioWorkflowOverviewPane';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { usePermission } from '@/hooks/usePermissions';
import { useWorkflowDefinitions } from '@/hooks/workflows/useWorkflowBuilder';
import { getFormConfig } from '@/services/Form_Config_Services/FormConfigServices';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export function useStudioDetails() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const moduleId = params?.id;
  const formType = searchParams.get('type');
  const definitionIdFromQuery = searchParams.get('definitionId');
  const isCreateRequested = searchParams.get('create') === 'true';
  const requestedNameFromQuery = searchParams.get('name');
  const tabFromQuery = searchParams.get('tab');

  const isCustomWorkflow =
    formType === 'CUSTOM' ||
    formType === 'CUSTOM_WORKFLOW' ||
    moduleId === 'CUSTOM' ||
    moduleId === 'CUSTOM_WORKFLOW' ||
    Boolean(definitionIdFromQuery) ||
    !Number.isNaN(Number(moduleId));

  const returnTab = tabFromQuery || (isCustomWorkflow ? 'custom' : 'system');

  const isFeatureEnabled = useFeatureFlag('BUILDER_STUDIO');
  const { hasPermission } = usePermission();
  const hasConfigPermission = hasPermission('permission:form-config-manage');

  // Workflow Overview Header Control States
  const [selectedDefinitionId, setSelectedDefinitionId] = useState(null);
  const [hasUserManuallySelected, setHasUserManuallySelected] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreatingNewFlow, setIsCreatingNewFlow] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');

  // Load form configuration for specific module
  const { data: config, isLoading } = useQuery({
    queryKey: ['get_form_config', moduleId, isCustomWorkflow],
    queryFn: async () => {
      if (isCustomWorkflow) {
        return {
          id: 'CUSTOM_WORKFLOW',
          module: 'CUSTOM_WORKFLOW',
          name: 'Custom Workflow',
          isCustom: true,
        };
      }
      return getFormConfig(moduleId);
    },
    enabled: isFeatureEnabled && hasConfigPermission && Boolean(moduleId),
  });

  const targetModule = isCustomWorkflow
    ? 'CUSTOM_WORKFLOW'
    : mapStudioModuleToWorkflowModule(config?.module || moduleId);

  const { data: definitions = [], isLoading: isDefinitionsLoading } =
    useWorkflowDefinitions(targetModule);

  const selectedDef = useMemo(
    () => definitions.find((d) => d.id === selectedDefinitionId),
    [definitions, selectedDefinitionId],
  );

  const titleName = isCustomWorkflow
    ? requestedNameFromQuery ||
      newWorkflowName ||
      selectedDef?.name ||
      (config?.name && config.name !== 'Custom Workflow'
        ? config.name
        : null) ||
      'Custom Workflow'
    : convertSnakeToTitleCase(
        config?.module || moduleId || 'Studio (Workflow)',
      );

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

  // Auto-initialize local draft canvas if create=true parameter is present
  useEffect(() => {
    if (
      isCreateRequested &&
      requestedNameFromQuery &&
      !isCreatingNewFlow &&
      !hasUserManuallySelected
    ) {
      setNewWorkflowName(requestedNameFromQuery);
      setIsCreatingNewFlow(true);
      setIsEditMode(true);
      setSelectedDefinitionId('LOCAL_TEMP_DRAFT');
    }
  }, [
    isCreateRequested,
    requestedNameFromQuery,
    isCreatingNewFlow,
    hasUserManuallySelected,
  ]);

  // Auto-select ACTIVE workflow definition by default on initial load or requested definitionId
  useEffect(() => {
    if (isCreatingNewFlow) {
      setSelectedDefinitionId('LOCAL_TEMP_DRAFT');
      return;
    }

    const requestedDefId = definitionIdFromQuery
      ? Number(definitionIdFromQuery)
      : !Number.isNaN(Number(moduleId))
        ? Number(moduleId)
        : null;

    if (requestedDefId && !hasUserManuallySelected) {
      setSelectedDefinitionId(requestedDefId);
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
    } else if (
      !isDefinitionsLoading &&
      definitions.length === 0 &&
      !hasUserManuallySelected
    ) {
      setIsCreatingNewFlow(true);
      setIsEditMode(true);
      setSelectedDefinitionId('LOCAL_TEMP_DRAFT');
    }
  }, [
    definitions,
    isDefinitionsLoading,
    isCreatingNewFlow,
    hasUserManuallySelected,
    definitionIdFromQuery,
    moduleId,
  ]);

  // Confirm Leave Modal State
  const [isConfirmLeaveModalOpen, setIsConfirmLeaveModalOpen] = useState(false);

  // Back Button Navigation & Unsaved Confirmation Handlers
  const handleBackClick = () => {
    if (isCreatingNewFlow || selectedDefinitionId === 'LOCAL_TEMP_DRAFT') {
      setIsConfirmLeaveModalOpen(true);
    } else {
      router.push(`/dashboard/studio?tab=${returnTab}`);
    }
  };

  const handleConfirmLeave = () => {
    setIsConfirmLeaveModalOpen(false);
    router.push(`/dashboard/studio?tab=${returnTab}`);
  };

  return {
    router,
    moduleId,
    config,
    isLoading,
    titleName,
    targetModule,
    isCustomWorkflow,
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
    newWorkflowName,
    setNewWorkflowName,
    isConfirmLeaveModalOpen,
    setIsConfirmLeaveModalOpen,
    handleBackClick,
    handleCancelNewWorkflow: handleBackClick,
    handleConfirmLeave,
  };
}
