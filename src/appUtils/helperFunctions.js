/* eslint-disable no-console */

import { LocalStorageService, SessionStorageService } from '@/lib/utils';
import { deregisterFcmToken } from '@/services/FCM_Services/DeregisterFCMTokenServices';
import { initializeFcmToken } from '@/services/FCM_Services/RegisterFCMTokenServices';

// give first letter & last letter of name
export const getInitialsNames = (name) => {
  if (!name) return 'PR'; // Default initials
  const words = name.split(' ');
  const initials =
    (words[0] ? words[0].charAt(0).toUpperCase() : '') +
    (words[1] ? words[1].charAt(0).toUpperCase() : '');
  return initials || 'PR'; // Fallback if no valid initials
};

// give random bgColors
export const getRandomBgColor = () => {
  const colors = [
    'bg-purple-600',
    'bg-blue-600',
    'bg-green-600',
    'bg-yellow-600',
    'bg-pink-600',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const getFilenameFromUrl = (url) => {
  if (!url) return 'file';
  const path = url.split('?')[0]; // Remove query params
  const filename = path.substring(path.lastIndexOf('/') + 1);
  return filename || 'file';
};

// style for react-select component
export const getStylesForSelectComponent = () => {
  return {
    control: (base, state) => ({
      ...base,
      border: state.isFocused
        ? '2.5px solid #298AFAFF' // Bold border when focused (color: blue)
        : '1px solid #E2E8F0', // Default border
      borderRadius: '9px',
      boxShadow: 'none', // Removes focus outline shadow
      height: '40px',
      transition: 'border-color 0.2s', // Smooth transition for focus
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '9px',
      zIndex: 10,
    }),
    menuList: (base) => ({
      ...base,
      // padding: '2px',
      fontSize: '14px',
      maxHeight: '150px',
      overflowY: 'auto',
      borderRadius: '9px',

      // Custom scrollbar styles
      '&::-webkit-scrollbar': {
        width: '0.5rem', // Scrollbar width
      },
      '&::-webkit-scrollbar-track': {
        background: 'white', // Track background
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: '0.5rem', // Rounded scrollbar thumb
        background: '#dadce0', // Thumb color
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: '#c6c7c9', // Thumb color on hover
      },

      // Cross-browser support for Firefox
      scrollbarWidth: 'thin',
      scrollbarColor: '#dadce0 white', // Thumb and track colors for Firefox
    }),
  };
};

// formatAmount in Indian Rupee currency
export const formattedAmount = (amount) => {
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
  return formattedAmount;
};

// fn for capitalization
export function capitalize(str) {
  if (str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  return '';
}

export function convertSnakeToTitleCase(input) {
  if (input) {
    return input
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return '-';
}

// debouncing fn
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// isGstApplicable
export const isGstApplicable = (isHaveGst) => {
  if (isHaveGst) return true;
  else return false;
};

// Utility function to handle empty strings and undefined values
export const formatValue = (value) => (value?.trim() ? value : '-');

// to get data from JWT
export const parseJwt = (token) => {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );
    return JSON.parse(payload);
  } catch (error) {
    return null;
  }
};

export const getEnterpriseId = () => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const switchedEnterpriseId = LocalStorageService.get('switchedEnterpriseId');
  return switchedEnterpriseId || enterpriseId;
};

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

export const handleLogoutWithFcmDeregister = async (router) => {
  try {
    const accessToken = LocalStorageService.get('token');
    const payload = accessToken ? parseJwt(accessToken) : null;
    const fcmToken = LocalStorageService.get('fcm_web_token');

    // 🔹 Clear session immediately so logout is guaranteed
    LocalStorageService.clear();
    SessionStorageService.clear();

    // 🔹 Redirect user right away (non-blocking)
    router.push('/login');

    // 🔹 Fire and forget FCM deregistration (doesn’t block UI)
    if (payload?.userId && fcmToken) {
      deregisterFcmToken({ fcmToken, deviceType: 'web' })
        .then(() => {
          console.info('FCM token deregistered successfully.');
        })
        .catch((err) => {
          console.warn('Failed to deregister FCM token:', err);
        });
    }
  } catch (err) {
    console.error('Logout process failed:', err);
    router.push('/login');
  }
};
