'use client';

import { userAuth } from '@/api/user_auth/Users';
import { apiErrorHandler } from '@/appUtils/apiErrorHandler';
import ExplantoryText from '@/components/auth/ExplantoryText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { cinVerify } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const CINVerificationPage = () => {
  const translations = useTranslations('auth.enterprise.cinVerify');
  const translationsAPIErrors = useTranslations('auth.apiErrorsOnboarding');
  const router = useRouter();
  const userId = LocalStorageService.get('user_profile');
  const tempEnterpriseId = LocalStorageService.get('tempEnterpriseId');
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [enterpriseData, setEnterpriseData] = useState({
    cinOrLlpin: '',
    enterpriseId: tempEnterpriseId ?? enterpriseId,
    userId,
  });

  // fetching cin from localStorage and set in states
  useEffect(() => {
    const cin =
      LocalStorageService.get('companyData')?.company_data?.cin ||
      LocalStorageService.get('companyData')?.cin ||
      LocalStorageService.get('companyData')?.cin_number;

    setEnterpriseData((prev) => ({
      ...prev,
      cinOrLlpin: cin,
    }));
  }, []);

  const verifyCINMutation = useMutation({
    mutationKey: [userAuth.cinVerify.mutationKey],
    mutationFn: cinVerify,
    onSuccess: (data) => {
      toast.success(translations('toast.success'));
      const { enterpriseId, isDirector } = data.data.data;
      LocalStorageService.set('enterprise_Id', enterpriseId);
      // LocalStorageService.set('gst', data?.data?.data?.gstData?.gstinResList);

      // if din matched
      if (isDirector) {
        router.push('/login/enterprise/gst-verify');
      } else {
        router.push('/login/enterprise/invite-director');
      }
    },
    onError: (error) => {
      const customError = apiErrorHandler(error);
      toast.error(translationsAPIErrors(customError));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyCINMutation.mutate(enterpriseData); // api call
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex min-h-[500px] w-[450px] flex-col items-center justify-center gap-10 rounded-md">
        <div className="flex flex-col gap-4">
          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            {translations('title')}
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            {translations('subtitle')}
          </p>
        </div>

        <form
          className="grid w-full items-center gap-5"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="cin" className="font-medium text-[#121212]">
              {translations('label')}
            </Label>
            <div className="flex items-center hover:border-gray-600">
              <Input
                type="text"
                name="cin"
                placeholder={translations('placeholder')}
                className="uppercase focus:font-bold"
                value={enterpriseData.cinOrLlpin}
                disabled
              />
            </div>
          </div>

          {/* Explanatory Information */}
          <ExplantoryText text={translations('information')} />

          <Button
            size="sm"
            type="submit"
            disabled={verifyCINMutation.isPending}
          >
            {verifyCINMutation.isPending ? (
              <Loading />
            ) : (
              translations('button.verify')
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft size={14} />
            {translations('button.back')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CINVerificationPage;
