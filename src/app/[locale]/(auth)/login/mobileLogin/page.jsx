/* eslint-disable no-lonely-if */

'use client';

import { directorApi } from '@/api/director/directorApi';
import { handleOtpRedirection } from '@/appUtils/onboardingRedirectionLogics';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { directorInviteList } from '@/services/Director_Services/DirectorServices';
import {
  userGenerateOtp,
  userVerifyOtp,
} from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import React, { Suspense, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import MobileLogin from '../multi-step-forms/mobileLoginOTPComponents/MobileLogin';
import VerifyMobileOTP from '../multi-step-forms/mobileLoginOTPComponents/VerifyMobileOTP';

const MobileLoginPage = () => {
  const translations = useTranslations('auth.mobileLogin');

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
      // LocalStorageService.set('invitationData', data.data.data.invitationData);
      toast.success(translations('toast.otpSent'));

      if (mobileLoginStep === 1) {
        setMobileLoginStep(2);
      }
    },
    onError: () => {
      setErrorMsg(translations('toast.failedToSendOtp'));
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: (data) => userVerifyOtp(data),
    // eslint-disable-next-line consistent-return
    onSuccess: async (data) => {
      const redirectedUrl = LocalStorageService.get('redirectUrl');
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

      toast.success(translations('toast.otpVerifiedSuccess'));

      await handleOtpRedirection({
        isOnboardingComplete,
        isPanVerified,
        isAadhaarVerified,
        isEnterprisestartedOnboarding,
        isEnterpriseOnboardingComplete,
        islogInWithInviteLink,
        isUserHaveValidDirectorInvites,
        redirectedUrl,
        router,
      });
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translations('toast.otpInvalid'),
      );
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
            translations={translations}
          />
        )}
        {mobileLoginStep === 2 && (
          <VerifyMobileOTP
            setMobileLoginStep={setMobileLoginStep}
            formDataWithMob={formDataWithMob}
            generateOTPMutation={generateOTPMutation}
            verifyOTPMutation={verifyOTPMutation}
            translations={translations}
          />
        )}
      </div>
    </Suspense>
  );
};

export default MobileLoginPage;
