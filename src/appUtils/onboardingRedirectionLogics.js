import { LocalStorageService } from '@/lib/utils';

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
      return router.push(redirectedUrl || '/dashboard');
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
