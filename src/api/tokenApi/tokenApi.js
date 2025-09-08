export const tokenApi = {
  // 18. refreshToken
  refreshToken: {
    endpoint: `/iam/auth/refreshtoken`,
    endpointKey: 'refresh_token',
  },

  adminRefreshToken: {
    endpoint: `/admin-panel/admin/refreshtoken`,
    endpointKey: 'admin_refresh_token',
  },
};
