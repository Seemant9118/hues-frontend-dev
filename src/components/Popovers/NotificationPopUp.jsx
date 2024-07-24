'use client';

import { notificationApi } from '@/api/notifications/notificationApi';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { LocalStorageService } from '@/lib/utils';
import {
  getNotifications,
  updateNotification,
} from '@/services/Notification_Services/NotificationServices';
import { useMutation } from '@tanstack/react-query';
import { Bell, BellOff, Dot } from 'lucide-react';
import moment from 'moment';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

function NotificationPopUp() {
  const pathName = usePathname();
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  // State to manage visibility of read notifications
  const [visibleReadNotifications, setVisibleReadNotifications] = useState({});

  // getNotification mutation fn
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

  // call api : on whenever routes changes in app, opening/closing popup, initial load
  useEffect(() => {
    if (enterpriseId) {
      getNotificationsMutations.mutate({});
    }
  }, [pathName, open]);

  // update mutation
  const updateNotificationMutation = useMutation({
    mutationKey: notificationApi.updateNotifications.endpointKey,
    mutationFn: updateNotification,
    onSuccess: () => {
      setOpen(false);
    },
    onError: (error) => {
      setOpen(false);
      toast.log(error.response.data.message);
    },
  });

  // Handler function for update
  const handleUpdateNotification = (notificationId, notificationLink) => {
    updateNotificationMutation.mutate(notificationId);
    router.push(notificationLink);
  };

  // Notification grouping based on notificationType
  const groupedNotifications = notifications.reduce((acc, item) => {
    if (!acc[item.notificationType]) {
      acc[item.notificationType] = [];
    }
    acc[item.notificationType].push(item);
    return acc;
  }, {});

  // Sort the notifications within each group
  Object.keys(groupedNotifications).forEach((type) => {
    groupedNotifications[type].sort(
      (a, b) =>
        a.isRead - b.isRead || new Date(b.updatedAt) - new Date(a.updatedAt),
    );
  });

  const handleSeeMoreClick = (type) => {
    setVisibleReadNotifications((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Sort the groups so those with unread notifications are on top
  const sortedNotificationTypes = Object.keys(groupedNotifications).sort(
    (a, b) => {
      const aHasUnread = groupedNotifications[a].some((item) => !item.isRead);
      const bHasUnread = groupedNotifications[b].some((item) => !item.isRead);
      return bHasUnread - aHasUnread;
    },
  );

  // Date & time formatter
  const formatDateTime = (itemDateT) => {
    const itemDateTime = moment(itemDateT);
    const now = moment();
    let displayDate;

    if (itemDateTime.isSame(now, 'day')) {
      displayDate = 'Today';
    } else if (itemDateTime.isSame(now.clone().subtract(1, 'days'), 'day')) {
      displayDate = 'Yesterday';
    } else {
      displayDate = itemDateTime.format('DD-MM-YYYY');
    }
    return `${displayDate} ${itemDateTime.format('HH:mm:ss')}`;
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant={'link'} size={'icon'} className="your-notification">
            <Bell className="text-grey" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="m-2 flex max-h-[400px] w-[300px] flex-col gap-4 px-4 text-sm">
          <div className="text-center font-bold text-gray-500">
            Notifications
          </div>
          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-1 rounded-lg border bg-gray-100 p-2">
              <BellOff className="text-gray-400" />
              <span className="text-gray-500">No Notifications</span>
            </div>
          )}
          {notifications.length > 0 && (
            <>
              <div className="scrollBarStyles max-h-[300px] overflow-auto">
                {sortedNotificationTypes.map((type) => {
                  const unreadNotifications = groupedNotifications[type].filter(
                    (item) => !item.isRead,
                  );
                  const readNotifications = groupedNotifications[type].filter(
                    (item) => item.isRead,
                  );

                  return (
                    <div key={type}>
                      <h3 className="py-2 text-xs font-bold text-gray-600">
                        {type}
                      </h3>
                      <ul className="flex flex-col gap-2">
                        {unreadNotifications.length > 0
                          ? unreadNotifications.map((item) => (
                              <div
                                onClick={() =>
                                  handleUpdateNotification(
                                    item.id,
                                    item.deepLink,
                                  )
                                }
                                className="relative flex cursor-pointer flex-col gap-1 rounded-lg border bg-gray-100 p-2 hover:bg-blue-50"
                                key={item.id}
                              >
                                <Dot className="absolute right-0 top-0 text-blue-600" />
                                <span className="flex flex-wrap gap-1 text-black">
                                  {item.text}
                                  {item.deepLink !== '' && (
                                    <p
                                      onClick={() =>
                                        handleUpdateNotification(
                                          item.id,
                                          item.deepLink,
                                        )
                                      }
                                      className="text-blue-400 underline hover:text-blue-600"
                                    >
                                      View
                                    </p>
                                  )}
                                </span>
                                <span className="text-xs font-bold text-gray-400">
                                  {formatDateTime(item.updatedAt)}
                                </span>
                              </div>
                            ))
                          : readNotifications.slice(0, 1).map((item) => (
                              <div
                                onClick={() =>
                                  handleUpdateNotification(
                                    item.id,
                                    item.deepLink,
                                  )
                                }
                                className="relative flex cursor-pointer flex-col gap-1 rounded-lg border p-2 hover:bg-blue-50"
                                key={item.id}
                              >
                                <span className="flex flex-wrap gap-1 text-black">
                                  {item.text}
                                  {item.deepLink !== '' && (
                                    <p
                                      onClick={() =>
                                        handleUpdateNotification(
                                          item.id,
                                          item.deepLink,
                                        )
                                      }
                                      className="text-blue-400 underline hover:text-blue-600"
                                    >
                                      View
                                    </p>
                                  )}
                                </span>
                                <span className="text-xs font-bold text-gray-400">
                                  {formatDateTime(item.updatedAt)}
                                </span>
                              </div>
                            ))}
                        {readNotifications.length > 1 && (
                          <button
                            onClick={() => handleSeeMoreClick(type)}
                            className="text-blue-400 underline"
                          >
                            {visibleReadNotifications[type]
                              ? 'See Less'
                              : `${readNotifications.length - 1 > 0 ? `Show More ${readNotifications.length - 1}+` : ''}`}
                          </button>
                        )}
                        {visibleReadNotifications[type] &&
                          readNotifications.slice(1).map((item) => (
                            <div
                              onClick={() =>
                                handleUpdateNotification(item.id, item.deepLink)
                              }
                              className="relative flex cursor-pointer flex-col gap-1 rounded-lg border p-2 hover:bg-blue-50"
                              key={item.id}
                            >
                              <span className="flex flex-wrap gap-1 text-black">
                                {item.text}
                                {item.deepLink !== '' && (
                                  <p
                                    onClick={() =>
                                      handleUpdateNotification(
                                        item.id,
                                        item.deepLink,
                                      )
                                    }
                                    className="text-blue-400 underline hover:text-blue-600"
                                  >
                                    View
                                  </p>
                                )}
                              </span>
                              <span className="text-xs font-bold text-gray-400">
                                {formatDateTime(item.updatedAt)}
                              </span>
                            </div>
                          ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
              <span
                className="cursor-pointer text-center text-blue-400 underline"
                onClick={() => {
                  setOpen(!open);
                  router.push('/notification');
                }}
              >
                See more
              </span>
            </>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
}

export default NotificationPopUp;
