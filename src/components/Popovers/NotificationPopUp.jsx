'use client';

import { notificationApi } from '@/api/notifications/notificationApi';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { LocalStorageService } from '@/lib/utils';
import { getNotifications } from '@/services/Notification_Services/NotificationServices';
import { useMutation } from '@tanstack/react-query';
import { Bell, Dot } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
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
          <ul className="scrollBarStyles flex max-h-[300px] flex-col gap-2 overflow-auto">
            {notifications.map((item) => (
              <Link
                href={'/'}
                className={
                  item.isRead
                    ? 'relative flex flex-col gap-1 rounded-lg border p-2 hover:bg-gray-100'
                    : 'relative flex flex-col gap-1 rounded-lg border bg-gray-100 p-2 hover:bg-blue-50'
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
              </Link>
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
        </PopoverContent>
      </Popover>
    </>
  );
}

export default NotificationPopUp;
