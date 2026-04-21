import { render, screen, fireEvent } from '@/tests/test-utils';
import DatePickers from '@/components/ui/DatePickers';

describe('DatePickers', () => {
  const mockOnChange = vi.fn();
  const selectedDate = new Date('2023-06-15');
  const dateFormat = 'dd/MM/yyyy';
  const popperPlacement = 'bottom';

  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(yearSelect).toHaveValue('2022');

    // Test changing the month
    const monthSelect = screen.getByDisplayValue('June');
    fireEvent.change(monthSelect, { target: { value: 'July' } });
    expect(monthSelect).toHaveValue('July');

    // Test decreasing the month
    const decreaseMonthButton = screen.getByText('<');
    fireEvent.click(decreaseMonthButton);
    // After decrease July -> June
    expect(screen.getByDisplayValue('June')).toBeInTheDocument();

    // Test increasing the month
    const increaseMonthButton = screen.getByText('>');
    fireEvent.click(increaseMonthButton);
    // After increase June -> July
    expect(screen.getByDisplayValue('July')).toBeInTheDocument();
  });
});
