/* eslint-disable no-lonely-if */

'use client';

import { directorApi } from '@/api/director/directorApi';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { directorInviteList } from '@/services/Director_Services/DirectorServices';
import {
  userGenerateOtp,
  userVerifyOtp,
} from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React, { Suspense, useState } from 'react';
import { toast } from 'sonner';
import MobileLogin from '../multi-step-forms/mobileLoginOTPComponents/MobileLogin';
import VerifyMobileOTP from '../multi-step-forms/mobileLoginOTPComponents/VerifyMobileOTP';

const MobileLoginPage = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [mobileLoginStep, setMobileLoginStep] = useState(1);
  const [formDataWithMob, setFormDataWithMob] = useState({
    mobileNumber: '',
    countryCode: '+91',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const islogInWithInviteLink = LocalStorageService.get('invitationData');

  const generateOTPMutation = useMutation({
    mutationFn: (data) => userGenerateOtp(data),
    onSuccess: (data) => {
      LocalStorageService.set('user_profile', data.data.data.userId);
      LocalStorageService.set(
        'user_mobile_number',
        formDataWithMob.mobileNumber,
      );
      LocalStorageService.set('operation_type', data.data.data.operation_type);
      LocalStorageService.set('invitationData', data.data.data.invitationData);
      toast.success(data.data.message);

      if (mobileLoginStep === 1) {
        setMobileLoginStep(2);
      }
    },
    onError: () => {
      setErrorMsg('Failed to send OTP');
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: (data) => userVerifyOtp(data),
    // eslint-disable-next-line consistent-return
    onSuccess: async (data) => {
      // set refresh token
      LocalStorageService.set('refreshtoken', data?.data?.data?.refresh_token);
      // set access token
      LocalStorageService.set('token', data?.data?.data?.access_token);

      const {
        isOnboardingComplete,
        isPanVerified,
        isAadhaarVerified,
        remainingAttempts,
        isEnterprisestartedOnboarding,
        enterpriseId,
        isEnterpriseOnboardingComplete,
        isAssociateRequestCreated,
        isAssociateRequestAccepted,
      } = data.data.data.user;

      // user onboarding related states
      LocalStorageService.set('isOnboardingComplete', isOnboardingComplete);
      LocalStorageService.set('isPanVerified', isPanVerified);
      LocalStorageService.set('isAadhaarVerified', isAadhaarVerified);
      LocalStorageService.set('attemptsRemaining', remainingAttempts);

      // enterprise onboarding related states
      LocalStorageService.set(
        'isEnterprisestartedOnboarding',
        isEnterprisestartedOnboarding,
      );
      LocalStorageService.set('enterprise_Id', enterpriseId);
      LocalStorageService.set(
        'isEnterpriseOnboardingComplete',
        isEnterpriseOnboardingComplete,
      );
      LocalStorageService.set(
        'isAssociateRequestCreated',
        isAssociateRequestCreated,
      );
      LocalStorageService.set(
        'isAssociateRequestAccepted',
        isAssociateRequestAccepted,
      );
      LocalStorageService.set('isDirector', data?.data?.data?.user?.isDirector);

      // check by calling api : directorInviteList
      const directorInviteListData = await queryClient.fetchQuery({
        queryKey: [directorApi.getDirectorInviteList.endpointKey],
        queryFn: directorInviteList,
      });
      const isUserHaveValidDirectorInvites =
        directorInviteListData?.data?.data?.length > 0;

      toast.success('OTP verified successfully');

      // isUserOnboardingComplete
      if (isOnboardingComplete) {
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
          if (isEnterprisestartedOnboarding && isEnterpriseOnboardingComplete) {
            return router.push('/');
          } else if (
            isEnterprisestartedOnboarding &&
            !isEnterpriseOnboardingComplete
          ) {
            // enterprise onboarding started and but not completed perform pending actions
            return router.push('/login/enterprise/pending-actions');
          } else {
            return router.push('/login/user/confirmation');
          }
        }
      }
      // User onboarding is incomplete
      else {
        // isPanverified and aaadhar verified then move to confirmation
        if (isPanVerified && isAadhaarVerified) {
          return router.push('/login/user/confirmation');
        }
        // isPanverified and !aadhar not verified then move to aadhar
        else if (isPanVerified && !isAadhaarVerified) {
          return router.push('/login/user/aadhar-verification');
        } else {
          return router.push('/login/user/pan-verification');
        }
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'OTP Invalid or Expired');
    },
  });

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex h-full items-center justify-center">
        {mobileLoginStep === 1 && (
          <MobileLogin
            setMobileLoginStep={setMobileLoginStep}
            formDataWithMob={formDataWithMob}
            setFormDataWithMob={setFormDataWithMob}
            errorMsg={errorMsg}
            setErrorMsg={setErrorMsg}
            generateOTPMutation={generateOTPMutation}
          />
        )}
        {mobileLoginStep === 2 && (
          <VerifyMobileOTP
            setMobileLoginStep={setMobileLoginStep}
            formDataWithMob={formDataWithMob}
            generateOTPMutation={generateOTPMutation}
            verifyOTPMutation={verifyOTPMutation}
          />
        )}
      </div>
    </Suspense>
  );
};

export default MobileLoginPage;
