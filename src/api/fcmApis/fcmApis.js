export const fcmAPIs = {
  // 1. register FCM token
  registerFcmToken: {
    endpoint: `/iam/user/fcm-token/register`,
    endpointKey: 'register_fcm_token',
  },
  // 2. deregister FCM token
  deregisterFcmToken: {
    endpoint: `/iam/user/fcm-token/deregister`,
    endpointKey: 'deregister_fcm_token',
  },
};
