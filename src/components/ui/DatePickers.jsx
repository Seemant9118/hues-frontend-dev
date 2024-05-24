"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DatePickers({
  selected,
  onChange,
  dateFormat,
  popperPlacement,
}) {
  // const [startDate, setStartDate] = useState('');
  const years = Array.from(
    { length: new Date().getFullYear() - 1949 },
    (_, i) => 1950 + i
  );
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <DatePicker
      className="w-[360px] focus:outline-none absolute top-1/2 -translate-y-2/3 z-20 bg-transparent cursor-pointer"
      placeholderText="DD/MM/YYYY"
      dateFormat={dateFormat}
      popperPlacement={popperPlacement}
      renderCustomHeader={({
        date,
        changeYear,
        changeMonth,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <div style={{ margin: 10, display: "flex", justifyContent: "center" }}>
          <button
            className="text-lg font-bold p-1"
            onClick={decreaseMonth}
            disabled={prevMonthButtonDisabled}
          >
            {"<"}
          </button>
          <select
            className="border rounded-md m-1 focus:outline-none"
            value={date.getFullYear()}
            onChange={({ target: { value } }) => changeYear(Number(value))}
          >
            {years.map((option) => (
              <option key={option} value={option} className="text-sm">
                {option}
              </option>
            ))}
          </select>

          <select
            className="border rounded-md m-1 focus:outline-none"
            value={months[date.getMonth()]}
            onChange={({ target: { value } }) =>
              changeMonth(months.indexOf(value))
            }
          >
            {months.map((option) => (
              <option key={option} value={option} className="text-sm">
                {option}
              </option>
            ))}
          </select>

          <button
            className="text-lg font-bold p-1"
            onClick={increaseMonth}
            disabled={nextMonthButtonDisabled}
          >
            {">"}
          </button>
        </div>
      )}
      selected={selected}
      onChange={onChange}
    />
  );
}
