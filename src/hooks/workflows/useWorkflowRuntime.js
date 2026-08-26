import { workflowRuntimeAPI } from '@/api/workflow-runtime-apis/workflowRuntimeAPI';
import {
  getActiveWorkflowRuntime,
  getWorkflowRecordInstance,
  startWorkflowInstance,
  submitWorkflowStepAction,
} from '@/services/Workflow_Runtime_Services/WorkflowRuntimeServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useActiveWorkflowRuntime(moduleName, options = {}) {
  return useQuery({
    queryKey: [workflowRuntimeAPI.getActiveWorkflow.endpointKey, moduleName],
    queryFn: () => getActiveWorkflowRuntime(moduleName),
    enabled: Boolean(moduleName) && (options.enabled ?? true),
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
      }
      onActionSuccess?.(res?.data?.data);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || 'Failed to submit workflow action',
      );
    },
  });

  return {
    startInstance: startInstanceMutation.mutateAsync,
    isStarting: startInstanceMutation.isPending,
    submitAction: submitActionMutation.mutateAsync,
    isSubmittingAction: submitActionMutation.isPending,
  };
}
