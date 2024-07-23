import { notificationApi } from '@/api/notifications/notificationApi';
import { APIinstance } from '@/services';

export const getNotifications = (id, data) => {
  return APIinstance.post(
    `${notificationApi.getNotifications.endpoint}${id}`,
    data,
  );
};

export const updateNotification = (id) => {
  return APIinstance.put(
    `${notificationApi.updateNotifications.endpoint}${id}`,
  );
};
