'use client';

import { userAuth } from '@/api/user_auth/Users';
import ConfirmationModal from '@/components/auth/ConfirmationModal';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { getOnboardingStatus } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

const ConfirmationPage = () => {
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const getOnboardingStatusMutation = useMutation({
    mutationKey: [userAuth.getOnboardingStatus.endpointKey, enterpriseId],
    mutationFn: getOnboardingStatus,
    onSuccess: (data) => {
      toast.success('Onboarding Resumes');

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
      if (!isEnterpriseOnboardingComplete) {
        LocalStorageService.set('companyData', companyDetails);
      }
      if (!isGstVerified) {
        LocalStorageService.set('gst', gstData?.gstinResList);
      }

      if (!isEnterprisePanVerified) {
        router.push(`/login/enterprise/select_enterprise_type`);
      }
      // pending actions for properitorship
      if (
        isEnterprisePanVerified &&
        (type === 'proprietorship' || type === 'individual')
      ) {
        if (
          isGstVerified &&
          isUdyamVerified &&
          isEnterpriseOnboardingComplete
        ) {
          router.push('/login/enterprise/enterprise-onboarded-success');
        } else if (
          isGstVerified &&
          isUdyamVerified &&
          !isEnterpriseOnboardingComplete
        ) {
          router.push('/login/enterprise/enterprise-verification-details');
        } else if (
          isGstVerified &&
          !isUdyamVerified &&
          !isEnterpriseOnboardingComplete
        ) {
          router.push('/login/enterprise/udyam-verify');
        } else if (!isGstVerified) {
          router.push('/login/enterprise/gst-verify');
        }
      }
      // pending actions for Non-properitorship/Company
      else if (
        isEnterprisePanVerified &&
        isCinVerified &&
        isDirector &&
        isGstVerified &&
        isUdyamVerified &&
        isEnterpriseOnboardingComplete
      ) {
        router.push('/login/enterprise/enterprise-onboarded-success');
      } else if (
        isEnterprisePanVerified &&
        isCinVerified &&
        isDirector &&
        isGstVerified &&
        isUdyamVerified &&
        !isEnterpriseOnboardingComplete
      ) {
        router.push('/login/enterprise/enterprise-verification-details');
      } else if (
        isEnterprisePanVerified &&
        isCinVerified &&
        isDirector &&
        isGstVerified &&
        !isUdyamVerified &&
        !isEnterpriseOnboardingComplete
      ) {
        router.push('/login/enterprise/udyam-verify');
      } else if (
        isEnterprisePanVerified &&
        isCinVerified &&
        isDirector &&
        !isGstVerified &&
        !isUdyamVerified &&
        !isEnterpriseOnboardingComplete
      ) {
        router.push('/login/enterprise/gst-verify');
      } else if (
        isEnterprisePanVerified &&
        isCinVerified &&
        !isDirector &&
        isDirectorInviteSent &&
        !isEnterpriseOnboardingComplete
      ) {
        LocalStorageService.set('invitationId', invitationId);
        router.push('/login/enterprise/invite-director?step=2');
      } else if (
        isEnterprisePanVerified &&
        isCinVerified &&
        !isDirector &&
        !isDirectorInviteSent &&
        !isEnterpriseOnboardingComplete
      ) {
        router.push('/login/enterprise/invite-director?step=1');
      } else if (isEnterprisePanVerified && !isCinVerified) {
        router.push('/login/enterprise/cin-verify');
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleResumeOnboardEnterprise = (e) => {
    e.preventDefault();

    getOnboardingStatusMutation.mutate({ enterpriseId });
  };

  const handleSkip = () => {
    router.push('/');
  };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <form
        onSubmit={handleResumeOnboardEnterprise}
        className="flex min-h-[400px] w-[450px] flex-col items-center justify-start gap-10 rounded-md"
      >
        <div className="flex flex-col items-center gap-6">
          <h1 className="max-w-sm text-center text-2xl font-bold text-[#121212]">
            Enterprise Onboarding Incomplete
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            Complete pending actions to able to access all the features of the
            platform and start using it
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
              'Resume Onboarding'
            )}
          </Button>

          <ConfirmationModal onProceed={handleSkip}>
            <span className="flex w-full cursor-pointer items-center justify-center text-sm font-semibold text-[#121212] hover:underline">
              Skip for Now
            </span>
          </ConfirmationModal>
        </div>
      </form>
    </div>
  );
};

export default ConfirmationPage;
