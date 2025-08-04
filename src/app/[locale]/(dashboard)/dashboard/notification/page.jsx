'use client';

import { notificationApi } from '@/api/notifications/notificationApi';
import AlertBox from '@/components/Modals/AlertBox';
import NotificationFilterPopUp from '@/components/Popovers/NotificationFilterPopUp';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { useNotificationsCount } from '@/context/CountNotificationsContext';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { LocalStorageService } from '@/lib/utils';
import {
  getNotifications,
  updateNotification,
} from '@/services/Notification_Services/NotificationServices';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { InfiniteNotificationTable } from './InfiniteNotificationTable';
import { useNotificationColumns } from './useNotificationsColumns';

// macros
const PAGE_LIMIT = 10;

const Notification = () => {
  const { totalUnreadNotifications, setTotalUnreadNotifications } =
    useNotificationsCount();
  useMetaData(
    `Hues! - Notifications (${totalUnreadNotifications})`,
    'HUES NOTIFICATIONS',
  ); // dynamic title

  const translations = useTranslations('notification');

  const queryClient = useQueryClient();
  const router = useRouter();
  const { hasPermission } = usePermission();
  const [filteredNotification, setFilteredNotification] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [alertData, setAlertData] = useState({ isShow: false, infoText: '' });

  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  // updateReadStatusNotifications mutation
  const updateReadStatusNotificationsMutation = useMutation({
    mutationKey: [notificationApi.updateNotifications.endpointKey],
    mutationFn: updateNotification,
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || translations('common.errorMsg'),
      );
    },
  });

  // onrowclick handler
  const onRowClick = (row) => {
    const isCurrNotificationIsRead = row?.isRead;
    const isInvitationRejected = row?.templateName === 'INVITATION_REJECTED';

    if (isInvitationRejected && isCurrNotificationIsRead) {
      // Show the alert popup
      setAlertData({
        isShow: true,
        infoText: translations('common.invitation_notifications.not_exist'),
      });
    } else if (isInvitationRejected && !isCurrNotificationIsRead) {
      // Update the read status using mutation
      updateReadStatusNotificationsMutation.mutate(row?.id);

      // Show the alert popup
      setAlertData({
        isShow: true,
        infoText: translations('common.invitation_notifications.not_exist'),
      });
    } else if (!isInvitationRejected && isCurrNotificationIsRead) {
      // Navigate to the deep link
      router.push(row?.deepLink);
    } else {
      // Update the read status and navigate
      updateReadStatusNotificationsMutation.mutate(row?.id);
      router.push(row?.deepLink);
    }
  };

  // useInfiniteQuery hook for fetching notifications
  const { data, fetchNextPage, isFetching, isLoading, hasNextPage } =
    useInfiniteQuery({
      queryKey: [
        notificationApi.getNotifications.endpointKey,
        enterpriseId,
        filteredNotification,
      ],
      queryFn: async ({ pageParam = 1 }) => {
        const fetchedData = await getNotifications({
          id: enterpriseId,
          data: {
            page: pageParam,
            limit: PAGE_LIMIT,
            ...filteredNotification,
          },
        });
        return fetchedData;
      },
      initialPageParam: 1,
      getNextPageParam: (_lastGroup, groups) => {
        const nextPage = groups.length + 1;
        return nextPage <= _lastGroup.data.data.totalPages
          ? nextPage
          : undefined;
      },
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
      enabled: hasPermission('permission:view-dashboard'),
    });

  useEffect(() => {
    if (!data) return;

    // Flatten the notifications from all pages
    const flattenedNotifications = data.pages
      .map((item) => item?.data?.data?.notifications)
      .flat();

    // Deduplicate notifications based on their unique ID
    const uniqueNotifications = Array.from(
      new Map(
        flattenedNotifications.map((notification) => [
          notification.id, // Assuming `id` is the unique identifier
          notification,
        ]),
      ).values(),
    );

    // Update the state with deduplicated notifications
    setNotifications(uniqueNotifications);

    // Update total unread notifications count
    setTotalUnreadNotifications(data?.pages[0]?.data?.data?.unReadCount);
  }, [data]);

  // Pagination data
  const totalPages = data?.pages[0]?.data?.data?.totalPages ?? 0;
  const currFetchedPage = data?.pages.length ?? 0;

  // Infinite scroll logic
  const observer = useRef();

  const lastNotificationRef = useCallback(
    (node) => {
      if (isFetching) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          currFetchedPage < totalPages
        ) {
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isFetching, fetchNextPage, hasNextPage, currFetchedPage, totalPages],
  );

  // columns
  const NotificationColumns = useNotificationColumns();

  return (
    <ProtectedWrapper permissionCode="permission:view-dashboard">
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <>
          <SubHeader name={translations('title')}></SubHeader>
          <RestrictedComponent />
        </>
      )}
      {enterpriseId && isEnterpriseOnboardingComplete && (
        <Wrapper className="h-screen">
          <SubHeader
            name={translations('title')}
            className="z-10 flex justify-between bg-white"
          >
            <NotificationFilterPopUp
              setFilteredNotification={setFilteredNotification}
            />
          </SubHeader>

          <div className="flex-grow overflow-hidden">
            {/* alertbox for rejected invite */}
            <AlertBox
              isAlertShow={alertData.isShow}
              infoText={alertData.infoText}
              onClose={() => {
                setAlertData({ isShow: false, infoText: '' });
                // after closing modal refetch notifications
                queryClient.invalidateQueries([
                  notificationApi.getNotifications.endpointKey,
                ]);
              }}
            />
            {isLoading && notifications?.length === 0 && <Loading />}

            {!isLoading && notifications?.length > 0 && (
              <InfiniteNotificationTable
                id="notification-table"
                columns={NotificationColumns}
                data={notifications}
                fetchNextPage={fetchNextPage}
                isFetching={isFetching}
                totalPages={totalPages}
                currFetchedPage={currFetchedPage}
                onRowClick={onRowClick}
                lastNotificationRef={lastNotificationRef}
              />
            )}
          </div>
        </Wrapper>
      )}
    </ProtectedWrapper>
  );
};

export default Notification;
