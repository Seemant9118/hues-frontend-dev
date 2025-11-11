'use client';

import { userAuth } from '@/api/user_auth/Users';
import { LocalStorageService, SessionStorageService } from '@/lib/utils';
import { LoggingOut } from '@/services/User_Auth_Service/UserAuthServices';
import { PopoverContent } from '@radix-ui/react-popover';
import { useMutation } from '@tanstack/react-query';
import { LayoutDashboard, LogOut, User } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Popover, PopoverTrigger } from '../ui/popover';

const SignedInPopUp = ({ open, setOpen, userProfileData }) => {
  const mobileNumber = userProfileData?.mobile_number || 'N/A';

  const handleDashboardNavigation = () => {
    window.location.href = '/dashboard';
  };

  // logout mutation
  const logoutMutation = useMutation({
    mutationKey: [userAuth.logout.endpointKey],
    mutationFn: LoggingOut,
    onSuccess: (res) => {
      setOpen(false);
      LocalStorageService.clear();
      SessionStorageService.clear();
      window.location.reload(true);
      toast.success(res.data.message || 'User Logged Out');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });
  // handleLogout funtion
  const logout = () => {
    logoutMutation.mutate();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls="user-popover"
          size="sm"
          variant="outline"
          className="rounded-full"
        >
          <User size={16} aria-hidden="true" />
          <span className="sr-only">Open user menu</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        id="user-popover"
        className="absolute top-5 flex max-h-[300px] w-[200px] flex-col gap-2 rounded-sm border bg-white shadow-md"
        role="menu"
        aria-label="User menu"
      >
        <div className="flex w-full flex-col">
          <span
            className="flex items-center gap-4 p-2 text-sm text-muted-foreground"
            role="menuitem"
            tabIndex={-1}
          >
            <User size={16} /> Cred_Id: {mobileNumber}
          </span>
          <button
            onClick={handleDashboardNavigation}
            className="flex cursor-pointer items-center gap-4 rounded-sm p-2 text-sm hover:bg-primary-foreground hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            role="menuitem"
          >
            <LayoutDashboard size={16} aria-hidden="true" />
            <span>Go to Dashboard</span>
          </button>
          <button
            onClick={logout}
            className="flex cursor-pointer items-center gap-4 rounded-sm p-2 text-sm hover:bg-primary-foreground hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            role="menuitem"
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SignedInPopUp;
