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
        className={`rounded-sm border border-[#EDEEF2] p-2 text-[#A5ABBD] hover:font-semibold hover:text-black ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {option}
      </label>
    </div>
  );
};

export default RadioSelect;
