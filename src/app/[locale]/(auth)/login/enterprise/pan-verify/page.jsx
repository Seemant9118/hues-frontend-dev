'use client';

import { userAuth } from '@/api/user_auth/Users';
import { apiErrorHandler } from '@/appUtils/apiErrorHandler';
import { validatePan } from '@/appUtils/ValidationUtils';
import ErrorInfoBanner from '@/components/auth/ErrorInfoBanner';
import ExplantoryText from '@/components/auth/ExplantoryText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { UserProvider } from '@/context/UserContext';
import { LocalStorageService } from '@/lib/utils';
import {
  getEnterpriseDetailsForPanVerify,
  getUserById,
} from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const EnterprisePANVerifyPage = () => {
  const translations = useTranslations('auth.enterprise.panVerify');
  const translationsAPIErrors = useTranslations('auth.apiErrorsOnboarding');
  const translationsForError = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const enterpriseType = searchParams.get('type');
  const userId = LocalStorageService.get('user_profile');

  const [enterpriseOnboardData, setEnterpriseOnboardData] = useState({
    panNumber: '',
    type: enterpriseType,
  });
  const [errorMsg, setErrorMsg] = useState('');

  const { data: userData, isSuccess } = useQuery({
    queryKey: [userAuth.getUserById.endpointKey, userId],
    queryFn: () => getUserById(userId),
    select: (data) => data.data.data,
    enabled:
      enterpriseType === 'proprietorship' || enterpriseType === 'individual',
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setEnterpriseOnboardData((prev) => ({
      ...prev,
      panNumber:
        enterpriseType === 'proprietorship' || enterpriseType === 'individual'
          ? userData?.panNumber
          : '', // Clears panNumber if enterpriseType is changed
    }));
  }, [isSuccess, enterpriseType, userData]);

  // Handle input change
  const handleChangePan = useCallback((e) => {
    const panValue = e.target.value.toUpperCase();
    setEnterpriseOnboardData((prev) => ({ ...prev, panNumber: panValue }));

    const errors = validatePan(panValue);
    setErrorMsg(errors);
  }, []);

  const getDetailsByPanVerifiedMutation = useMutation({
    mutationKey: [userAuth.getEnterpriseDetailsForPanVerify.endpointKey],

    mutationFn: async (payload) => {
      try {
        return await getEnterpriseDetailsForPanVerify(payload);
      } catch (error) {
        // Prevent Next.js dev overlay (VERY IMPORTANT)
        return Promise.reject(error);
      }
    },

    onSuccess: (data) => {
      toast.success(translations('toast.success'));

      const { enterpriseId, gstData, companyDetails } = data.data.data;

      LocalStorageService.set('enterprise_Id', enterpriseId);
      LocalStorageService.set('gst', gstData?.gstinResList);

      if (
        enterpriseType === 'proprietorship' ||
        enterpriseType === 'individual'
      ) {
        router.push('/login/enterprise/gst-verify');
      } else {
        LocalStorageService.set('companyData', companyDetails);
        router.push(
          `/login/enterprise/cin-verify?type=${enterpriseOnboardData.type}`,
        );
      }
    },
    onError: (error) => {
      // Proprietorship / Individual: show error
      if (
        enterpriseType === 'proprietorship' ||
        enterpriseType === 'individual'
      ) {
        const customError = apiErrorHandler(error);
        setErrorMsg(translationsAPIErrors(customError));
        return;
      }

      // Non-proprietorship cases: NO error shown, just redirect
      LocalStorageService.set('enterprisePAN', enterpriseOnboardData.panNumber);
      router.push(
        `/login/enterprise/cin-verify?type=${enterpriseOnboardData.type}`,
      );
    },
  });

  // Handle form submission
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const errors = validatePan(enterpriseOnboardData.panNumber);
      if (errors) {
        setErrorMsg(errors);
        return;
      }

      setErrorMsg('');
      getDetailsByPanVerifiedMutation.mutate(enterpriseOnboardData);
    },
    [enterpriseOnboardData.panNumber],
  );

  // Navigate back
  const handleBack = () =>
    router.push('/login/enterprise/select_enterprise_type');

  return (
    <UserProvider>
      <div className="flex h-full items-center justify-center">
        <div className="flex min-h-[500px] w-[450px] flex-col items-center justify-center gap-6 rounded-md">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <h1 className="text-center text-2xl font-bold text-[#121212]">
              {translations('title')}
            </h1>
            <p className="text-center text-sm font-semibold text-[#A5ABBD]">
              {translations('subtitle')}
            </p>
          </div>

          {getDetailsByPanVerifiedMutation.isError && (
            <ErrorInfoBanner govermentDoc="PAN" />
          )}

          {/* Form */}
          <form
            className="grid w-full items-center gap-5"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="pan-number"
                className="font-medium text-[#121212]"
              >
                {translations('pan.label')}{' '}
                <span className="text-red-600">*</span>
              </Label>
              <div className="flex items-center hover:border-gray-600">
                <Input
                  id="pan-number"
                  type="text"
                  name="pan"
                  placeholder="ABCDE1234F"
                  className="uppercase focus:font-bold"
                  onChange={handleChangePan}
                  value={enterpriseOnboardData.panNumber}
                  disabled={
                    enterpriseType === 'proprietorship' ||
                    enterpriseType === 'individual'
                  }
                />
              </div>
              {errorMsg && (
                <span className="px-1 text-sm font-semibold text-red-600">
                  {translationsForError(errorMsg)}
                </span>
              )}
            </div>

            <div className="flex w-full flex-col gap-2">
              {/* Explanatory Information */}
              <ExplantoryText text={translations('information')} />
              <Button
                size="sm"
                type="submit"
                disabled={getDetailsByPanVerifiedMutation?.isPending}
              >
                {getDetailsByPanVerifiedMutation?.isPending ? (
                  <Loading />
                ) : (
                  translations('button.proceed')
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft size={14} />
                {translations('button.back')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </UserProvider>
  );
};

export default EnterprisePANVerifyPage;
