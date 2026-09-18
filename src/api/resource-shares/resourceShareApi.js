export const resourceShareApi = {
  // Sender endpoints
  createShare: {
    endpoint: '/shares',
    endpointKey: 'create_share',
  },
  getShareDetails: {
    endpoint: '/shares',
    endpointKey: 'get_share_details',
  },
  listShares: {
    endpoint: '/shares',
    endpointKey: 'list_shares',
  },
  getShareResponses: {
    endpoint: '/shares',
    endpointKey: 'get_share_responses',
  },
  revokeShare: {
    endpoint: '/shares',
    endpointKey: 'revoke_share',
  },

  // Recipient endpoints
  getSharedResource: {
    endpoint: '/shared-resources',
    endpointKey: 'get_shared_resource',
  },
  getSharedResourceDetails: {
    endpoint: '/shared-resources',
    endpointKey: 'get_shared_resource_details',
  },
  submitSharedForm: {
    endpoint: '/shared-resources',
    endpointKey: 'submit_shared_form',
  },
  signSharedAgreement: {
    endpoint: '/shared-resources',
    endpointKey: 'sign_shared_agreement',
  },
  validatePrivateIdentity: {
    endpoint: '/shared-resources',
    endpointKey: 'validate_private_identity',
  },
  requestPrivateOtp: {
    endpoint: '/shared-resources',
    endpointKey: 'request_private_otp',
  },
  verifyPrivateOtp: {
    endpoint: '/shared-resources',
    endpointKey: 'verify_private_otp',
  },
};
