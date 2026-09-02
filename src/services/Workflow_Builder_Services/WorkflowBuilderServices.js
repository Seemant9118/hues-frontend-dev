import { workflowBuilderAPI } from '@/api/workflow-builder-apis/workflowBuilderAPI';
import { APIinstance } from '@/services';

export const getWorkflowModules = () => {
  return APIinstance.get(workflowBuilderAPI.getModules.endpoint);
};

export const getWorkflowActionCatalog = (moduleName) => {
  return APIinstance.get(
    workflowBuilderAPI.getActionCatalog.endpoint(moduleName),
  );
};

export const createWorkflowDefinition = ({ data }) => {
  return APIinstance.post(workflowBuilderAPI.createDefinition.endpoint, data);
};

export const getWorkflowDefinitions = (moduleName) => {
  return APIinstance.get(
    workflowBuilderAPI.getDefinitions.endpoint(moduleName),
  );
};

export const getWorkflowDefinitionById = (id) => {
  return APIinstance.get(workflowBuilderAPI.getDefinitionById.endpoint(id));
};

export const saveWorkflowDraft = ({ id, graph }) => {
  return APIinstance.put(workflowBuilderAPI.saveDraft.endpoint(id), {
    graph,
  });
};

export const validateWorkflowDraft = ({ id }) => {
  return APIinstance.post(workflowBuilderAPI.validateDraft.endpoint(id));
};

export const publishWorkflowDefinition = ({ id, activate = true }) => {
  return APIinstance.post(workflowBuilderAPI.publishDefinition.endpoint(id), {
    activate,
  });
};

export const getWorkflowVersions = (id) => {
  return APIinstance.get(workflowBuilderAPI.getVersions.endpoint(id));
};

export const activateWorkflowVersion = ({ id, versionId }) => {
  return APIinstance.post(
    workflowBuilderAPI.activateVersion.endpoint(id, versionId),
  );
};

export const archiveWorkflowDefinition = ({ id }) => {
  return APIinstance.post(workflowBuilderAPI.archiveDefinition.endpoint(id));
};

export const unarchiveWorkflowDefinition = ({ id }) => {
  return APIinstance.post(workflowBuilderAPI.unarchiveDefinition.endpoint(id));
};

export const getWorkflowRuleFields = (moduleName, definitionId) => {
  return APIinstance.get(
    workflowBuilderAPI.getRuleFields.endpoint(moduleName, definitionId),
  );
};
