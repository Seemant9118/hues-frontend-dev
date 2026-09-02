export const workflowBuilderAPI = {
  getModules: {
    endpoint: '/workflow-builder/modules',
    endpointKey: 'get_workflow_modules',
  },
  getActionCatalog: {
    endpoint: (module) => `/workflow-builder/action-catalog?module=${module}`,
    endpointKey: 'get_workflow_action_catalog',
  },
  createDefinition: {
    endpoint: '/workflow-builder/definitions',
    endpointKey: 'create_workflow_definition',
  },
  getDefinitions: {
    endpoint: (module) =>
      module
        ? `/workflow-builder/definitions?module=${module}`
        : '/workflow-builder/definitions',
    endpointKey: 'get_workflow_definitions',
  },
  getDefinitionById: {
    endpoint: (id) => `/workflow-builder/definitions/${id}`,
    endpointKey: 'get_workflow_definition_by_id',
  },
  saveDraft: {
    endpoint: (id) => `/workflow-builder/definitions/${id}/draft`,
    endpointKey: 'save_workflow_draft',
  },
  validateDraft: {
    endpoint: (id) => `/workflow-builder/definitions/${id}/validate`,
    endpointKey: 'validate_workflow_draft',
  },
  publishDefinition: {
    endpoint: (id) => `/workflow-builder/definitions/${id}/publish`,
    endpointKey: 'publish_workflow_definition',
  },
  getVersions: {
    endpoint: (id) => `/workflow-builder/definitions/${id}/versions`,
    endpointKey: 'get_workflow_versions',
  },
  activateVersion: {
    endpoint: (id, versionId) =>
      `/workflow-builder/definitions/${id}/versions/${versionId}/activate`,
    endpointKey: 'activate_workflow_version',
  },
  archiveDefinition: {
    endpoint: (id) => `/workflow-builder/definitions/${id}/archive`,
    endpointKey: 'archive_workflow_definition',
  },
  unarchiveDefinition: {
    endpoint: (id) => `/workflow-builder/definitions/${id}/unarchive`,
    endpointKey: 'unarchive_workflow_definition',
  },
  getRuleFields: {
    endpoint: (module, definitionId) => {
      let url = `/workflow-builder/rule-fields?module=${module || 'ORDER'}`;
      if (definitionId && definitionId !== 'LOCAL_TEMP_DRAFT') {
        url += `&definitionId=${definitionId}`;
      }
      return url;
    },
    endpointKey: 'get_workflow_rule_fields',
  },
};
