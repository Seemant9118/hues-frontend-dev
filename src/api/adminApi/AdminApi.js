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

  getEnterpriseDetails: {
    endpoint: `/admin-panel/dashboard/enterprises/`,
    endpointKey: 'get_enterprise_details',
  },

  getJsonResponseData: {
    endpoint: `/admin-panel/dashboard/verification-data/`,
    endpointKey: 'get_json_res_data',
  },
};
