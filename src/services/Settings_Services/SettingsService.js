import { settingsAPI } from '@/api/settings/settingsApi';
import { APIinstance } from '@/services';

export const createSettings = (data) => {
  return APIinstance.post(settingsAPI.createSettings.endpoint, data);
};

export const getSettingsByKey = (key) => {
  return APIinstance.get(`${settingsAPI.getSettingByKey.endpoint}${key}`);
};

export const getSettingsById = () => {
  return APIinstance.get(settingsAPI.getSettingsById.endpoint);
};

export const getTemplateForSettings = () => {
  return APIinstance.get(settingsAPI.getTemplateForSettings.endpoint);
};
