'use client';

import { apiErrorHandler } from '@/appUtils/apiErrorHandler';
import { useAuthProgress } from '@/context/AuthProgressContext';
import { UserProvider } from '@/context/UserContext';
import { useUserData } from '@/context/UserDataContext';
import { LocalStorageService } from '@/lib/utils';
import {
  userUpdate,
  validateAadharNumber,
} from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AadharNumberDetail from '../../multi-step-forms/aadharVerificationComponents/AadharNumberDetail';

const AadharVerificationPage = () => {
  const translationsAPIErrors = useTranslations('auth.apiErrorsOnboarding');
  const translations = useTranslations('auth.aadharVerification');
  // context
  const { updateAuthProgress } = useAuthProgress();
  const { userData } = useUserData();
  const router = useRouter();
  const [enterpriseDetails, setEnterpriseDetails] = useState(null);
  const [aadharNumber, setAadharNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEnterpriseDetails(
      LocalStorageService.get('enterpriseDetails') || userData,
    );
  }, []);

  // user update mutation
  const userUpdateMutation = useMutation({
    mutationFn: (data) => userUpdate(data),
    onSuccess: (data) => {
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
        'isEmailVerified',
        data?.data?.data?.user?.isEmailVerified,
      );
      LocalStorageService.set(
        'isEnterpriseOnboardingComplete',
        data?.data?.data?.user?.isEnterpriseOnboardingComplete,
      );

      LocalStorageService.remove('enterpriseDetails');
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translations('toast.generic_error'),
      );
    },
    retry: (failureCount, error) => {
      return error.response.status === 401;
    },
  });

  const validateAadharAndUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true); // Enable loading state

    try {
      const response = await validateAadharNumber({
        aadhaar: aadharNumber,
      });

      if (response?.status === 201) {
        // Ensure the response indicates success
        toast.success(
          translations('steps.verifyAadharNum.success.otp_verified'),
        );

        await userUpdateMutation.mutateAsync(enterpriseDetails); // Await the mutation if needed
        router.push('/login/user/confirmation');
        updateAuthProgress('isAadhaarVerified', true);
      } else {
        const customError = apiErrorHandler(response.error);
        toast.error(translationsAPIErrors(customError));
      }
    } catch (error) {
      const customError = apiErrorHandler(error);
      toast.error(translationsAPIErrors(customError));
    } finally {
      setLoading(false); // Disable loading state
    }
  };

  return (
    <UserProvider>
      <div className="flex h-full flex-col items-center pt-20">
        <AadharNumberDetail
          aadharNumber={aadharNumber}
          setAadharNumber={setAadharNumber}
          loading={loading}
          validateAadharAndUpdateUser={validateAadharAndUpdateUser}
          translations={translations}
        />
      </div>
    </UserProvider>
  );
};

export default AadharVerificationPage;
