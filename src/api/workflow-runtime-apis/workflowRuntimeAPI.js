export const workflowRuntimeAPI = {
  getActiveWorkflow: {
    endpoint: (module) => `/workflow-runtime/active?module=${module}`,
    endpointKey: 'get_active_workflow_runtime',
  },
  startInstance: {
    endpoint: '/workflow-runtime/instances/start',
    endpointKey: 'start_workflow_instance',
  },
  getRecordInstance: {
    endpoint: (module, recordId) =>
      `/workflow-runtime/records/${module}/${recordId}`,
    endpointKey: 'get_workflow_record_instance',
  },
  getInstanceById: {
    endpoint: (instanceId) => `/workflow-runtime/instances/${instanceId}`,
    endpointKey: 'get_workflow_instance_by_id',
  },
  submitStepAction: {
    endpoint: (instanceId, stepInstanceId) =>
      `/workflow-runtime/instances/${instanceId}/steps/${stepInstanceId}/actions`,
    endpointKey: 'submit_workflow_step_action',
  },
  previewNextStep: {
    endpoint: '/workflow-runtime/next-step-preview',
    endpointKey: 'preview_next_workflow_step',
  },
};
