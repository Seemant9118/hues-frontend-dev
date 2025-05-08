import { Calendar } from 'lucide-react';
import React, { useRef } from 'react';
import DatePicker, { CalendarContainer } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateRange = ({ dateRange, setDateRange }) => {
  const datepickerRef = useRef(null);
  const [startDate, endDate] = dateRange;

  const handleChange = (update) => {
    setDateRange(update);
  };

  const years = Array.from(
    { length: new Date().getFullYear() - 1949 },
    (_, i) => 1950 + i,
  );
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
    <div className="flex items-center justify-between border-b bg-white px-2 py-1">
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className="px-2 py-1 text-lg font-bold"
      >
        {'<'}
      </button>
      <div className="flex gap-2">
        <select
          className="rounded-md border px-2 py-1 text-sm focus:outline-none"
          value={date.getFullYear()}
          onChange={({ target: { value } }) => changeYear(Number(value))}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border px-2 py-1 text-sm focus:outline-none"
          value={months[date.getMonth()]}
          onChange={({ target: { value } }) =>
            changeMonth(months.indexOf(value))
          }
        >
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className="px-2 py-1 text-lg font-bold"
      >
        {'>'}
      </button>
    </div>
  );

  const customCalendar = ({ className, children }) => (
    <CalendarContainer className={className}>
      <div className="relative rounded-md bg-white p-2 shadow-md">
        {children}
      </div>
    </CalendarContainer>
  );

  return (
    <div className="flex w-full max-w-xs items-center gap-0.5 rounded-md border p-2">
      <button
        onClick={() => datepickerRef.current?.setOpen(true)}
        type="button"
      >
        <Calendar
          size={18}
          className="cursor-pointer text-gray-600 hover:text-black"
        />
      </button>
      <DatePicker
        ref={datepickerRef}
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={handleChange}
        isClearable
        placeholderText="From : Date - To : Date"
        className="w-[250px] rounded-md px-2 py-1 text-sm font-semibold focus:outline-none"
        popperClassName="z-20"
        renderCustomHeader={renderCustomHeader}
        calendarContainer={customCalendar}
        dateFormat="dd/MM/yyyy"
      />
    </div>
  );
};

export default DateRange;
