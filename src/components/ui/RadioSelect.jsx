import React from 'react';

const RadioSelect = ({ value, handleChange, option }) => {
  return (
    <div>
      {/* Hidden radio input with label */}
      <input
        type="radio"
        id={option}
        name="options"
        value={value}
        onChange={() => handleChange(value)}
        className="hidden"
      />
      <label
        htmlFor={option}
        className="cursor-pointer rounded-md border border-gray-600 bg-gray-100 p-2 text-slate-700 hover:bg-primary hover:text-white"
      >
        {option}
      </label>
    </div>
  );
};

export default RadioSelect;
