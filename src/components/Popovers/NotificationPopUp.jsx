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
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

function NotificationPopUp() {
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

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
      getNotificationsMutations.mutate({});
    }
  }, [open]);

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

  // hanlder function for update
  const handleUpdateNotification = (notificationId, notificationLink) => {
    updateNotificationMutation.mutate(notificationId);
    router.push(notificationLink);
  };

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
        <PopoverContent className="m-2 flex max-h-[400px] max-w-[300px] flex-col gap-4 px-4 text-sm">
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
              <ul className="scrollBarStyles flex max-h-[300px] flex-col gap-2 overflow-auto">
                {notifications
                  .sort((a, b) => a.isRead - b.isRead)
                  .map((item) => (
                    <div
                      onClick={() => {
                        handleUpdateNotification(item.id, item.deepLink);
                      }}
                      className={
                        item.isRead
                          ? 'relative flex cursor-pointer flex-col gap-1 rounded-lg border p-2 hover:bg-blue-50'
                          : 'relative flex cursor-pointer flex-col gap-1 rounded-lg border bg-gray-100 p-2 hover:bg-blue-50'
                      }
                      key={item.id}
                    >
                      {!item.isRead && (
                        <Dot className="absolute right-0 top-0 text-blue-600" />
                      )}
                      <span className={'text-black'}>{item.text}</span>
                      <span className="text-xs font-bold text-gray-400">
                        {formatDateTime(item.updatedAt)}
                      </span>
                      {/* <span className="text-xs font-bold text-gray-600">{`(${item.notificationType})`}</span> */}
                    </div>
                  ))}
              </ul>
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
