import { getColorFromName, getInitialsNames } from '@/appUtils/helperFunctions';
import React from 'react';

const Avatar = ({ name = '' }) => {
  const bgColor = getColorFromName(name);
  return (
    <div
      className={`${bgColor} flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white`}
    >
      {getInitialsNames(name)}
    </div>
  );
};

export default Avatar;
