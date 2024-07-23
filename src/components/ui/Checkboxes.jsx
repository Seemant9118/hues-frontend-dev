import React from 'react';
import { Input } from './input';

const Checkboxes = ({
  checked,
  checkBoxName,
  value,
  handleChange,
  option,
  disabled,
}) => {
  return (
    <div className="relative">
      <Input
        checked={checked}
        type="checkbox"
        id={option}
        name={checkBoxName}
        disabled={disabled}
        value={value}
        onChange={() => handleChange(value)}
        className={`${checked ? 'absolute right-0 top-0 w-4' : 'hidden'}`}
      />
      <label
        htmlFor={option}
        className={`rounded-md border border-gray-600 bg-gray-100 p-2 text-slate-700 hover:bg-primary hover:text-white ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {option}
      </label>
    </div>
  );
};

export default Checkboxes;
