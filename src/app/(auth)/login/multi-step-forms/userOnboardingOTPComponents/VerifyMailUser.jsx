'use client';

import { directorApi } from '@/api/director/directorApi';
import { userAuth } from '@/api/user_auth/Users';
import { Button } from '@/components/ui/button';
import Slot from '@/components/ui/Slot';
import { LocalStorageService } from '@/lib/utils';
import { directorInviteList } from '@/services/Director_Services/DirectorServices';
import { verifyMailOTP } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OTPInput } from 'input-otp';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const VerifyMailUser = ({ setUserOnboardingStep }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [Otp, setOtp] = useState();
  const invitationData = LocalStorageService.get('invitationData');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const handleChangeOtp = (value) => {
    setOtp(value);
  };

  const verifyMailOTPMutation = useMutation({
    mutationKey: [userAuth.verifyMailOTP.endpointKey],
    mutationFn: verifyMailOTP,
    onSuccess: async () => {
      // check by calling api : directorInviteList
      const directorInviteListData = await queryClient.fetchQuery({
        queryKey: [directorApi.getDirectorInviteList.endpoint],
        queryFn: directorInviteList,
      });

      const isUserHaveValidDirectorInvites =
        directorInviteListData?.data?.data?.length > 0;

      toast.success('Your Profile Completed & Verified');

      // 1. invitation absent && !isUserHaveValidDirectorInvites && isEnterpriseOnboardingComplete
      if (
        !invitationData?.data?.id &&
        !isUserHaveValidDirectorInvites &&
        isEnterpriseOnboardingComplete
      ) {
        router.push('/');
      }
      // 2. invitation is present && isUserHaveValidDirectorInvites
      else if (invitationData?.data?.id && isUserHaveValidDirectorInvites) {
        router.push('/login/select_enterprise');
      }
      // 3. invitation present && !isUserHaveValidDirectorInvites
      else if (invitationData?.data?.id && !isUserHaveValidDirectorInvites) {
        router.push('/login/confirmation_invite_as_client');
      }
      // 4. invitation absent  && !isUserHaveValidDirectorInvites && !isEnterpriseOnboardingComplete
      else {
        router.push('/login/enterpriseOnboardingSearch');
      }
    },
  });

  const handleVerifiyOTP = (e) => {
    e.preventDefault();

    verifyMailOTPMutation.mutate({
      otp: Otp,
    });
  };

  return (
    <form
      onSubmit={handleVerifiyOTP}
      className="flex h-[350px] w-[450px] flex-col items-center justify-center gap-10"
    >
      <div className="flex flex-col gap-4">
        <h2 className="w-full text-center text-2xl font-bold">
          Verify your mail
        </h2>
        <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
          A OTP code is sent to your inbox
        </p>
      </div>

      <OTPInput
        name="Otp"
        onChange={handleChangeOtp}
        maxLength={4}
        value={Otp}
        containerClassName="group flex items-center has-[:disabled]:opacity-30"
        render={({ slots }) => (
          <div className="flex gap-4">
            {slots.map((slot) => (
              <Slot key={uuidv4()} {...slot} />
            ))}
          </div>
        )}
      />

      <p className="flex w-full items-center justify-center gap-2 text-sm text-[#A5ABBD]">
        OTP valid for 5 minutes
      </p>
      <Button size="sm" type="Submit" className="w-full bg-[#288AF9] p-2">
        Verify
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="w-full p-2"
        onClick={() => setUserOnboardingStep(1)}
      >
        <ArrowLeft size={14} />
        Back
      </Button>
    </form>
  );
};

export default VerifyMailUser;
