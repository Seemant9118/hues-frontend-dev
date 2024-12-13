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
  const logIninvitationData = LocalStorageService.get('invitationData');

  useEffect(() => {
    const timer = setInterval(() => {
      setStartFrom((prevStartFrom) => prevStartFrom - 1);
    }, 1000);

    return () => clearInterval(timer);
  });

  const mutation = useMutation({
    mutationFn: (data) => userVerifyOtp(data),
    onSuccess: async (data) => {
      // set refresh token
      LocalStorageService.set('refreshtoken', data?.data?.data?.refresh_token);
      // set access token
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

      LocalStorageService.set('isDirector', data?.data?.data?.user?.isDirector);

      LocalStorageService.set(
        'isAssociateRequestCreated',
        data?.data?.data?.user?.isAssociateRequestCreated,
      );

      LocalStorageService.set(
        'isAssociateRequestAccepted',
        data?.data?.data?.user?.isAssociateRequestAccepted,
      );

      // check by calling api : directorInviteList
      const directorInviteListData = await queryClient.fetchQuery({
        queryKey: [directorApi.getDirectorInviteList.endpointKey],
        queryFn: directorInviteList,
      });

      const isUserHaveValidDirectorInvites =
        directorInviteListData?.data?.data?.length > 0;

      const isCurrEnterpriseInvitationExist =
        directorInviteListData?.data?.data?.some(
          (directorInvite) =>
            directorInvite.fromEnterprise.id.toString() ===
            data?.data?.data?.user?.enterpriseId.toString(),
        );

      toast.success('OTP verified successfully');

      // isuserOnboardingComplete
      if (data?.data?.data?.user?.isOnboardingComplete) {
        // onboard with Invitaion Link?
        if (logIninvitationData) {
          // isInviteAsClientOrVendor
          if (
            logIninvitationData?.data?.invitation?.invitationType ===
              'CLIENT' ||
            logIninvitationData?.data?.invitation?.invitationType === 'VENDOR'
          ) {
            router.push('/login/confirmation_invite_as_client');
          }
          // isInviteAsDirector
          else if (
            logIninvitationData?.data?.invitation?.invitationType ===
              'DIRECTOR' &&
            isUserHaveValidDirectorInvites
          ) {
            router.push('/login/confirmation_invite_as_director');
            // router.push('/login/select_enterprise');
          }
          // isInviteAsAssociate
          else {
            router.push('/login/confirmation_invite_as_associate');
          }
        }

        // direct onboard without invitation link :
        // if user have director invites and enterprise not present in platform
        else if (
          isUserHaveValidDirectorInvites &&
          !data?.data?.data?.user?.enterpriseId
        ) {
          router.push('/login/select_enterprise');
        }
        // if user have director invites and curr enterprise present in platform && !isEnterpriseOnboardingComplete
        else if (
          isUserHaveValidDirectorInvites &&
          data?.data?.data?.user?.enterpriseId &&
          isCurrEnterpriseInvitationExist &&
          !data?.data?.data?.user?.isEnterpriseOnboardingComplete
        ) {
          router.push('/login/din');
        }
        // if user have director invites and curr enterprise present in platform && isEnterpriseOnboardingCompleted
        else if (
          isUserHaveValidDirectorInvites &&
          data?.data?.data?.user?.enterpriseId &&
          isCurrEnterpriseInvitationExist &&
          data?.data?.data?.user?.isEnterpriseOnboardingComplete
        ) {
          const redirectUrl = LocalStorageService.get('redirectUrl');
          LocalStorageService.remove('redirectUrl'); // Clear the redirect URL
          router.push(redirectUrl || '/');
        }
        // if user have not director invites && enterprise already present in platform && user is an associate && user does not have associate request
        else if (
          !isUserHaveValidDirectorInvites &&
          data?.data?.data?.user?.enterpriseId &&
          !data?.data?.data?.user?.isDirector &&
          !data?.data?.data?.user?.isAssociateRequestCreated
        ) {
          router.push('/login/isDirector');
        }
        // if user have not director invites && enterprise already present in platform && user is an associate && user have associate request but not approved yet
        else if (
          !isUserHaveValidDirectorInvites &&
          data?.data?.data?.user?.enterpriseId &&
          !data?.data?.data?.user?.isDirector &&
          data?.data?.data?.user?.isAssociateRequestCreated &&
          !data?.data?.data?.user?.isAssociateRequestAccepted
        ) {
          router.push('/login/requested_approval');
        }
        // if user have not director invites && enterprise already present in platform && user is an associate && user have associate request and approved and kyc verified
        else if (
          !isUserHaveValidDirectorInvites &&
          data?.data?.data?.user?.enterpriseId &&
          !data?.data?.data?.user?.isDirector &&
          data?.data?.data?.user?.isAssociateRequestCreated &&
          data?.data?.data?.user?.isAssociateRequestAccepted &&
          data?.data?.data?.user?.isKycVerified
        ) {
          const redirectUrl = LocalStorageService.get('redirectUrl');
          LocalStorageService.remove('redirectUrl'); // Clear the redirect URL
          router.push(redirectUrl || '/');
        }
        // if user have not director invites && enterprise already present in platform && user is an associate && user have associate request and approved but kyc is pending
        else if (
          !isUserHaveValidDirectorInvites &&
          data?.data?.data?.user?.enterpriseId &&
          !data?.data?.data?.user?.isDirector &&
          data?.data?.data?.user?.isAssociateRequestCreated &&
          data?.data?.data?.user?.isAssociateRequestAccepted &&
          !data?.data?.data?.user?.isKycVerified
        ) {
          router.push('/login/kyc');
        }
        // if user have not director invites && enterprise is not present in platform
        else if (
          !isUserHaveValidDirectorInvites &&
          !data?.data?.data?.user?.enterpriseId
        ) {
          router.push('/login/enterpriseOnboardingSearch');
        }
        // if user have not director invites && enterprise is present in platform && user is director && kyc is not verified yet
        else if (
          !isUserHaveValidDirectorInvites &&
          data?.data?.data?.user?.enterpriseId &&
          data?.data?.data?.user?.isDirector &&
          !data?.data?.data?.user?.isKycVerified
        ) {
          router.push('/login/kyc');
        }
        // if user have not director invites && enterprise is present in platform && user is director && kyc is verified
        else if (
          !isUserHaveValidDirectorInvites &&
          data?.data?.data?.user?.enterpriseId &&
          data?.data?.data?.user?.isDirector &&
          data?.data?.data?.user?.isKycVerified
        ) {
          const redirectUrl = LocalStorageService.get('redirectUrl');
          LocalStorageService.remove('redirectUrl'); // Clear the redirect URL
          router.push(redirectUrl || '/');
        }
      } else {
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
      data: logIninvitationData
        ? logIninvitationData.data.invitation
        : logIninvitationData,
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
