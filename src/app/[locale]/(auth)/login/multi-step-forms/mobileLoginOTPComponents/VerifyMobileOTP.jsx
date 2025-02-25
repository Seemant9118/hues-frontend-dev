/* eslint-disable no-lonely-if */
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
  const queryClient = useQueryClient();
  const router = useRouter();
  const [startFrom, setStartFrom] = useState(30);
  const [otp, setOtp] = useState();

  const userId = LocalStorageService.get('user_profile');
  const userMobileNumber = LocalStorageService.get('user_mobile_number');
  const operationType = LocalStorageService.get('operation_type');
  const islogInWithInviteLink = LocalStorageService.get('invitationData');

  useEffect(() => {
    const timer = setInterval(() => {
      setStartFrom((prevStartFrom) => prevStartFrom - 1);
    }, 1000);

    return () => clearInterval(timer);
  });

  const mutation = useMutation({
    mutationFn: (data) => userVerifyOtp(data),
    // eslint-disable-next-line consistent-return
    onSuccess: async (data) => {
      // set refresh token
      LocalStorageService.set('refreshtoken', data?.data?.data?.refresh_token);
      // set access token
      LocalStorageService.set('token', data?.data?.data?.access_token);
      // user onboarding related states
      LocalStorageService.set(
        'isOnboardingComplete',
        data?.data?.data?.user?.isOnboardingComplete,
      );
      LocalStorageService.set(
        'isPanVerified',
        data?.data?.data?.user?.isPanVerified,
      );
      LocalStorageService.set(
        'isAadhaarVerified',
        data?.data?.data?.user?.isAadhaarVerified,
      );
      LocalStorageService.set(
        'attemptsRemaining',
        data?.data?.data?.user?.remainingAttempts,
      );

      // enterprise onboarding related states
      LocalStorageService.set(
        'isEnterprisestartedOnboarding',
        data?.data?.data?.user?.isEnterprisestartedOnboarding,
      );
      LocalStorageService.set(
        'enterprise_Id',
        data?.data?.data?.user?.enterpriseId,
      );
      LocalStorageService.set(
        'isEnterpriseOnboardingComplete',
        data?.data?.data?.user?.isEnterpriseOnboardingComplete,
      );
      LocalStorageService.set(
        'isAssociateRequestCreated',
        data?.data?.data?.user?.isAssociateRequestCreated,
      );
      LocalStorageService.set(
        'isAssociateRequestAccepted',
        data?.data?.data?.user?.isAssociateRequestAccepted,
      );

      // LocalStorageService.set(
      //   'isKycVerified',
      //   data?.data?.data?.user?.isKycVerified,
      // );

      LocalStorageService.set('isDirector', data?.data?.data?.user?.isDirector);

      // check by calling api : directorInviteList
      const directorInviteListData = await queryClient.fetchQuery({
        queryKey: [directorApi.getDirectorInviteList.endpointKey],
        queryFn: directorInviteList,
      });
      const isUserHaveValidDirectorInvites =
        directorInviteListData?.data?.data?.length > 0;

      // const isCurrEnterpriseInvitationExist =
      //   directorInviteListData?.data?.data?.some(
      //     (directorInvite) =>
      //       directorInvite.fromEnterprise.id.toString() ===
      //       data?.data?.data?.user?.enterpriseId.toString(),
      //   );

      toast.success('OTP verified successfully');

      // isUserOnboardingComplete
      if (data?.data?.data?.user?.isOnboardingComplete) {
        // is logInWithInviteLink
        if (islogInWithInviteLink) {
          if (
            islogInWithInviteLink?.data?.invitation?.invitationType ===
              'CLIENT' ||
            islogInWithInviteLink?.data?.invitation?.invitationType === 'VENDOR'
          ) {
            router.push('/login/enterprise/select_enterprise_type');
          } else if (
            islogInWithInviteLink?.data?.invitation?.invitationType ===
              'DIRECTOR' &&
            isUserHaveValidDirectorInvites
          ) {
            router.push('/login/confirmation_invite_as_director');
          } else {
            router.push('/login/confirmation_invite_as_associate');
          }
        }
        // is not logInWithInviteLink
        else {
          if (
            data?.data?.data?.user?.isEnterprisestartedOnboarding &&
            data?.data?.data?.user?.isEnterpriseOnboardingComplete
          ) {
            return router.push('/');
          } else if (
            data?.data?.data?.user?.isEnterprisestartedOnboarding &&
            !data?.data?.data?.user?.isEnterpriseOnboardingComplete
          ) {
            // enterprise onboarding started and but not completed perform pending actions
            return router.push('/login/enterprise/pending-actions');
          } else {
            return router.push('/login/confirmation');
          }
        }
      }
      // User onboarding is incomplete
      else {
        // isPanverified and aaadhar verified then move to confirmation
        if (
          data?.data?.data?.user?.isPanVerified &&
          data?.data?.data?.user?.isAadhaarVerified
        ) {
          return router.push('/login/confirmation');
        }
        // isPanverified and !aadhar not verified then move to aadhar
        else if (
          data?.data?.data?.user?.isPanVerified &&
          !data?.data?.data?.user?.isAadhaarVerified
        ) {
          return router.push('/login/aadhar-verification');
        } else {
          return router.push('/login/pan-verification');
        }
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
      data: islogInWithInviteLink
        ? islogInWithInviteLink.data.invitation
        : islogInWithInviteLink,
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStartFrom(30)}
            >
              Resend
            </Button>
          )}
        </span>
      </p>
      <Button
        size="sm"
        type="Submit"
        className="w-full bg-[#288AF9] p-2"
        disabled={mutation.isPending}
      >
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
