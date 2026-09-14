import { workflowRuntimeAPI } from '@/api/workflow-runtime-apis/workflowRuntimeAPI';
import {
  getActiveWorkflowRuntime,
  getRuntimeDefinition,
  getRuntimeDefinitions,
  getWorkflowInstanceById,
  getWorkflowInstanceData,
  getWorkflowInstances,
  getWorkflowRecordInstance,
  previewNextWorkflowStep,
  retryWorkflowStep,
  startWorkflowInstance,
  submitWorkflowStepAction,
} from '@/services/Workflow_Runtime_Services/WorkflowRuntimeServices';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

export function useActiveWorkflowRuntime(moduleName, options = {}) {
  const definitionId = options?.definitionId;
  return useQuery({
    queryKey: [
      workflowRuntimeAPI.getActiveWorkflow.endpointKey,
      moduleName,
      definitionId || 'default',
    ],
    queryFn: async () => {
      if (definitionId) {
        try {
          const res = await getRuntimeDefinition(definitionId);
          if (res?.data?.data) return res;
        } catch {
          // Fall back to active endpoint with definitionId query param
          return getActiveWorkflowRuntime(moduleName, definitionId);
        }
      }
      return getActiveWorkflowRuntime(moduleName, definitionId);
    },
    enabled: Boolean(moduleName) && (options.enabled ?? true),
    select: (res) => res.data?.data || null,
  });
}

export function useCustomWorkflowDefinitions(
  module = 'CUSTOM_WORKFLOW',
  options = {},
) {
  return useQuery({
    queryKey: [workflowRuntimeAPI.getRuntimeDefinitions.endpointKey, module],
    queryFn: () => getRuntimeDefinitions(module),
    enabled: options.enabled ?? true,
    select: (res) => res.data?.data || [],
  });
}

export function useCustomWorkflowDefinitionsInfinite(
  module = 'CUSTOM_WORKFLOW',
  options = {},
) {
  const limit = options.limit || 10;

  return useInfiniteQuery({
    queryKey: [
      workflowRuntimeAPI.getRuntimeDefinitions.endpointKey,
      module,
      'infinite',
      limit,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getRuntimeDefinitions(module, {
        page: pageParam,
        limit,
      });

      const raw = res?.data?.data;
      if (raw && !Array.isArray(raw) && Array.isArray(raw.data)) {
        return res;
      }
      if (Array.isArray(raw)) {
        const total = raw.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const start = (pageParam - 1) * limit;
        const pagedData = raw.slice(start, start + limit);
        return {
          ...res,
          data: {
            ...res?.data,
            data: {
              data: pagedData,
              totalPages,
              currentPage: pageParam,
              total,
            },
          },
        };
      }
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const responseData = lastPage?.data?.data;
      const totalPages = Number(responseData?.totalPages ?? 1);
      const currentPage = Number(responseData?.currentPage ?? allPages.length);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: options.enabled ?? true,
    refetchOnWindowFocus: false,
  });
}

export function useCustomWorkflowRuntimeDefinition(definitionId, options = {}) {
  return useQuery({
    queryKey: [
      workflowRuntimeAPI.getRuntimeDefinition.endpointKey,
      definitionId,
    ],
    queryFn: async () => {
      try {
        const res = await getRuntimeDefinition(definitionId);
        if (res?.data?.data) return res;
      } catch {
        return getActiveWorkflowRuntime('CUSTOM_WORKFLOW', definitionId);
      }
      return getRuntimeDefinition(definitionId);
    },
    enabled: Boolean(definitionId) && (options.enabled ?? true),
    select: (res) => res.data?.data || null,
  });
}

export function useWorkflowInstancesList(
  {
    module = 'CUSTOM_WORKFLOW',
    definitionId,
    status,
    page = 1,
    limit = 20,
  } = {},
  options = {},
) {
  return useQuery({
    queryKey: [
      workflowRuntimeAPI.getInstances.endpointKey,
      module,
      definitionId,
      status,
      page,
      limit,
    ],
    queryFn: () =>
      getWorkflowInstances({
        module,
        definitionId,
        status,
        page,
        limit,
      }),
    enabled: Boolean(definitionId) && (options.enabled ?? true),
    select: (res) =>
      res.data?.data || { items: [], total: 0, page: 1, limit: 20 },
  });
}

export function useWorkflowInstancesInfinite(
  { module = 'CUSTOM_WORKFLOW', definitionId, status, limit = 20 } = {},
  options = {},
) {
  return useInfiniteQuery({
    queryKey: [
      workflowRuntimeAPI.getInstances.endpointKey,
      'infinite',
      module,
      definitionId || 'all',
      status || 'all',
      limit,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getWorkflowInstances({
        module,
        definitionId: definitionId || undefined,
        status: status && status !== 'ALL' ? status : undefined,
        page: pageParam,
        limit,
      });
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const data = lastPage?.data?.data;
      const total = Number(data?.total ?? 0);
      const pageLimit = Number(data?.limit ?? limit);
      const totalPages = Math.ceil(total / pageLimit) || 1;
      const currentPage = Number(data?.page ?? allPages.length);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: options.enabled ?? true,
    refetchOnWindowFocus: false,
  });
}

export function useWorkflowInstanceDetail(instanceId, options = {}) {
  return useQuery({
    queryKey: [workflowRuntimeAPI.getInstanceById.endpointKey, instanceId],
    queryFn: () => getWorkflowInstanceById(instanceId),
    enabled: Boolean(instanceId) && (options.enabled ?? true),
    select: (res) => res.data?.data || null,
  });
}

export function useWorkflowInstanceData(instanceId, options = {}) {
  return useQuery({
    queryKey: [workflowRuntimeAPI.getInstanceData.endpointKey, instanceId],
    queryFn: () => getWorkflowInstanceData(instanceId),
    enabled: Boolean(instanceId) && (options.enabled ?? true),
    select: (res) => res.data?.data || null,
  });
}

export function useWorkflowRecordInstance(moduleName, recordId, options = {}) {
  return useQuery({
    queryKey: [
      workflowRuntimeAPI.getRecordInstance.endpointKey,
      moduleName,
      recordId,
    ],
    queryFn: () => getWorkflowRecordInstance(moduleName, recordId),
    enabled:
      Boolean(moduleName) && Boolean(recordId) && (options.enabled ?? true),
    select: (res) => res.data?.data || null,
  });
}

export function useWorkflowRuntimeMutations({
  onStarted,
  onActionSuccess,
} = {}) {
  const queryClient = useQueryClient();

  const startInstanceMutation = useMutation({
    mutationFn: startWorkflowInstance,
    onSuccess: (res) => {
      toast.success(
        res?.data?.message || 'Workflow instance started successfully',
      );
      queryClient.invalidateQueries({
        queryKey: [workflowRuntimeAPI.getInstances.endpointKey],
      });
      onStarted?.(res?.data?.data);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || 'Failed to start workflow instance',
      );
    },
  });

  const submitActionMutation = useMutation({
    mutationFn: submitWorkflowStepAction,
    onSuccess: (res, variables) => {
      toast.success(
        res?.data?.message || 'Workflow action submitted successfully',
      );
      if (variables.instanceId) {
        queryClient.invalidateQueries({
          queryKey: [
            workflowRuntimeAPI.getInstanceById.endpointKey,
            variables.instanceId,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            workflowRuntimeAPI.getInstanceData.endpointKey,
            variables.instanceId,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [workflowRuntimeAPI.getInstances.endpointKey],
        });
      }
      onActionSuccess?.(res?.data?.data);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || 'Failed to submit workflow action',
      );
    },
  });

  const retryMutation = useMutation({
    mutationFn: retryWorkflowStep,
    onSuccess: (res, instanceId) => {
      toast.success(res?.data?.message || 'Step retry initiated successfully');
      if (instanceId) {
        queryClient.invalidateQueries({
          queryKey: [
            workflowRuntimeAPI.getInstanceById.endpointKey,
            instanceId,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [workflowRuntimeAPI.getInstances.endpointKey],
        });
      }
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || 'Failed to retry workflow step',
      );
    },
  });

  return {
    startInstance: startInstanceMutation.mutateAsync,
    isStarting: startInstanceMutation.isPending,
    submitAction: submitActionMutation.mutateAsync,
    isSubmittingAction: submitActionMutation.isPending,
    retryStep: retryMutation.mutateAsync,
    isRetrying: retryMutation.isPending,
  };
}

export function useNextStepPreview() {
  return useMutation({
    mutationFn: previewNextWorkflowStep,
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error('Next step preview evaluation failed:', err);
    },
  });
}
