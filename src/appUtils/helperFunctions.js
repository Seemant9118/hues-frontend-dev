/* eslint-disable no-console */

import { LocalStorageService, SessionStorageService } from '@/lib/utils';
import moment from 'moment';

export const safeJsonParse = (value, fallback = []) => {
  if (!value) return fallback;

  // If already parsed
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch (err) {
    console.error('Invalid JSON in attributes:', value);
    return fallback;
  }
};

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
export const formattedAmount = (amount, fallback = '-') => {
  const value = Number(amount);

  if (!Number(value)) return fallback;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
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

export const splitAddressAccordingToEWayBill = (address) => {
  if (!address) return { addr1: '', addr2: '' };

  const clean = address.trim();

  const addr1 = clean.substring(0, 30);
  const addr2 = clean.substring(30, 60); // next 30 chars

  return { addr1, addr2 };
};

// Convert DD/MM/YYYY → YYYY-MM-DD
export const toInputDate = (dateStr) => {
  if (!dateStr) return '';
  const [dd, mm, yyyy] = dateStr.split('/');
  return `${yyyy}-${mm}-${dd}`;
};

// Convert YYYY-MM-DD → DD/MM/YYYY
export const toDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const [yyyy, mm, dd] = dateStr.split('-');
  return `${dd}/${mm}/${yyyy}`;
};

export const getValueForMovementType = (movementType) => {
  switch (movementType) {
    case 'Internal logistics (stock transfer / repositioning)':
      return 'Dispatch';
    case 'Supply for sale (final delivery to customer)':
      return 'GRN';
    default:
      return '-';
  }
};

export const getQCDefectStatuses = (data) => {
  const {
    isShortQuantity = false,
    isUnsatisfactory = false,
    isShortDelivery = false,
  } = data || {};

  return [
    isShortDelivery && 'SHORT_QUANTITY',
    isShortQuantity && 'SHORT_QUANTITY',
    isUnsatisfactory && 'UNSATISFACTORY',
  ].filter(Boolean);
};

export const formattedMonthDate = (period) => {
  if (!period) return '-';

  const formattedPeriod = moment(period, 'MMYYYY', true).isValid()
    ? moment(period, 'MMYYYY').format('MMMM YYYY')
    : '-';

  return formattedPeriod;
};

export const getCurrentFinancialYearPeriods = (date = new Date()) => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const currentMonth = date.getMonth(); // 0 = Jan
  const currentYear = date.getFullYear();

  // FY Start year logic
  // Apr (3) to Dec (11) => FY starts same year
  // Jan (0) to Mar (2)  => FY starts previous year
  const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;

  const periods = [];

  // Start from April of FY start year
  const startMonth = 3; // April
  const endMonth = currentMonth;
  const endYear = currentYear;

  // If current month is Jan/Feb/Mar, end month is that month (same year)
  // If current month is Apr-Dec, end month is currentMonth (same year)
  // (works with both cases)

  let m = startMonth;
  let y = fyStartYear;

  while (y < endYear || (y === endYear && m <= endMonth)) {
    const monthNumber = String(m + 1).padStart(2, '0'); // 01 to 12
    const value = `${monthNumber}${y}`; // MMYYYY

    periods.push({
      label: `${months[m]} ${y}`,
      value,
    });

    m++;

    // Move to next year after Dec
    if (m > 11) {
      m = 0;
      y++;
    }
  }

  return periods;
};

export const maskPanNumber = (pan = '') => {
  if (!pan) return '-';

  const value = String(pan).trim().toUpperCase();

  // PAN format is usually 10 chars: AAAAA9999A
  if (value.length < 6) return value; // fallback for invalid short input

  const first3 = value.slice(0, 3);
  const last1 = value.slice(-1);

  const maskedMiddle = '*'.repeat(value.length - 4); // hide remaining middle chars
  return `${first3}${maskedMiddle}${last1}`;
};
