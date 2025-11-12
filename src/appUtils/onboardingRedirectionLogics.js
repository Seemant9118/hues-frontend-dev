import { LocalStorageService } from '@/lib/utils';
import { redirectToHomeWithFcm } from './helperFunctions';

export async function handleOtpRedirection({
  isOnboardingComplete,
  isPanVerified,
  isAadhaarVerified,
  isEnterprisestartedOnboarding,
  isEnterpriseOnboardingComplete,
  islogInWithInviteLink,
  isUserHaveValidDirectorInvites,
  redirectedUrl,
  router,
}) {
  if (isOnboardingComplete) {
    if (islogInWithInviteLink) {
      const type = islogInWithInviteLink?.data?.invitation?.invitationType;

      if (type === 'CLIENT' || type === 'VENDOR') {
        return router.push('/login/enterprise/select_enterprise_type');
      } else if (type === 'DIRECTOR' && isUserHaveValidDirectorInvites) {
        return router.push('/login/confirmation_invite_as_director');
      } else {
        return router.push('/login/confirmation_invite_as_associate');
      }
    } else if (
      isEnterprisestartedOnboarding &&
      isEnterpriseOnboardingComplete
    ) {
      LocalStorageService.remove('redirectUrl');
      return redirectToHomeWithFcm(router, redirectedUrl);
    } else if (
      isEnterprisestartedOnboarding &&
      !isEnterpriseOnboardingComplete
    ) {
      return router.push('/login/enterprise/pending-actions');
    } else {
      return router.push('/login/user/confirmation');
    }
  } else if (isPanVerified && isAadhaarVerified) {
    return router.push('/login/user/confirmation');
  } else if (isPanVerified && !isAadhaarVerified) {
    return router.push('/login/user/aadhar-verification');
  } else {
    return router.push('/login/user/pan-verification');
  }
}

export async function handlePendingActionsRedirection({
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
}) {
  if (!isEnterpriseOnboardingComplete) {
    LocalStorageService.set('companyData', companyDetails);
  }

  if (!isGstVerified) {
    LocalStorageService.set('gst', gstData?.gstinResList);
  }

  if (!isEnterprisePanVerified) {
    router.push('/login/enterprise/select_enterprise_type');
    return;
  }

  // Proprietorship/Individual flow
  if (type === 'proprietorship' || type === 'individual') {
    if (isGstVerified && isUdyamVerified && isEnterpriseOnboardingComplete) {
      router.push('/login/enterprise/enterprise-onboarded-success');
      return;
    }

    if (isGstVerified && isUdyamVerified && !isEnterpriseOnboardingComplete) {
      router.push('/login/enterprise/enterprise-verification-details');
      return;
    }

    if (isGstVerified && !isUdyamVerified && !isEnterpriseOnboardingComplete) {
      router.push('/login/enterprise/udyam-verify');
      return;
    }

    if (!isGstVerified) {
      router.push('/login/enterprise/gst-verify');
      return;
    }
  }

  // Non-proprietorship / Company flow
  if (isEnterprisePanVerified && isCinVerified) {
    if (isDirector && isGstVerified && isUdyamVerified) {
      if (isEnterpriseOnboardingComplete) {
        router.push('/login/enterprise/enterprise-onboarded-success');
      } else {
        router.push('/login/enterprise/enterprise-verification-details');
      }
      return;
    }

    if (
      isDirector &&
      isGstVerified &&
      !isUdyamVerified &&
      !isEnterpriseOnboardingComplete
    ) {
      router.push('/login/enterprise/udyam-verify');
      return;
    }

    if (
      isDirector &&
      !isGstVerified &&
      !isUdyamVerified &&
      !isEnterpriseOnboardingComplete
    ) {
      router.push('/login/enterprise/gst-verify');
      return;
    }

    if (
      !isDirector &&
      isDirectorInviteSent &&
      !isEnterpriseOnboardingComplete
    ) {
      LocalStorageService.set('invitationId', invitationId);
      router.push('/login/enterprise/invite-director?step=2');
      return;
    }

    if (
      !isDirector &&
      !isDirectorInviteSent &&
      !isEnterpriseOnboardingComplete
    ) {
      router.push('/login/enterprise/invite-director?step=1');
      return;
    }
  }

  if (isEnterprisePanVerified && !isCinVerified) {
    router.push('/login/enterprise/cin-verify');
  }
}
