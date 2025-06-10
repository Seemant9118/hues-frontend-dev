export const AdminAPIs = {
  getAdminData: {
    endpoint: `/admin-panel/dashboard/get`,
    endpointKey: 'get_admin_data',
  },

  getEnterpriseData: {
    endpoint: `/admin-panel/dashboard/enterprise-data`,
    endpointKey: 'get_enterprise_data',
  },

  getOnboardingData: {
    endpoint: `/admin-panel/dashboard/enterprise-onboarding-stats`,
    endpointKey: 'get_onboarding_data',
  },

  addUser: {
    endpoint: `/admin-panel/dashboard/enterprises/users/create`,
    endpointKey: 'add_user',
  },

  updateUser: {
    endpoint: `/admin-panel/dashboard/enterprises/users/update`,
    endpointKey: 'edit_users',
  },

  addEnterprise: {
    endpoint: `/admin-panel/dashboard/enterprises/create`,
    endpointKey: 'add_enterprise',
  },

  getEnterpriseDetails: {
    endpoint: `/admin-panel/dashboard/enterprises/`,
    endpointKey: 'get_enterprise_details',
  },

  getJsonResponseData: {
    endpoint: `/admin-panel/dashboard/verification-data/`,
    endpointKey: 'get_json_res_data',
  },

  updateEnterpriseDetails: {
    endpoint: `/admin-panel/dashboard/enterprises/update-details/`,
    endpointKey: 'update_enterprise_details',
  },

  updateAddresses: {
    endpoint: `/admin-panel/dashboard/enterprises/update-address/`,
    endpointKey: 'update_addresses',
  },

  updateGST: {
    endpoint: `/admin-panel/dashboard/enterprises/verify-gst/`,
    endpointKey: 'updateGst',
  },

  updateCIN: {
    endpoint: `/admin-panel/dashboard/enterprises/verify-cin-llp/`,
    endpointKey: 'updateCIN',
  },

  updateUdyam: {
    endpoint: `/admin-panel/dashboard/enterprises/verify-udyam/`,
    endpointKey: 'updateUdyam',
  },

  updatePAN: {
    endpoint: `/admin-panel/dashboard/enterprises/verify-pan/`,
    endpointKey: 'updatePAN',
  },

  addBankAccountOfEnterprise: {
    endpoint: `/admin-panel/dashboard/enterprises/add-bank-account/`,
    endpointKey: 'add_bank_account_enterprise',
  },
};
