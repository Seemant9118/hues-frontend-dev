export const workflowRuntimeAPI = {
  getActiveWorkflow: {
    endpoint: (module, definitionId) =>
      definitionId
        ? `/workflow-runtime/active?module=${module}&definitionId=${definitionId}`
        : `/workflow-runtime/active?module=${module}`,
    endpointKey: 'get_active_workflow_runtime',
  },
  getRuntimeDefinitions: {
    endpoint: (module = 'CUSTOM_WORKFLOW', queryString = '') =>
      queryString
        ? `/workflow-runtime/definitions?module=${module}&${queryString}`
        : `/workflow-runtime/definitions?module=${module}`,
    endpointKey: 'get_workflow_runtime_definitions',
  },
  getRuntimeDefinition: {
    endpoint: (definitionId) => `/workflow-runtime/definitions/${definitionId}`,
    endpointKey: 'get_workflow_runtime_definition_detail',
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
  getInstances: {
    endpoint: (queryString = '') =>
      `/workflow-runtime/instances${queryString ? `?${queryString}` : ''}`,
    endpointKey: 'get_workflow_instances',
  },
  getInstanceById: {
    endpoint: (instanceId) => `/workflow-runtime/instances/${instanceId}`,
    endpointKey: 'get_workflow_instance_by_id',
  },
  getInstanceData: {
    endpoint: (instanceId) => `/workflow-runtime/instances/${instanceId}/data`,
    endpointKey: 'get_workflow_instance_data',
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
  previewInstanceNextStep: {
    endpoint: (instanceId) =>
      `/workflow-runtime/instances/${instanceId}/next-step-preview`,
    endpointKey: 'preview_instance_next_workflow_step',
  },
  retryStep: {
    endpoint: (instanceId) => `/workflow-runtime/instances/${instanceId}/retry`,
    endpointKey: 'retry_workflow_step',
  },
};
