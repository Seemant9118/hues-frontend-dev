'use client';

import { userAuth } from '@/api/user_auth/Users';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useStep } from '@/context/StepsContext';
import { LocalStorageService } from '@/lib/utils';
import { LoggingOut } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { UserCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import NotificationPopUp from '../Popovers/NotificationPopUp';
import { Button } from './button';

const Header = () => {
  const [open, setOpen] = useState(false);
  const { setCurrStep } = useStep();
  const router = useRouter();

  const handleProfile = () => {
    router.push('/profile');
    setOpen(false);
  };

  const logout = () => {
    LocalStorageService.clear();
    setCurrStep(1);
    router.push('/login');
  };

  const logoutMutation = useMutation({
    mutationKey: [userAuth.logout.endpointKey],
    mutationFn: LoggingOut,
    onSuccess: (res) => {
      logout();
      toast.success(res.data.message || 'User Logged Out');
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  return (
    <div className="flex items-center justify-between bg-white px-8 py-4 shadow-[0_4px_6px_0_#3288ED1A]">
      <Link href={'/dashboard'}>
        <Image
          src={'/hues_logo.png'}
          height={30}
          width={100}
          placeholder="blur"
          alt="Logo"
          blurDataURL="/hues_logo.png"
        />
      </Link>
      <div className="flex items-center gap-4">
        <NotificationPopUp />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant={'link'} size={'icon'} className="your-profile">
              <UserCircle className="text-grey" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="m-2 flex max-w-[180px] flex-col gap-1 p-1">
            <Button
              onClick={handleProfile}
              className="w-full"
              variant="outline"
            >
              Profile
            </Button>
            <Button
              onClick={() => logoutMutation.mutate()}
              className="w-full"
              variant="outline"
            >
              Logout
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default Header;
