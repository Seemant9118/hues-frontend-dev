import { workflowBuilderAPI } from '@/api/workflow-builder-apis/workflowBuilderAPI';
import {
  activateWorkflowVersion,
  archiveWorkflowDefinition,
  unarchiveWorkflowDefinition,
  createWorkflowDefinition,
  getWorkflowActionCatalog,
  getWorkflowDefinitionById,
  getWorkflowDefinitions,
  getWorkflowModules,
  getWorkflowVersions,
  publishWorkflowDefinition,
  saveWorkflowDraft,
  validateWorkflowDraft,
} from '@/services/Workflow_Builder_Services/WorkflowBuilderServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Custom Hook: Fetch Supported Modules
 */
export function useWorkflowModules() {
  return useQuery({
    queryKey: [workflowBuilderAPI.getModules.endpointKey],
    queryFn: getWorkflowModules,
    select: (res) => res.data?.data?.modules || [],
  });
}

/**
 * Custom Hook: Fetch Action Catalog for selected module
 */
export function useWorkflowActionCatalog(selectedModule) {
  return useQuery({
    queryKey: [workflowBuilderAPI.getActionCatalog.endpointKey, selectedModule],
    queryFn: () => getWorkflowActionCatalog(selectedModule),
    enabled: Boolean(selectedModule),
    select: (res) => res.data?.data || null,
  });
}

/**
 * Custom Hook: Fetch Definitions list by module
 */
export function useWorkflowDefinitions(selectedModule) {
  return useQuery({
    queryKey: [workflowBuilderAPI.getDefinitions.endpointKey, selectedModule],
    queryFn: () => getWorkflowDefinitions(selectedModule),
    select: (res) => res.data?.data || [],
  });
}

/**
 * Custom Hook: Fetch Single Definition Detail by ID
 */
export function useWorkflowDefinitionDetail(definitionId) {
  return useQuery({
    queryKey: [workflowBuilderAPI.getDefinitionById.endpointKey, definitionId],
    queryFn: () => getWorkflowDefinitionById(definitionId),
    enabled: Boolean(definitionId),
    select: (res) => res.data?.data || null,
  });
}

/**
 * Custom Hook: Fetch Versions for Definition
 */
export function useWorkflowVersionsList(definitionId) {
  return useQuery({
    queryKey: [workflowBuilderAPI.getVersions.endpointKey, definitionId],
    queryFn: () => getWorkflowVersions(definitionId),
    enabled: Boolean(definitionId),
    select: (res) => res.data?.data || [],
  });
}

/**
 * Custom Hook: Workflow Definition & Draft Mutations
 */
export function useWorkflowMutations({
  onDraftSaved,
  onPublished,
  onActivated,
  onArchived,
} = {}) {
  const queryClient = useQueryClient();

  const invalidateDefinitions = () => {
    queryClient.invalidateQueries({
      queryKey: [workflowBuilderAPI.getDefinitions.endpointKey],
    });
  };

  const createDefinitionMutation = useMutation({
    mutationFn: createWorkflowDefinition,
    onSuccess: (res) => {
      toast.success(
        res?.data?.message || 'Workflow definition created successfully',
      );
      invalidateDefinitions();
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || 'Failed to create workflow definition',
      );
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: ({ id, graph }) => saveWorkflowDraft({ id, graph }),
    onSuccess: (res, variables) => {
      const data = res?.data?.data;
      if (data?.valid === false) {
        toast.warning('Draft saved with validation warnings');
      } else {
        toast.success('Workflow draft saved successfully');
      }
      queryClient.invalidateQueries({
        queryKey: [
          workflowBuilderAPI.getDefinitionById.endpointKey,
          variables.id,
        ],
      });
      onDraftSaved?.(data);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to save draft');
    },
  });

  const validateDraftMutation = useMutation({
    mutationFn: ({ id }) => validateWorkflowDraft({ id }),
    onSuccess: (res) => {
      const data = res?.data?.data;
      if (data?.valid) {
        toast.success('Workflow graph is valid!');
      } else {
        toast.error('Workflow graph has validation errors');
      }
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Validation failed');
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, activate = true }) =>
      publishWorkflowDefinition({ id, activate }),
    onSuccess: (res, variables) => {
      toast.success(res?.data?.message || 'Workflow published successfully');
      queryClient.invalidateQueries({
        queryKey: [
          workflowBuilderAPI.getDefinitionById.endpointKey,
          variables.id,
        ],
      });
      invalidateDefinitions();
      onPublished?.(res?.data?.data);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to publish workflow',
      );
    },
  });

  const activateVersionMutation = useMutation({
    mutationFn: ({ id, versionId }) =>
      activateWorkflowVersion({ id, versionId }),
    onSuccess: (res, variables) => {
      toast.success(res?.data?.message || 'Version activated successfully');
      queryClient.invalidateQueries({
        queryKey: [
          workflowBuilderAPI.getDefinitionById.endpointKey,
          variables.id,
        ],
      });
      invalidateDefinitions();
      onActivated?.(res?.data?.data);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to activate version');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: ({ id }) => archiveWorkflowDefinition({ id }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || 'Workflow archived');
      invalidateDefinitions();
      onArchived?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to archive workflow');
    },
  });

  const unarchiveMutation = useMutation({
    mutationFn: ({ id }) => unarchiveWorkflowDefinition({ id }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || 'Workflow unarchived successfully');
      invalidateDefinitions();
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || 'Failed to unarchive workflow',
      );
    },
  });

  return {
    createDefinition: createDefinitionMutation.mutateAsync,
    isCreating: createDefinitionMutation.isPending,
    saveDraft: saveDraftMutation.mutateAsync,
    isSavingDraft: saveDraftMutation.isPending,
    validateDraft: validateDraftMutation.mutateAsync,
    isValidating: validateDraftMutation.isPending,
    publishDefinition: publishMutation.mutateAsync,
    isPublishing: publishMutation.isPending,
    activateVersion: activateVersionMutation.mutateAsync,
    isActivating: activateVersionMutation.isPending,
    archiveDefinition: archiveMutation.mutateAsync,
    isArchiving: archiveMutation.isPending,
    unarchiveDefinition: unarchiveMutation.mutateAsync,
    isUnarchiving: unarchiveMutation.isPending,
  };
}
