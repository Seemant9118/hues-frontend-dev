export const settingsAPI = {
  createSettings: {
    endpoint: `/enterprise-settings/upsert`,
    endpointKey: 'create_settings',
  },
  getSettingByKey: {
    endpoint: `/enterprise-settings/`,
    endpointKey: 'get_settings',
  },
  getSettingsById: {
    endpoint: `/enterprise-settings/get`,
    endpointKey: 'get_setting_by_Id',
  },
  getTemplateForSettings: {
    endpoint: `/template/custom/get`,
    endpointKey: 'get_template',
  },
};
