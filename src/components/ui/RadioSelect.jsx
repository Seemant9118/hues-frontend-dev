import React from "react";

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
        className="cursor-pointer p-2 border border-gray-600 rounded-md bg-gray-100 text-slate-700 hover:text-white hover:bg-primary"
      >
        {option}
      </label>
    </div>
  );
};

export default RadioSelect;
