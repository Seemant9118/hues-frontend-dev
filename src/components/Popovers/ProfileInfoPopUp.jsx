'use client';

import { AdminAPIs } from '@/api/adminApi/AdminApi';
import { userAuth } from '@/api/user_auth/Users';
import {
  getInitialsNames,
  getRandomBgColor,
  roleColors,
} from '@/appUtils/helperFunctions';
import { goToHomePage } from '@/appUtils/redirectionUtilFn';
import { usePathname, useRouter } from '@/i18n/routing';
import { cn, LocalStorageService, SessionStorageService } from '@/lib/utils';
import { revertSwitchedEnterprise } from '@/services/Admin_Services/AdminServices';
import {
  addAnotherEnterprise,
  getUserAccounts,
  LoggingOut,
  switchAccount,
} from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Building2, ShieldBan } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Tooltips from '../auth/Tooltips';
import { Badge } from '../ui/badge';
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
  const switchedEnterpriseId = LocalStorageService.get('switchedEnterpriseId');

  const [activeEnterprise, setActiveEnterprise] = useState(null);
  const [userEnterprises, setUserEnterprises] = useState([]);

  const { data: userAccounts } = useQuery({
    queryKey: [userAuth.getUserAccounts.endpointKey],
    queryFn: () => getUserAccounts(),
    select: (data) => data.data.data,
    enabled: open,
  });

  useEffect(() => {
    if (userAccounts) {
      const sortedEnterprises = [...userAccounts].sort(
        (a, b) => Number(b.isActiveEnterprise) - Number(a.isActiveEnterprise),
      );
      setUserEnterprises(sortedEnterprises);
      const activeEnt = userAccounts.find(
        (account) => account.isActiveEnterprise,
      );
      setActiveEnterprise(activeEnt);
    }
  }, [userAccounts]);

  // switch account mutation
  const switchAccountMutation = useMutation({
    mutationKey: [userAuth.switchAccount.endpointKey],
    mutationFn: switchAccount,
    onSuccess: (data) => {
      setOpen(false);

      const {
        userId,
        enterpriseId,
        isOnboardingComplete,
        isEnterpriseOnboardingComplete,
      } = data.data.data.user;
      // update all necessary details after switching accounts
      LocalStorageService.set('refreshtoken', data?.data?.data?.refresh_token);
      LocalStorageService.set('token', data?.data?.data?.access_token);
      LocalStorageService.set('user_profile', userId);
      LocalStorageService.set('enterprise_Id', enterpriseId);
      LocalStorageService.set('isOnboardingComplete', isOnboardingComplete);
      LocalStorageService.set(
        'isEnterpriseOnboardingComplete',
        isEnterpriseOnboardingComplete,
      );

      toast.success('Enterprise Switch Successfully');

      // reload immediately
      window.location.href = goToHomePage();
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // add another enterprise mutation
  const addAnotherEnterpriseMutation = useMutation({
    mutationKey: [userAuth.addAnotherEnterprise.endpointKey],
    mutationFn: addAnotherEnterprise,
    onSuccess: (data) => {
      // eslint-disable-next-line camelcase
      const { userId, access_token, refresh_token } = data.data.data;

      LocalStorageService.set('user_profile', userId);
      LocalStorageService.set('token', access_token);
      LocalStorageService.set('refreshtoken', refresh_token);

      LocalStorageService.remove('enterprise_Id');

      router.push(
        '/login/enterprise/select_enterprise_type?action=add_another_enterprise',
      );
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // revert enterprise view
  const revertSwitchedEnterpriseMutation = useMutation({
    mutationKey: [AdminAPIs.revertSwitchedEnterprise.endpointKey],
    mutationFn: revertSwitchedEnterprise,
    onSuccess: (data) => {
      // eslint-disable-next-line camelcase
      const { access_token, refresh_token } = data.data.data;

      // update tokens
      LocalStorageService.set('token', access_token);
      LocalStorageService.set('refreshtoken', refresh_token);

      // clear switched enterprise
      LocalStorageService.remove('switchedEnterpriseId');
      LocalStorageService.remove('switchedEnterpriseName');

      // ✅ store success flag for after reload
      LocalStorageService.set(
        'switchSuccessMessage',
        'Enterprise reverted to admin view',
      );

      // reload immediately
      window.location.href = goToHomePage();
    },
    onError: () => {
      toast.error('Failed to revert admin view. Please try again.');
    },
  });

  const handleRevert = (enterprise) => {
    revertSwitchedEnterpriseMutation.mutate(enterprise?.enterpriseId);
  };

  // logout mutation
  const logoutMutation = useMutation({
    mutationKey: [userAuth.logout.endpointKey],
    mutationFn: LoggingOut,
    onSuccess: (res) => {
      setOpen(false);
      // Clear session immediately so logout is guaranteed
      LocalStorageService.clear();
      SessionStorageService.clear();

      // Redirect user right away (non-blocking)
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
          debounceTime={0}
          variant="ghost"
          className={cn(
            'flex w-full justify-start gap-2.5 rounded-sm border px-3 py-5 text-sm font-normal transition',
            open
              ? 'border-black bg-gray-100 text-gray-900 hover:bg-gray-100'
              : pathName.includes('enterprise-profile')
                ? 'border-transparent bg-[#288AF91A] text-primary hover:bg-[#288AF91A] hover:text-primary'
                : 'border-transparent bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          )}
          size="sm"
        >
          <Building2 size={14} />
          {translations(ctaName)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="absolute bottom-2 left-28 flex max-h-[400px] w-[350px] flex-col gap-5">
        {/* enterprise information */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`${bgColor} flex h-10 w-10 items-center justify-center rounded-full p-2 text-sm text-white`}
            >
              {activeEnterprise?.enterprise?.enterpriseName &&
                getInitialsNames(activeEnterprise?.enterprise?.enterpriseName)}
            </div>

            <span className="text-sm font-bold">
              {activeEnterprise?.enterprise?.enterpriseName || '---------'}
            </span>
          </div>

          <div
            onClick={() => {
              router.push('/dashboard/enterprise-profile');
              setOpen(false);
            }}
            className="cursor-pointer rounded-sm border border-primary p-1 text-xs font-semibold text-primary hover:bg-blue-500/10"
          >
            {translations(viewProfileCta)}
          </div>
        </div>

        {/* enterprise switch */}
        <div className="relative flex flex-col gap-1 p-1">
          <h1 className="text-sm">{translations(enterprises)}</h1>
          {switchedEnterpriseId && (
            <div className="absolute top-0 z-20 flex h-40 w-full items-center justify-center gap-1 rounded-md border bg-white/70 px-4 py-3 backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center gap-1">
                <ShieldBan size={16} />
                <span className="text-center text-sm">
                  Want to switch to another?{' '}
                  <button
                    onClick={handleRevert}
                    className="text-primary hover:underline"
                  >
                    remove the enterprise view.
                  </button>
                </span>
              </div>
            </div>
          )}
          <div className="scrollBarStyles flex max-h-32 flex-col gap-5 overflow-y-auto">
            {userEnterprises?.map((userAccount) => (
              <div
                key={userAccount?.userAccountId}
                className={cn(
                  'flex items-center justify-between rounded-sm p-2 hover:bg-blue-500/10',
                  userAccount?.isActiveEnterprise
                    ? 'border border-primary bg-blue-500/10'
                    : switchedEnterpriseId // disable clicks when switched
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer',
                )}
                onClick={() => {
                  if (
                    !switchedEnterpriseId &&
                    !userAccount?.isActiveEnterprise
                  ) {
                    switchAccountMutation.mutate({
                      userId: userAccount?.user?.userId,
                      userAccountId: userAccount?.userAccountId,
                      enterpriseId: userAccount?.enterprise?.enterpriseId,
                    });
                  }
                }}
              >
                <div className="flex w-full items-center gap-2">
                  <div
                    className={`${bgColor} flex h-10 w-12 items-center justify-center rounded-full text-sm text-white`}
                  >
                    {getInitialsNames(userAccount?.enterprise?.enterpriseName)}
                  </div>
                  <div className="flex w-full flex-col gap-0.5">
                    <span className="text-sm font-bold">
                      {userAccount?.enterprise?.enterpriseName ??
                        'Enterprise Not Completed'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {userAccount?.roles?.length > 0 &&
                        userAccount?.roles.map((role, index) => {
                          const color = roleColors[index % roleColors.length];
                          return (
                            <Badge key={role} className={color}>
                              {role}
                            </Badge>
                          );
                        })}
                    </div>
                    {userAccount?.enterprise?.enterpriseId &&
                      !userAccount?.enterprise?.isOnboardingCompleted && (
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
          {!switchedEnterpriseId && (
            <div
              onClick={() => {
                addAnotherEnterpriseMutation.mutate();
              }}
              className="cursor-pointer rounded-sm p-2 text-sm font-semibold hover:bg-blue-500/10"
            >
              {translations(addAnotherCta)}
            </div>
          )}

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
