// give first letter & last letter of name
export const getInitialsNames = (name) => {
  if (!name) return 'PR'; // Default initials
  const words = name.split(' ');
  const initials =
    words[0].charAt(0).toUpperCase() + (words[1].charAt(0).toUpperCase() || '');
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
export const getStylesForCreatableSelectComponent = () => {
  return {
    control: (base, state) => ({
      ...base,
      border: state.isFocused
        ? '2.5px solid #298AFAFF' // Bold border when focused (color: blue)
        : '1px solid #E2E8F0', // Default border
      borderRadius: '9px',
      boxShadow: 'none', // Removes focus outline shadow
      height: '40px',
      width: '20rem',
      transition: 'border-color 0.2s', // Smooth transition for focus
    }),
    menu: (base) => ({
      ...base,
      width: '20rem',
      borderRadius: '9px',
      zIndex: 10,
    }),
    menuList: (base) => ({
      ...base,
      padding: '2px',
      fontSize: '12px',
      maxHeight: '200px',
      overflowY: 'auto',
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
