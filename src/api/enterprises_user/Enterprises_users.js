export const enterprise_user = {
  // 1. post enterprise user data
  createEnterpriseUser: {
    endpoint: `/enterprise/user/create`,
    endpointKey: "create_enterprise_user",
  },
  // 2. get all enterprise users as a list
  getEnterpriseUsers: {
    endpoint: `/enterprise/user/getenterpriseusers`,
    endpointKey: "get_enterprise_users",
  },
  // 3. get specific enterprise user through id
  getEnterpriseUser: {
    endpoint: `/enterprise/user/get/`,
    endpointKey: "get_enterprise_user",
  },
  // 4. edit specific enterprise user through id
  updateEnterpriseUser: {
    endpoint: `/enterprise/user/update/`,
    endpointKey: "update_enterprise_user",
  },
  // 5. delete specific enterprise user through id
  deleteEnterpriseUser: {
    endpoint: `/enterprise/user/delete/`,
    endpointKey: "delete_enterprise_user",
  },

  // search enterprise
  searchEnterprise: {
    endpoint: `/enterprise/search`,
    endpointKey: "search_enterprise",
  },
};
