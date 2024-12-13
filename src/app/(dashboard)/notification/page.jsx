'use client';

import { notificationApi } from '@/api/notifications/notificationApi';
import NotificationFilterPopUp from '@/components/Popovers/NotificationFilterPopUp';
import { DataTable } from '@/components/table/data-table';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import { getNotifications } from '@/services/Notification_Services/NotificationServices';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { NotificationColumns } from './NotificationsColumns';

const Notification = () => {
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
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

  const onRowClick = (row) => {
    const isCurrNotificationIsRead = row?.isRead;

    if (isCurrNotificationIsRead) {
      router.push(row?.deepLink);
    } else {
      // updateTracker mutation api call
      router.push(row?.deepLink);
    }
  };

  return (
    <>
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <>
          <SubHeader name={'Notifications'}></SubHeader>
          <RestrictedComponent />
        </>
      )}
      {enterpriseId && isEnterpriseOnboardingComplete && (
        <Wrapper>
          <SubHeader
            name="Notifications"
            className="z-10 flex justify-between bg-white"
          >
            <NotificationFilterPopUp
              setFilteredNotification={setFilteredNotification}
            />
          </SubHeader>

          <DataTable
            id="notification table"
            onRowClick={onRowClick}
            columns={NotificationColumns}
            data={notifications}
          />
        </Wrapper>
      )}
    </>
  );
};

export default Notification;
