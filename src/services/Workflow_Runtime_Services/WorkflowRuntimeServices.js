import { workflowRuntimeAPI } from '@/api/workflow-runtime-apis/workflowRuntimeAPI';
import { APIinstance } from '@/services';

export const getActiveWorkflowRuntime = (moduleName, definitionId) => {
  return APIinstance.get(
    workflowRuntimeAPI.getActiveWorkflow.endpoint(moduleName, definitionId),
  );
};

export const getRuntimeDefinitions = (
  module = 'CUSTOM_WORKFLOW',
  params = {},
) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });

  return APIinstance.get(
    workflowRuntimeAPI.getRuntimeDefinitions.endpoint(
      module,
      searchParams.toString(),
    ),
  );
};

export const getRuntimeDefinition = (definitionId) => {
  return APIinstance.get(
    workflowRuntimeAPI.getRuntimeDefinition.endpoint(definitionId),
  );
};

export const startWorkflowInstance = ({
  module,
  definitionId,
  recordId,
  context,
}) => {
  const payload = {
    module,
    context: context || {},
  };
  if (definitionId != null) payload.definitionId = definitionId;
  if (recordId != null) payload.recordId = recordId;

  return APIinstance.post(workflowRuntimeAPI.startInstance.endpoint, payload);
};

export const getWorkflowRecordInstance = (moduleName, recordId) => {
  return APIinstance.get(
    workflowRuntimeAPI.getRecordInstance.endpoint(moduleName, recordId),
  );
};

export const getWorkflowInstances = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });

  return APIinstance.get(
    workflowRuntimeAPI.getInstances.endpoint(searchParams.toString()),
  );
};

export const getWorkflowInstanceById = (instanceId) => {
  return APIinstance.get(
    workflowRuntimeAPI.getInstanceById.endpoint(instanceId),
  );
};

export const getWorkflowInstanceData = (instanceId) => {
  return APIinstance.get(
    workflowRuntimeAPI.getInstanceData.endpoint(instanceId),
  );
};

export const submitWorkflowStepAction = ({
  instanceId,
  stepInstanceId,
  payload,
}) => {
  return APIinstance.post(
    workflowRuntimeAPI.submitStepAction.endpoint(instanceId, stepInstanceId),
    payload,
  );
};

export const previewNextWorkflowStep = (payload) => {
  return APIinstance.post(workflowRuntimeAPI.previewNextStep.endpoint, payload);
};

export const previewInstanceNextStep = (instanceId, payload) => {
  return APIinstance.post(
    workflowRuntimeAPI.previewInstanceNextStep.endpoint(instanceId),
    payload,
  );
};

export const retryWorkflowStep = (instanceId) => {
  return APIinstance.post(workflowRuntimeAPI.retryStep.endpoint(instanceId));
};
