'use client';

import { directorApi } from '@/api/director/directorApi';
import { userAuth } from '@/api/user_auth/Users';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
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
  const logIninvitationData = LocalStorageService.get('invitationData');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const isKycVerified = LocalStorageService.get('isKycVerified');
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isDirector = LocalStorageService.get('isDirector');
  const isAssociateRequestCreated = LocalStorageService.get(
    'isAssociateRequestCreated',
  );
  const isAssociateRequestAccepted = LocalStorageService.get(
    'isAssociateRequestAccepted',
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

      const isCurrEnterpriseInvitationExist =
        directorInviteListData?.data?.data?.some(
          (directorInvite) =>
            directorInvite.fromEnterprise.id.toString() ===
            enterpriseId.toString(),
        );

      toast.success('Your Profile Completed & Verified');

      // user & enterprise partial/not onboarded in platform
      if (!isKycVerified || !isEnterpriseOnboardingComplete) {
        // --onboard with Invitaion Link?
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
          }
          // isInviteAsAssociate
          else {
            router.push('/login/confirmation_invite_as_associate');
          }
        }

        // --direct onboard without invitation link :
        // if user have director invites and enterprise not present in platform
        else if (isUserHaveValidDirectorInvites && !enterpriseId) {
          router.push('/login/select_enterprise');
        }
        // if user have director invites and curr enterprise present in platform && !isEnterpriseOnboardingComplete
        else if (
          isUserHaveValidDirectorInvites &&
          enterpriseId &&
          isCurrEnterpriseInvitationExist &&
          !isEnterpriseOnboardingComplete
        ) {
          router.push('/login/din');
        }
        // if user have director invites and curr enterprise present in platform && isEnterpriseOnboardingCompleted
        else if (
          isUserHaveValidDirectorInvites &&
          enterpriseId &&
          isCurrEnterpriseInvitationExist &&
          isEnterpriseOnboardingComplete
        ) {
          const redirectUrl = LocalStorageService.get('redirectUrl');
          LocalStorageService.remove('redirectUrl'); // Clear the redirect URL
          router.push(redirectUrl || '/');
        }
        // if user have not director invites && enterprise already present in platform && user is an associate && user does not have associate request
        else if (
          !isUserHaveValidDirectorInvites &&
          enterpriseId &&
          !isDirector &&
          !isAssociateRequestCreated
        ) {
          router.push('/login/isDirector');
        }
        // if user have not director invites && enterprise already present in platform && user is an associate && user have associate request but not approved yet
        else if (
          !isUserHaveValidDirectorInvites &&
          enterpriseId &&
          !isDirector &&
          isAssociateRequestCreated &&
          !isAssociateRequestAccepted
        ) {
          router.push('/login/requested_approval');
        }
        // if user have not director invites && enterprise already present in platform && user is an associate && user have associate request and approved and kyc verified
        else if (
          !isUserHaveValidDirectorInvites &&
          enterpriseId &&
          !isDirector &&
          isAssociateRequestCreated &&
          isAssociateRequestAccepted &&
          isKycVerified
        ) {
          const redirectUrl = LocalStorageService.get('redirectUrl');
          LocalStorageService.remove('redirectUrl'); // Clear the redirect URL
          router.push(redirectUrl || '/');
        }
        // if user have not director invites && enterprise already present in platform && user is an associate && user have associate request and approved but kyc is pending
        else if (
          !isUserHaveValidDirectorInvites &&
          enterpriseId &&
          !isDirector &&
          isAssociateRequestCreated &&
          isAssociateRequestAccepted &&
          !isKycVerified
        ) {
          router.push('/login/kyc');
        }

        // if user have not director invites && enterprise is not present in platform
        else if (!isUserHaveValidDirectorInvites && !enterpriseId) {
          router.push('/login/enterpriseOnboardingSearch');
        }
        // if user have not director invites && enterprise is present in platform && user is director && kyc is not verified yet
        else if (
          !isUserHaveValidDirectorInvites &&
          enterpriseId &&
          isDirector &&
          !isKycVerified
        ) {
          router.push('/login/kyc');
        }
        // if user have not director invites && enterprise is present in platform && user is director && kyc is verified
        else if (
          !isUserHaveValidDirectorInvites &&
          enterpriseId &&
          isDirector &&
          isKycVerified
        ) {
          const redirectUrl = LocalStorageService.get('redirectUrl');
          LocalStorageService.remove('redirectUrl'); // Clear the redirect URL
          router.push(redirectUrl || '/');
        }
      }
      // user & enterprise both onboarded in platform
      else {
        const redirectUrl = LocalStorageService.get('redirectUrl');
        LocalStorageService.remove('redirectUrl'); // Clear the redirect URL
        router.push(redirectUrl || '/');
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
      <Button
        size="sm"
        type="Submit"
        className="w-full bg-[#288AF9] p-2"
        disabled={verifyMailOTPMutation.isPending}
      >
        {verifyMailOTPMutation.isPending ? <Loading /> : 'Verify'}
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
