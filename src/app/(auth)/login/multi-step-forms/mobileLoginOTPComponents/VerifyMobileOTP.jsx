import { directorApi } from '@/api/director/directorApi';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import Slot from '@/components/ui/Slot';
import { LocalStorageService } from '@/lib/utils';
import { directorInviteList } from '@/services/Director_Services/DirectorServices';
import { userVerifyOtp } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OTPInput } from 'input-otp';
import { ArrowLeft, Clock5 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const VerifyMobileOTP = ({ setMobileLoginStep }) => {
  const router = useRouter();

  const queryClient = useQueryClient();

  const [startFrom, setStartFrom] = useState(30);
  const [otp, setOtp] = useState();
  const userId = LocalStorageService.get('user_profile');
  const userMobileNumber = LocalStorageService.get('user_mobile_number');
  const operationType = LocalStorageService.get('operation_type');
  const invitationData = LocalStorageService.get('invitationData');

  useEffect(() => {
    const timer = setInterval(() => {
      setStartFrom((prevStartFrom) => prevStartFrom - 1);
    }, 1000);

    return () => clearInterval(timer);
  });

  const mutation = useMutation({
    mutationFn: (data) => userVerifyOtp(data),
    onSuccess: async (data) => {
      LocalStorageService.set('token', data?.data?.data?.access_token);
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

      // check by calling api : directorInviteList
      const directorInviteListData = await queryClient.fetchQuery({
        queryKey: [directorApi.getDirectorInviteList.endpointKey],
        queryFn: directorInviteList,
      });

      const isUserHaveValidDirectorInvites =
        directorInviteListData?.data?.data?.length > 0;

      toast.success('OTP verified successfully');

      // 1. isUserOnboardingComplete && isInviteAsClient
      if (
        data?.data?.data?.user?.isOnboardingComplete &&
        invitationData?.data?.id
      ) {
        router.push('/login/confirmation_invite_as_client');
      }
      // 2. isUserOnboardingComplete && !isInviteAsClient && isUserHaveValidDirectorInvites
      else if (
        data?.data?.data?.user?.isOnboardingComplete &&
        !invitationData?.data?.id &&
        isUserHaveValidDirectorInvites
      ) {
        router.push('/login/select_enterprise');
      }
      // 3. isUserOnboardingComplete && !isInviteAsClient && !isUserHaveValidDirectorInvites && !isEnterpriseOnboardingComplete
      else if (
        data?.data?.data?.user?.isOnboardingComplete &&
        !invitationData?.data?.id &&
        !isUserHaveValidDirectorInvites &&
        !data?.data?.data?.user?.isEnterpriseOnboardingComplete
      ) {
        router.push('/login/enterpriseOnboardingSearch');
      }
      // 4. isUserOnboardingComplete && !isInviteAsClient && !isUserHaveValidDirectorInvites && isEnterpriseOnboardingComplete
      else if (
        data?.data?.data?.user?.isOnboardingComplete &&
        !invitationData?.data?.id &&
        !isUserHaveValidDirectorInvites &&
        data?.data?.data?.user?.isEnterpriseOnboardingComplete
      ) {
        router.push('/');
      }
      // 5. !isUserOnboardingComplete
      else {
        router.push('/login/userOnboarding');
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'OTP Invalid or Expired');
    },
  });

  const handleChangeOtp = (value) => {
    setOtp(value);
  };

  const handleVerifiyOTP = (e) => {
    e.preventDefault();
    mutation.mutate({
      otpCode: otp,
      userId,
      operationType,
      data: invitationData ? invitationData.data.invitation : invitationData,
    });
  };

  return (
    <form
      onSubmit={handleVerifiyOTP}
      className="flex h-[400px] w-[450px] flex-col items-center justify-start gap-10"
    >
      <div className="flex flex-col gap-4">
        <h2 className="w-full text-center text-2xl font-bold">
          Verify your number
        </h2>
        <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
          An one time OTP has been sent to <span>+91 {userMobileNumber}</span>
        </p>
      </div>

      <OTPInput
        name="otp"
        onChange={handleChangeOtp}
        maxLength={4}
        value={otp}
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
        Resend OTP in{' '}
        <span className="flex items-center gap-1 font-semibold">
          {startFrom >= 0 ? (
            <p className="flex items-center gap-1">
              <Clock5 size={15} />
              00:{startFrom}s
            </p>
          ) : (
            <Button size="sm" variant="outline" disabled>
              Resend
            </Button>
          )}
        </span>
      </p>
      <Button size="sm" type="Submit" className="w-full bg-[#288AF9] p-2">
        {mutation.isPending ? <Loading /> : 'Verify'}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="w-full p-2"
        onClick={() => setMobileLoginStep(1)}
      >
        <ArrowLeft size={14} />
        Back
      </Button>
    </form>
  );
};

export default VerifyMobileOTP;
