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
      padding: '2px',
      fontSize: '14px',
      maxHeight: '150px',
      overflowY: 'auto',

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
