'use client';

import React from 'react';
import DatePicker, { CalendarContainer } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function DatePickers({
  selected,
  onChange,
  dateFormat,
  popperPlacement,
  placeholderText,
  isExpiryField = false,
}) {
  // const [startDate, setStartDate] = useState('');
  const currentYear = new Date().getFullYear();
  const maxYear = isExpiryField ? currentYear + 50 : currentYear;

  const years = Array.from({ length: maxYear - 1950 + 1 }, (_, i) => 1950 + i);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const renderCustomHeader = ({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => (
    <div style={{ margin: 10, display: 'flex', justifyContent: 'center' }}>
      <button
        type="button"
        className="p-1 text-lg font-bold"
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
      >
        {'<'}
      </button>
      <select
        className="m-1 rounded-md border focus:outline-none"
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
        className="m-1 rounded-md border focus:outline-none"
        value={months[date.getMonth()]}
        onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
      >
        {months.map((option) => (
          <option key={option} value={option} className="text-sm">
            {option}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="p-1 text-lg font-bold"
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
      >
        {'>'}
      </button>
    </div>
  );

  const customCalendar = ({ className, children }) => {
    return (
      <div className="m-2 shadow-md">
        <CalendarContainer className={className}>
          <div style={{ position: 'relative' }}>{children}</div>
        </CalendarContainer>
      </div>
    );
  };

  return (
    <DatePicker
      className="absolute top-1/2 w-[430px] -translate-y-2/3 cursor-pointer bg-transparent focus:outline-none"
      placeholderText={placeholderText || 'DD/MM/YYYY'}
      dateFormat={dateFormat}
      popperPlacement={popperPlacement}
      renderCustomHeader={renderCustomHeader}
      selected={selected}
      onChange={onChange}
      calendarContainer={customCalendar}
    />
  );
}
