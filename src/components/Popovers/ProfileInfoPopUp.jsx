'use client';

import { userAuth } from '@/api/user_auth/Users';
import { getInitialsNames, getRandomBgColor } from '@/appUtils/helperFunctions';
import { cn, LocalStorageService } from '@/lib/utils';
import {
  getUserAccounts,
  LoggingOut,
  switchAccount,
} from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { User } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/routing';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Tooltips from '../auth/Tooltips';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const ProfileInfoPopUp = ({
  ctaName,
  viewProfileCta,
  enterprises,
  addAnotherCta,
  logoutCta,
  accessDeniedCta,
}) => {
  const translations = useTranslations();
  const pathName = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bgColor, setBgColor] = useState('');

  const { data: userAccounts } = useQuery({
    queryKey: [userAuth.getUserAccounts.endpointKey],
    queryFn: () => getUserAccounts(),
    select: (data) => data.data.data,
    enabled: open,
  });

  // switch account mutation
  const switchAccountMutation = useMutation({
    mutationKey: [userAuth.switchAccount.endpointKey],
    mutationFn: switchAccount,
    onSuccess: (data) => {
      setOpen(false);
      // update all necessary details after switching accounts
      LocalStorageService.set('refreshtoken', data?.data?.data?.refresh_token);
      LocalStorageService.set('token', data?.data?.data?.access_token);
      LocalStorageService.set('user_profile', data?.data?.data?.user?.userId);
      LocalStorageService.set(
        'enterprise_Id',
        data?.data?.data?.user?.enterpriseId,
      );
      LocalStorageService.set(
        'isOnboardingComplete',
        data?.data?.data?.user?.isOnboardingComplete,
      );
      LocalStorageService.set(
        'isEnterpriseOnboardingComplete',
        data?.data?.data?.user?.isEnterpriseOnboardingComplete,
      );
      LocalStorageService.set(
        'isKycVerified',
        data?.data?.data?.user?.isKycVerified,
      );

      toast.success('Enterprise Switch Successfully');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // logout mutation
  const logoutMutation = useMutation({
    mutationKey: [userAuth.logout.endpointKey],
    mutationFn: LoggingOut,
    onSuccess: (res) => {
      setOpen(false);
      LocalStorageService.clear();
      router.push('/login');
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

  useEffect(() => {
    const bgColorClass = getRandomBgColor();
    setBgColor(bgColorClass);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'flex w-full justify-start gap-2.5 rounded-sm border-none p-3 text-sm',
            open || pathName.includes('profile')
              ? 'bg-[#288AF91A] text-[#288AF9] hover:bg-[#288AF91A] hover:text-[#288AF9]'
              : 'bg-transparent text-gray-600',
          )}
          size="sm"
        >
          <User size={14} />
          {translations(ctaName)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="absolute bottom-2 left-28 flex max-h-[350px] w-[350px] flex-col gap-5">
        {/* user information */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`${bgColor} flex h-10 w-10 items-center justify-center rounded-full p-2 text-sm text-white`}
            >
              {userAccounts?.length > 0 &&
                getInitialsNames(userAccounts[0]?.user?.userName)}
            </div>

            <span className="text-sm font-bold">
              {(userAccounts?.length > 0 && userAccounts[0]?.user?.userName) ||
                'Profile Not Completed'}
            </span>
          </div>

          <div
            onClick={() => {
              router.push('/profile');
              setOpen(false);
            }}
            className="cursor-pointer rounded-sm border border-primary p-1 text-xs font-semibold text-primary hover:bg-blue-500/10"
          >
            {translations(viewProfileCta)}
          </div>
        </div>

        {/* enterprise switch */}
        <div className="flex flex-col gap-1 p-1">
          <h1 className="text-sm">{translations(enterprises)}</h1>

          <div className="scrollBarStyles flex max-h-40 flex-col gap-5 overflow-y-auto">
            {/* availableenterprise lists */}
            {userAccounts?.map((account) => (
              <div
                key={account?.userAccountId}
                className={cn(
                  'flex items-center justify-between rounded-sm p-2 hover:bg-blue-500/10',
                  account?.isActiveEnterprise
                    ? 'border border-primary bg-blue-500/10'
                    : 'cursor-pointer',
                )}
                onClick={() => {
                  !account?.isActiveEnterprise &&
                    switchAccountMutation.mutate({
                      userId: account?.user?.userId,
                      userAccountId: account?.userAccountId,
                      enterpriseId: account?.enterprise?.enterpriseId,
                    });
                }}
              >
                <div className="flex w-full items-center gap-2">
                  <div
                    className={`${bgColor} flex h-10 w-12 items-center justify-center rounded-full text-sm text-white`}
                  >
                    {getInitialsNames(account?.enterprise?.enterpriseName)}
                  </div>
                  <div className="flex w-full justify-between gap-2">
                    <span className="text-sm font-bold">
                      {account?.enterprise?.enterpriseName ??
                        'Enterprise Not Completed'}
                    </span>
                    {account?.enterprise?.enterpriseId &&
                      !account?.enterprise?.isOnboardingCompleted && (
                        <Tooltips
                          trigger={
                            <span className="rounded-sm border-2 border-gray-400 p-1 text-center text-[10px] text-gray-600">
                              {translations(accessDeniedCta)}
                            </span>
                          }
                          content={
                            'Your enterprise onboarding is not yet complete. Please visit your profile to finish the process'
                          }
                        />
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto border-[1px]"></div>
        {/* other actions cta */}
        <div>
          <div
            onClick={() => {
              router.push(
                '/login/enterprise/select_enterprise_type?action=add_another_enterprise',
              );
              setOpen(false);
            }}
            className="cursor-pointer rounded-sm p-2 text-sm font-semibold hover:bg-blue-500/10"
          >
            {translations(addAnotherCta)}
          </div>

          <div
            onClick={logout}
            className="cursor-pointer rounded-sm p-2 text-sm font-semibold text-destructive hover:bg-blue-500/10"
          >
            {translations(logoutCta)}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProfileInfoPopUp;
