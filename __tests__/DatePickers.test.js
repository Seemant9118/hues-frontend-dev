import DatePickers from '@/components/ui/DatePickers';
import { render, screen, fireEvent } from '@testing-library/react';

describe('DatePickers', () => {
  const mockOnChange = jest.fn();
  const selectedDate = new Date('2023-06-15');
  const dateFormat = 'dd/MM/yyyy';
  const popperPlacement = 'bottom';

  beforeEach(() => {
    render(
      <DatePickers
        selected={selectedDate}
        onChange={mockOnChange}
        dateFormat={dateFormat}
        popperPlacement={popperPlacement}
      />,
    );
  });

  test('renders the DatePickers component with placeholder text', () => {
    const inputElement = screen.getByPlaceholderText('DD/MM/YYYY');
    expect(inputElement).toBeInTheDocument();
  });

  test('calls onChange handler when the date is changed', () => {
    const inputElement = screen.getByPlaceholderText('DD/MM/YYYY');
    fireEvent.change(inputElement, { target: { value: '20/06/2023' } });
    expect(mockOnChange).toHaveBeenCalled();
  });

  test('renders custom header and allows year and month changes', () => {
    // Open the date picker to access the custom header
    const inputElement = screen.getByPlaceholderText('DD/MM/YYYY');
    fireEvent.click(inputElement);

    // Test changing the year
    const yearSelect = screen.getByDisplayValue('2023');
    fireEvent.change(yearSelect, { target: { value: '2022' } });
    expect(yearSelect.value).toBe('2022');

    // Test changing the month
    const monthSelect = screen.getByDisplayValue('June');
    fireEvent.change(monthSelect, { target: { value: 'July' } });
    expect(monthSelect.value).toBe('July');

    // Test decreasing the month
    const decreaseMonthButton = screen.getByText('<');
    fireEvent.click(decreaseMonthButton);
    const newMonthSelect = screen.getByDisplayValue('June');
    expect(newMonthSelect).toBeInTheDocument();

    // Test increasing the month
    const increaseMonthButton = screen.getByText('>');
    fireEvent.click(increaseMonthButton);
    const newerMonthSelect = screen.getByDisplayValue('July');
    expect(newerMonthSelect).toBeInTheDocument();
  });
});
