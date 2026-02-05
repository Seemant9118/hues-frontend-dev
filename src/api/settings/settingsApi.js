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
  invoicePreviewConfig: {
    endpoint: `/order/invoice/preview-config`,
    endpointKey: 'invoice_preview_condfig',
  },
  // update address of enterprise
  addUpdateAddress: {
    endpoint: `/enterprise/address`,
    endpointKey: 'add_update_address',
  },
  // upload logo
  uploadLogo: {
    endpoint: `/enterprise/upload-logo`,
    endpointKey: 'upload_logo',
  },
  // update enterprise data
  updateEnterpriseData: {
    endpoint: `/enterprise/update/metadata`,
    endpointKey: 'update_enterprise_data',
  },
  getGstSettings: {
    endpoint: `/enterprise-settings/gstsetting/`,
    endpointKey: 'get_gst_Settings',
  },
  updateGst: {
    endpoint: `/enterprise/update/gst/`,
    endpointKey: 'update_gst',
  },
  addWareHouse: {
    endpoint: `/warehouse/create`,
    endpointKey: 'add_warehouse',
  },
};
