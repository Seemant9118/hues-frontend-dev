export const rolesApi = {
  // 1. get all roles
  getAllRoles: {
    endpoint: `/iam/accessmanagement/role/list`,
    endpointKey: 'get_all_roles',
  },

  // 2. get all permissions
  getAllPermissions: {
    endpoint: `/iam/accessmanagement/userrole/get/permissions`,
    endpointKey: 'get_all_permissions',
  },
};
