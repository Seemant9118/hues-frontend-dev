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
export const getStylesForSelectComponent = () => ({
  control: (base, state) => ({
    ...base,
    borderRadius: '10px',
    borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
    '&:hover': { borderColor: '#3b82f6' },
    fontSize: '0.875rem',
    minHeight: '40px',
    paddingLeft: '4px',
  }),
  valueContainer: (base) => ({
    ...base,
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    paddingLeft: '8px',
    gap: '6px',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#f3f4f6', // Tailwind gray-100
    borderRadius: '9999px',
    padding: '2px 8px',
    maxWidth: '140px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#111827', // Tailwind gray-900
    fontSize: '0.75rem',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#6b7280',
    ':hover': {
      backgroundColor: '#ef4444',
      color: 'white',
    },
  }),
  indicatorsContainer: (base) => ({
    ...base,
    paddingRight: '8px',
  }),
});

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
