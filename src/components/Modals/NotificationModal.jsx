'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../ui/button';

function NotificationModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const data = [
    {
      notifications: 'New Client Added',
      recievdAt: '10/07/2024',
      type: 'user',
    },
    {
      notifications: 'Order in Negotitaion',
      recievdAt: '10/07/024',
      type: 'order',
    },
    {
      notifications: 'Inventory shared by enterprise',
      recievdAt: '09/08/2024',
      type: 'inventory',
    },
    {
      notifications: 'Invoice Generated',
      recievdAt: '08/08/2024',
      type: 'invoice',
    },
  ];

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
            {data.map((item) => (
              <li
                className="flex flex-col gap-1 rounded-lg border bg-gray-100 p-2"
                key={item}
              >
                <span>{item.notifications}</span>
                <span className="text-xs font-bold text-gray-400">
                  {item.recievdAt}
                </span>
                <span className="text-xs font-bold text-gray-600">{`(${item.type})`}</span>
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

export default NotificationModal;
