export const Roles = {
  ADMIN: 'ADMIN',
  ASSOCIATE: 'ASSOCIATE',
  DIRECTOR: 'DIRECTOR',
};

export const RBAC_CONFIG = {
  adminReports: {
    allowedRoles: [Roles.ADMIN],
    actions: {
      fetchedAdminData: [Roles.ADMIN],
    },
  },
  // need to established the configuration of platform according to roles
};
