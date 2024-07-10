import React from 'react';
import { Input } from './input';

const RadioSelect = ({
  checked,
  checkBoxName,
  value,
  handleChange,
  option,
  disabled,
}) => {
  return (
    <div>
      {/* Hidden radio input with label */}
      <Input
        checked={checked}
        type="radio"
        id={option}
        name={checkBoxName}
        disabled={disabled}
        value={value}
        onChange={() => handleChange(value)}
        className="hidden"
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

export default RadioSelect;
