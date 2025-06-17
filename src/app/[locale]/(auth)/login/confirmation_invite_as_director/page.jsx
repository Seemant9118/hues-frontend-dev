'use client';

import { userAuth } from '@/api/user_auth/Users';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import { UserProvider } from '@/context/UserContext';
import { LocalStorageService } from '@/lib/utils';
import { createUserSession } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const ConfirmationInviteAsDirectorPage = () => {
  const translations = useTranslations('auth.confirmationInviteAsDirector');
  const router = useRouter();
  const fromEnterpriseId = LocalStorageService.get(
    'InvitationFromEnterpriseId',
  );

  const [inviteData, setInviteData] = useState(null);

  // Fetch data from localStorage on the client side
  useEffect(() => {
    const fetchedInviteData = LocalStorageService.get('invitationData');
    setInviteData(fetchedInviteData);
  }, []);

  const createUserSessionMutation = useMutation({
    mutationKey: [userAuth.createUserSession.endpointKey],
    mutationFn: createUserSession,
    onSuccess: (data) => {
      const {
        userId,
        enterpriseId,
        isOnboardingComplete,
        isEnterpriseOnboardingComplete,
      } = data.data.data.user;

      LocalStorageService.set('user_profile', userId);
      LocalStorageService.set('enterprise_Id', enterpriseId);
      LocalStorageService.set('isOnboardingComplete', isOnboardingComplete);
      LocalStorageService.set(
        'isEnterpriseOnboardingComplete',
        isEnterpriseOnboardingComplete,
      );

      router.push('/login/enterprise/select_enterprise_type');
    },
    onError: (error) => {
      toast.error(error.response.data.message || translations('toast.error'));
    },
  });

  // Render only when client-side data is loaded
  if (!inviteData) {
    return (
      <UserProvider>
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <div className="text-2xl">{translations('noInvitationFound')}</div>
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center text-sm font-semibold text-[#121212] hover:underline"
          >
            {translations('skipForNow')}
          </Link>
        </div>
      </UserProvider>
    );
  }

  return (
    <UserProvider>
      <div className="flex h-full items-center justify-center">
        <div className="flex min-h-[500px] w-[450px] flex-col items-center justify-center gap-10 rounded-md">
          <div className="flex flex-col gap-4">
            <h1 className="w-full text-center text-xl font-bold text-[#121212]">
              {translations('invitedHeading', {
                userName: inviteData?.data?.inviteeUserData?.name,
                enterpriseName:
                  inviteData?.data?.invitation?.fromEnterprise?.name,
              })}
            </h1>

            <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
              {translations('continueWith', {
                enterpriseName:
                  inviteData?.data?.invitation?.fromEnterprise?.name,
              })}
            </h1>
          </div>

          <div className="flex w-full gap-5">
            <Button
              size="sm"
              type="Submit"
              className="w-full bg-[#288AF9] p-2"
              disabled={createUserSessionMutation.isPending}
              onClick={() =>
                createUserSessionMutation.mutate({
                  data: { context: 'DIRECTOR', enterpriseId: fromEnterpriseId },
                })
              }
            >
              {createUserSessionMutation.isPending ? (
                <Loading />
              ) : (
                translations('yesButton')
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              type="Submit"
              className="w-full p-2"
              disabled={createUserSessionMutation.isPending}
              onClick={() => router.push('/login/select_enterprise')}
            >
              {translations('noButton')}
            </Button>
          </div>

          <div className="flex w-full flex-col gap-14">
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center text-sm font-semibold text-[#121212] hover:underline"
            >
              {translations('skipButton')}
            </Link>
          </div>
        </div>
      </div>
    </UserProvider>
  );
};

export default ConfirmationInviteAsDirectorPage;
