import { templateBuilderApi } from '@/api/template-builder/template_builder_api';
import { APIinstance } from '@/services';

export function getTemplates(params) {
  return APIinstance.get(templateBuilderApi.getTemplates.endpoint, { params });
}

export function deleteTemplate(id) {
  return APIinstance.delete(
    `${templateBuilderApi.deleteTemplate.endpoint}${id}`,
  );
}

export function getVariables() {
  return APIinstance.get(templateBuilderApi.getVariables.endpoint);
}

export function createTemplate(data) {
  return APIinstance.post(templateBuilderApi.createTemplate.endpoint, data);
}

export function getTemplateDetails(id) {
  return APIinstance.get(`${templateBuilderApi.getTemplate.endpoint}${id}`);
}

export function updateTemplate(id, data) {
  return APIinstance.put(
    `${templateBuilderApi.updateTemplate.endpoint}${id}`,
    data,
  );
}

export function publishTemplate(id) {
  return APIinstance.patch(
    `${templateBuilderApi.publishTemplate.endpoint}${id}/publish`,
  );
}

export function unpublishTemplate(id) {
  return APIinstance.patch(
    `${templateBuilderApi.publishTemplate.endpoint}${id}/unpublish`,
  );
}

export function getUserAgreements(params) {
  return APIinstance.get(templateBuilderApi.getUserAgreements.endpoint, {
    params,
  });
}
