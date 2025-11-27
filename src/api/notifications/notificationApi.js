export const notificationApi = {
  // 1. get notifications
  getNotifications: {
    endpoint: `/notification/`,
    endpointKey: 'get_notifications',
  },
  // 2. update notifications
  updateNotifications: {
    endpoint: `/notification/update/`,
    endpointKey: 'update_notification',
  },
  // 3. register FCM token
  registerFcmToken: {
    endpoint: `/iam/user/fcm-token/register`,
    endpointKey: 'register_fcm_token',
  },
};
