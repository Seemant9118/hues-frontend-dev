'use client';

import { userAuth } from '@/api/user_auth/Users';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import { UserProvider } from '@/context/UserContext';
import { LocalStorageService } from '@/lib/utils';
import { createUserSession } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const ConfirmationInviteAsDirectorPage = () => {
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
      // LocalStorageService.set(
      //   'isKycVerified',
      //   data?.data?.data?.user?.isKycVerified,
      // );

      router.push('/login/enterprise/select_enterprise_type');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // Render only when client-side data is loaded
  if (!inviteData) {
    return (
      <UserProvider>
        <div className="flex h-full items-center justify-center">
          <div>Oops, No Invitation Found!</div>
          <Link
            href="/"
            className="flex w-full items-center justify-center text-sm font-semibold text-[#121212] hover:underline"
          >
            You can skip for now
          </Link>
        </div>
      </UserProvider>
    );
  }

  return (
    <UserProvider>
      <div className="flex h-full items-center justify-center">
        <div className="flex h-[350px] w-[450px] flex-col items-center justify-center gap-14">
          <div className="flex flex-col gap-4">
            <h1 className="w-full text-center text-xl font-bold text-[#121212]">
              {inviteData?.data?.inviteeUserData?.name} has asked you to verify
              details for{' '}
              {inviteData?.data?.invitation?.fromEnterprise?.name ??
                'enterpriseName'}
              .
            </h1>

            <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
              Continue with{' '}
              {inviteData?.data?.invitation?.fromEnterprise?.name ??
                'enterpriseName'}
              ?
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
              {createUserSessionMutation.isPending ? <Loading /> : 'Yes'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              type="Submit"
              className="w-full p-2"
              disabled={createUserSessionMutation.isPending}
              onClick={() => router.push('/login/select_enterprise')}
            >
              No
            </Button>
          </div>

          <div className="flex w-full flex-col gap-14">
            <Link
              href="/"
              className="flex w-full items-center justify-center text-sm font-semibold text-[#121212] hover:underline"
            >
              Skip for Now
            </Link>
          </div>
        </div>
      </div>
    </UserProvider>
  );
};

export default ConfirmationInviteAsDirectorPage;
