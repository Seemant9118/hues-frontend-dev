export const getInitialsNames = (name) => {
  if (!name) return 'PR'; // Default initials
  const words = name.split(' ');
  const initials =
    words[0].charAt(0).toUpperCase() + (words[1].charAt(0).toUpperCase() || '');
  return initials || 'PR'; // Fallback if no valid initials
};

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
