import { templateApi } from '@/api/templates_api/template_api';
import { APIinstance } from '@/services';

export function getTemplates(id) {
  return APIinstance.get(`${templateApi.getTemplates.endpoint}${id}`);
}

export function getTemplate(id) {
  return APIinstance.get(`${templateApi.getTemplate.endpoint}${id}`);
}

export function uploadTemplate(data, id) {
  return APIinstance.post(`${templateApi.uploadTemplate.endpoint}${id}`, data);
}

export function updateTemplate(data, id) {
  return APIinstance.put(`${templateApi.updateTemplate.endpoint}${id}`, data);
}

export function deleteTemplate(id) {
  return APIinstance.delete(`${templateApi.deleteTemplate.endpoint}${id}`);
}

export function createFormResponse(data) {
  return APIinstance.post(templateApi.createFormResponse.endpoint, data);
}

export function updateFormResponse(data, id) {
  return APIinstance.put(
    `${templateApi.updateFormResponse.endpoint}${id}`,
    data,
  );
}
export function getDocument(urlString) {
  return APIinstance.post(templateApi.getS3Document.endpoint, {
    urlString,
  });
}
