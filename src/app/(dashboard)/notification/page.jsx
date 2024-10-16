'use client';

import { notificationApi } from '@/api/notifications/notificationApi';
import NotificationFilterPopUp from '@/components/Popovers/NotificationFilterPopUp';
import { InfiniteDataTable } from '@/components/table/infinite-data-table';
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import { getNotifications } from '@/services/Notification_Services/NotificationServices';
import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { NotificationColumns } from './NotificationsColumns';

const Notification = () => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const [filteredNotification, setFilteredNotification] = useState({}); // filtered data for filteration notification
  const [notifications, setNotifications] = useState([]); // response data set to this state

  const getNotificationsMutations = useMutation({
    mutationKey: notificationApi.getNotifications.endpointKey,
    mutationFn: (data) => getNotifications(enterpriseId, data),
    onSuccess: (data) => {
      setNotifications(data.data.data);
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  useEffect(() => {
    if (enterpriseId) {
      getNotificationsMutations.mutate(filteredNotification);
    }
  }, [enterpriseId, filteredNotification]);

  return (
    <Wrapper>
      <SubHeader
        name="Notifications"
        className="z-10 flex justify-between bg-white"
      >
        <NotificationFilterPopUp
          setFilteredNotification={setFilteredNotification}
        />
      </SubHeader>
      <InfiniteDataTable
        id="notification table"
        columns={NotificationColumns}
        data={notifications}
      />
    </Wrapper>
  );
};

export default Notification;
