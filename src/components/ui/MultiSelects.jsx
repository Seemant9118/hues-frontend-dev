/* eslint-disable import/no-extraneous-dependencies */

'use client';

import Select from 'react-tailwindcss-select';

const MultiSelects = ({ placeholder, option, value, handleChange }) => {
  return (
    <Select
      placeholder={placeholder}
      primaryColor={'blue'}
      value={value}
      isMultiple={true}
      isSearchable={true}
      isClearable={true}
      onChange={handleChange}
      options={option}
    />
  );
};

export default MultiSelects;
