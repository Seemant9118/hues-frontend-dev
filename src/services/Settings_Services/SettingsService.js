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

export const getInvoicePreviewConfig = (data) => {
  return APIinstance.post(settingsAPI.invoicePreviewConfig.endpoint, data);
};

export const addUpdateAddress = ({ data }) => {
  return APIinstance.post(`${settingsAPI.addUpdateAddress.endpoint}`, data);
};

export const uploadLogo = ({ data }) => {
  return APIinstance.post(`${settingsAPI.uploadLogo.endpoint}`, data);
};

export const updateEnterpriseData = ({ data }) => {
  return APIinstance.post(settingsAPI.updateEnterpriseData.endpoint, data);
};

export const getGstSettings = ({ id }) => {
  return APIinstance.get(`${settingsAPI.getGstSettings.endpoint}${id}`);
};

export const updateGst = ({ id, data }) => {
  return APIinstance.put(`${settingsAPI.updateGst.endpoint}${id}`, data);
};

export const addWareHouse = ({ data }) => {
  return APIinstance.post(settingsAPI.addWareHouse.endpoint, data);
};
