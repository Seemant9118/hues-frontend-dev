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
import { Bell } from 'lucide-react';
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
              <li
                className="flex flex-col gap-1 rounded-lg border bg-gray-100 p-2"
                key={item.id}
              >
                <span
                  className={
                    item.isRead
                      ? 'text-black'
                      : 'cursor-pointer text-blue-400 hover:underline'
                  }
                >
                  {item.text}
                </span>
                <span className="text-xs font-bold text-gray-400">
                  {moment(item.updatedAt).format('DD-MM-YYYY')}
                </span>
                <span className="text-xs font-bold text-gray-600">{`(${item.notificationType})`}</span>
              </li>
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
