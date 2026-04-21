import { render, screen, userEvent } from '@/tests/test-utils';
import RadioSelect from '@/components/ui/RadioSelect';

describe('RadioSelect Component', () => {
  const mockHandleChange = vi.fn();
  const value = 'option1';
  const optionLabel = 'Option 1';

  beforeEach(() => {
    mockHandleChange.mockClear();
    render(<RadioSelect value={value} handleChange={mockHandleChange} option={optionLabel} checkBoxName="options" />);
  });

  it('renders the hidden radio input', () => {
    const radioInput = screen.getByRole('radio');
    expect(radioInput).toBeInTheDocument();
    expect(radioInput).toHaveClass('hidden');
  });

  it('renders the label with correct text', () => {
    const label = screen.getByText(optionLabel);
    expect(label).toBeInTheDocument();
  });

  it('renders the hidden radio input with correct attributes', () => {
    const radioInput = screen.getByRole('radio');
    expect(radioInput).toHaveAttribute('id', optionLabel);
    expect(radioInput).toHaveAttribute('name', 'options');
  });

  it('calls handleChange with the correct value when radio input is changed', async () => {
    const radioInput = screen.getByRole('radio');
    await userEvent.click(radioInput);
    expect(mockHandleChange).toHaveBeenCalledWith(value);
    expect(mockHandleChange).toHaveBeenCalledTimes(1);
  });

  it('calls handleChange with the correct value when label is clicked', async () => {
    // The label is associated with the radio via id/for
    const label = screen.getByText(optionLabel);
    await userEvent.click(label);
    expect(mockHandleChange).toHaveBeenCalledWith(value);
    expect(mockHandleChange).toHaveBeenCalledTimes(1);
  });

  it('associates the label with the correct radio input', () => {
    const radioInput = screen.getByRole('radio');
    const label = screen.getByText(optionLabel);
    // In React, 'for' becomes 'htmlFor', which renders as 'for' in DOM
    expect(label).toHaveAttribute('for', radioInput.id);
  });
});
