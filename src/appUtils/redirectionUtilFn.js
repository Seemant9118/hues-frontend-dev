import { LocalStorageService } from '@/lib/utils';
import { initializeFcmToken } from '@/services/FCM_Services/RegisterFCMTokenServices';
import { parseJwt } from './helperFunctions';

export const goToHomePage = () => {
  const token = LocalStorageService.get('token');
  const payload = token ? parseJwt(token) : null;

  if (payload?.roles?.includes('ADMIN')) {
    return '/dashboard/admin/reports';
  }
  return '/dashboard';
};

export const redirectToHomeWithFcm = async (router, redirectPath) => {
  try {
    const accessToken = LocalStorageService.get('token');
    const payload = accessToken ? parseJwt(accessToken) : null;

    // ✅ Register FCM token if logged in
    if (payload?.userId) {
      await initializeFcmToken();
    }

    // ✅ Determine the path — fallback to home if not provided
    const targetPath = redirectPath || goToHomePage();

    // ✅ Navigate via router (no full page reload)
    router.push(targetPath);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('🚨 FCM init + redirect failed:', err);

    // Still navigate even if FCM fails
    router.push(redirectPath || goToHomePage());
  }
};
