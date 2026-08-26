import { workflowRuntimeAPI } from '@/api/workflow-runtime-apis/workflowRuntimeAPI';
import { APIinstance } from '@/services';

export const getActiveWorkflowRuntime = (moduleName) => {
  return APIinstance.get(
    workflowRuntimeAPI.getActiveWorkflow.endpoint(moduleName),
  );
};

export const startWorkflowInstance = ({ module, recordId, context }) => {
  return APIinstance.post(workflowRuntimeAPI.startInstance.endpoint, {
    module,
    recordId,
    context,
  });
};

export const getWorkflowRecordInstance = (moduleName, recordId) => {
  return APIinstance.get(
    workflowRuntimeAPI.getRecordInstance.endpoint(moduleName, recordId),
  );
};

export const getWorkflowInstanceById = (instanceId) => {
  return APIinstance.get(
    workflowRuntimeAPI.getInstanceById.endpoint(instanceId),
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
