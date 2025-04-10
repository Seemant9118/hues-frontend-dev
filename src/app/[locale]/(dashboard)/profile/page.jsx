'use client';

import { userAuth } from '@/api/user_auth/Users';
import { getInitialsNames, getRandomBgColor } from '@/appUtils/helperFunctions';
import Tooltips from '@/components/auth/Tooltips';
import LanguagesSwitcher from '@/components/ui/LanguagesSwitcher';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/custom-hooks/useMetaData';
import { LocalStorageService } from '@/lib/utils';
import {
  getProfileDetails,
  LoggingOut,
} from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

function Profile() {
  const translations = useTranslations('profile');
  const userId = LocalStorageService.get('user_profile');

  const router = useRouter();
  const [bgColor, setBgColor] = useState('');
  const [tab, setTab] = useState('userOverview');

  // Handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  // logout mutation fn
  const logoutMutation = useMutation({
    mutationKey: [userAuth.logout.endpointKey],
    mutationFn: LoggingOut,
    onSuccess: (res) => {
      LocalStorageService.clear();
      router.push('/login');
      toast.success(
        res.data.message || translations('toasts.logout.successMsg'),
      );
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translations('toasts.logout.errorMsg'),
      );
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  // fetch profileDetails API
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
    enabled: tab === 'userOverview' || tab === 'enterpriseOverview',
  });

  useMetaData(
    `Hues! - ${profileDetails?.userDetails?.user?.name ?? 'Profile'}`,
    'HUES PROFILE',
  ); // dynamic title

  useEffect(() => {
    const bgColorClass = getRandomBgColor();
    setBgColor(bgColorClass);
  }, []);

  return (
    <Wrapper className="h-full gap-8">
      <SubHeader name="Profile">
        <Button
          size="sm"
          variant="blue_outline"
          onClick={logout}
          disabled={logoutMutation.isPending}
        >
          {translations('ctas.logout')}
        </Button>
      </SubHeader>

      <Tabs
        className="flex flex-col gap-4"
        value={tab}
        onValueChange={onTabChange}
        defaultValue={'userOverview'}
      >
        <TabsList className="w-fit border">
          <TabsTrigger value="userOverview">
            {translations('tabs.label.tab1')}
          </TabsTrigger>
          <TabsTrigger value="languages">
            {translations('tabs.label.tab2')}
          </TabsTrigger>
        </TabsList>

        {/* ---checks : for if user skips */}
        {!profileDetails?.userDetails?.user?.isOnboardingCompleted &&
          !profileDetails?.userDetails?.user?.isPanVerified && (
            <div className="flex items-center justify-between rounded-md bg-[#288AF90A] p-2">
              <span className="flex items-center gap-1 text-sm font-semibold text-[#121212]">
                <Info size={14} />
                {` Your onboarding is not complete yet, please complete it to unlock additional features.`}
              </span>
              <Button
                size="sm"
                className="h-8 bg-[#288AF9]"
                onClick={() => {
                  router.push('/login/user/pan-verification');
                }}
              >
                {translations('ctas.pendingActionsForCompletion.complete')}
              </Button>
            </div>
          )}

        {!profileDetails?.userDetails?.user?.isOnboardingCompleted &&
          profileDetails?.userDetails?.user?.isPanVerified &&
          !profileDetails?.userDetails?.user?.isAadhaarVerified && (
            <div className="flex items-center justify-between rounded-md bg-[#288AF90A] p-2">
              <span className="flex items-center gap-1 text-sm font-semibold text-[#121212]">
                <Info size={14} />
                {` Your onboarding is not complete yet, please complete it to unlock additional features.`}
              </span>
              <Button
                size="sm"
                className="h-8 bg-[#288AF9]"
                onClick={() => {
                  router.push('/login/user/aadhar-verification');
                }}
              >
                {translations('ctas.pendingActionsForCompletion.complete')}
              </Button>
            </div>
          )}

        {profileDetails?.userDetails?.user?.isOnboardingCompleted &&
          !profileDetails?.enterpriseDetails?.isOnboardingCompleted && (
            <div className="flex items-center justify-between rounded-md bg-[#288AF90A] p-2">
              <span className="flex items-center gap-1 text-sm font-semibold text-[#121212]">
                <Info size={14} />
                {` You have not completed your enterprise verification yet, please complete your enterprise verification to unlock additional features.`}
              </span>
              <Button
                size="sm"
                className="h-8 bg-[#288AF9]"
                onClick={() => {
                  router.push('/login/enterprise/pending-actions');
                }}
              >
                {translations('ctas.pendingActionsForCompletion.complete')}
              </Button>
            </div>
          )}

        {/* user details */}
        <TabsContent value="userOverview">
          {/* if userOnboarding is not completed */}
          {!profileDetails?.userDetails?.user?.isOnboardingCompleted && (
            <div className="relative">
              <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-sm bg-[#dedede88]"></div>
              <div className="grid grid-cols-3 grid-rows-2 gap-8 rounded-sm border p-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab1.label.pan')}
                  </Label>
                  <span className="text-lg font-bold">{'XXXXXX1234'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab1.label.name')}
                  </Label>
                  <span className="text-lg font-bold">{'Your Full Name'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab1.label.type')}
                  </Label>
                  <span className="text-lg font-bold">{'Individual'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab1.label.mobile')}
                  </Label>
                  <span className="text-lg font-bold">+91 {'9876543210'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab1.label.email')}
                  </Label>
                  <span className="text-lg font-bold">
                    {'youremail@gmail.com'}
                  </span>
                </div>
              </div>
            </div>
          )}
          {/* if userOnboarding is completed */}
          {profileDetails?.userDetails?.user?.isOnboardingCompleted && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between gap-2 rounded-sm border p-4">
                <div className="flex w-full items-center justify-start gap-4">
                  <div
                    className={`${bgColor} flex h-16 w-16 items-center justify-center rounded-full p-2 text-2xl text-white`}
                  >
                    {getInitialsNames(profileDetails?.userDetails?.user?.name)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">
                      {translations(
                        'tabs.content.tab1.profilePicSection.title',
                      )}
                    </span>
                    <span className="text-xs text-grey">
                      {translations(
                        'tabs.content.tab1.profilePicSection.format',
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex w-full items-center justify-end gap-2">
                  <Tooltips
                    trigger={
                      <Button size="sm" variant="blue_outline" disabled>
                        {translations(
                          'tabs.content.tab1.profilePicSection.ctas.upload',
                        )}
                      </Button>
                    }
                    content={'This feature Coming Soon...'}
                  />

                  <Tooltips
                    trigger={
                      <Button size="sm" variant="outline" disabled>
                        {translations(
                          'tabs.content.tab1.profilePicSection.ctas.delete',
                        )}
                      </Button>
                    }
                    content={'This feature Coming Soon...'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 grid-rows-2 gap-8 rounded-sm border p-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab1.label.pan')}
                  </Label>
                  <span className="text-lg font-bold">
                    {profileDetails?.userDetails?.user?.panNumber}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab1.label.name')}
                  </Label>
                  <span className="text-lg font-bold">
                    {profileDetails?.userDetails?.user?.name}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab1.label.type')}
                  </Label>
                  <span className="text-lg font-bold">{'Individual'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab1.label.mobile')}
                  </Label>
                  <span className="text-lg font-bold">
                    +91 {profileDetails?.userDetails?.user?.mobileNumber}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {translations('tabs.content.tab1.label.email')}
                  </Label>
                  <span className="text-lg font-bold">
                    {profileDetails?.userDetails?.email ?? '-'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="languages">
          <LanguagesSwitcher translations={translations} />
        </TabsContent>
      </Tabs>
    </Wrapper>
  );
}

export default Profile;
