import { template_api } from "@/api/templates_api/template_api";
import { APIinstance } from "@/services";

export function getTemplates() {
  return APIinstance.get(template_api.getTemplates.endpoint);
}

export function getTemplate({ id }) {
  return APIinstance.get(template_api.getTemplate.endpoint + `${id}`);
}

export function uploadTemplate({ data }) {
  return APIinstance.post(template_api.uploadTemplate.endpoint, data);
}

export function updateTemplate({ id, data }) {
  return APIinstance.put(template_api.updateTemplate.endpoint + `${id}`, data);
}

export function deleteTemplate({ id }) {
  return APIinstance.delete(template_api.deleteTemplate.endpoint + `${id}`);
}

export function createFormResponse({ data }) {
  return APIinstance.post(template_api.createFormResponse.endpoint, data);
}

export function updateFormResponse({ id, data }) {
  return APIinstance.put(
    template_api.updateFormResponse.endpoint + `${id}`,
    data
  );
}

