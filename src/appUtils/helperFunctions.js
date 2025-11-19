/* eslint-disable no-console */

import { LocalStorageService, SessionStorageService } from '@/lib/utils';

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
export function capitalize(str = '') {
  return str
    ?.split(' ')
    ?.filter(Boolean)
    ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    ?.join(' ');
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

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN') : '--';

// avatar color from name
const avatarColors = [
  'bg-blue-600',
  'bg-red-600',
  'bg-green-600',
  'bg-purple-600',
  'bg-indigo-600',
  'bg-yellow-600',
];
export const getColorFromName = (name) => {
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return avatarColors[sum % avatarColors.length];
};

export const roleColors = [
  'bg-blue-500 text-white',
  'bg-yellow-500 text-white',
  'bg-green-500 text-white',
  'bg-red-500 text-white',
  'bg-cyan-500 text-white',
  'bg-gray-500 text-white',
];

export function saveDraftToSession({ key, data }) {
  SessionStorageService.set(key, data);
}
