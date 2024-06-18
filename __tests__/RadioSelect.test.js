import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RadioSelect from '@/components/ui/RadioSelect';

describe('RadioSelect Component', () => {
  const mockHandleChange = jest.fn();
  const value = 'option1';
  const option = 'Option 1';

  beforeEach(() => {
    mockHandleChange.mockClear();
    render(<RadioSelect value={value} handleChange={mockHandleChange} option={option} />);
  });

  it('renders the hidden radio input', () => {
    const radioInput = screen.getByRole('radio');
    expect(radioInput).toBeInTheDocument();
    expect(radioInput).toHaveClass('hidden');
  });

  it('renders the label with correct text', () => {
    const label = screen.getByText(option);
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('cursor-pointer rounded-md border border-gray-600 bg-gray-100 p-2 text-slate-700 hover:bg-primary hover:text-white');
  });

  it('renders the hidden radio input with correct attributes', () => {
    const radioInput = screen.getByRole('radio');
    expect(radioInput).toHaveAttribute('id', option);
    expect(radioInput).toHaveAttribute('name', 'options');
  });

  it('calls handleChange with the correct value when radio input is changed', async () => {
    const user= userEvent.setup();
    const radioInput = screen.getByRole('radio');
    await user.click(radioInput);
    expect(mockHandleChange).toHaveBeenCalledWith(value);
    expect(mockHandleChange).toHaveBeenCalledTimes(1);

  });

  it('calls handleChange with the correct value when label is clicked', async () => {
    const user= userEvent.setup();
    const label = screen.getByLabelText(option);
    await user.click(label);
    expect(mockHandleChange).toHaveBeenCalledWith(value);
    expect(mockHandleChange).toHaveBeenCalledTimes(1);
  });

  it('associates the label with the correct radio input', () => {
    const radioInput = screen.getByRole('radio');
    const label = screen.getByText(option);
    expect(label).toHaveAttribute('for', radioInput.id);
  });

  it('does not call handleChange if the radio input is already selected', async () => {
    const user= userEvent.setup();
    const radioInput = screen.getByRole('radio');
    await user.click(radioInput); // First click to select it
    expect(mockHandleChange).toHaveBeenCalled();
    mockHandleChange.mockClear(); // Clear previous calls
    await user.click(radioInput); // Second click to try to deselect
    expect(mockHandleChange).not.toHaveBeenCalled();
  });
});
