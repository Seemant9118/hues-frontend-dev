'use client';

import { userAuth } from '@/api/user_auth/Users';
import { apiErrorHandler } from '@/appUtils/apiErrorHandler';
import { goToHomePage } from '@/appUtils/helperFunctions';
import { handlePendingActionsRedirection } from '@/appUtils/onboardingRedirectionLogics';
import ConfirmationModal from '@/components/auth/ConfirmationModal';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { getOnboardingStatus } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

const ConfirmationPage = () => {
  const translations = useTranslations('auth.enterprise.pendingActions');
  const translationsAPIErrors = useTranslations('auth.apiErrorsOnboarding');
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const getOnboardingStatusMutation = useMutation({
    mutationKey: [userAuth.getOnboardingStatus.endpointKey, enterpriseId],
    mutationFn: getOnboardingStatus,
    onSuccess: async (data) => {
      toast.success(translations('toast.success'));

      const {
        enterpriseId,
        type,
        companyDetails,
        gstData,
        isEnterprisePanVerified,
        isGstVerified,
        isUdyamVerified,
        isCinVerified,
        isDirector,
        isDirectorInviteSent,
        invitationId,
        isEnterpriseOnboardingComplete,
      } = data.data.data;

      LocalStorageService.set('enterprise_Id', enterpriseId);
      LocalStorageService.set('type', type);

      await handlePendingActionsRedirection({
        isEnterpriseOnboardingComplete,
        isGstVerified,
        isEnterprisePanVerified,
        isUdyamVerified,
        isCinVerified,
        isDirector,
        isDirectorInviteSent,
        invitationId,
        companyDetails,
        gstData,
        type,
        router,
      });
    },
    onError: (error) => {
      const customError = apiErrorHandler(error);
      toast.error(translationsAPIErrors(customError));
    },
  });

  const handleResumeOnboardEnterprise = (e) => {
    e.preventDefault();

    getOnboardingStatusMutation.mutate({ enterpriseId });
  };

  const handleSkip = () => {
    router.push(goToHomePage());
  };

  return (
    <div className="flex h-full items-center justify-center">
      <form
        onSubmit={handleResumeOnboardEnterprise}
        className="flex min-h-[500px] w-[450px] flex-col items-center justify-center gap-10 rounded-md"
      >
        <div className="flex flex-col items-center gap-6">
          <h1 className="max-w-sm text-center text-2xl font-bold text-[#121212]">
            {translations('heading')}
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            {translations('description')}
          </p>
        </div>

        <div className="flex w-full flex-col gap-6">
          <Button
            type="submit"
            className="w-full"
            size="sm"
            disabled={getOnboardingStatusMutation.isPending}
          >
            {getOnboardingStatusMutation.isPending ? (
              <Loading />
            ) : (
              translations('resumeButton')
            )}
          </Button>

          <ConfirmationModal onProceed={handleSkip}>
            <span className="flex w-full cursor-pointer items-center justify-center text-sm font-semibold text-[#121212] hover:underline">
              {translations('skipText')}
            </span>
          </ConfirmationModal>
        </div>
      </form>
    </div>
  );
};

export default ConfirmationPage;
