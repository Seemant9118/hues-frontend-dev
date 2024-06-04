import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  test('renders input with correct type-email', () => {
    render(<Input type="email" />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveAttribute('type', 'email');
  });

  test('renders input with correct type-number', () => {
    render(<Input type="number" />);
    const inputElement = screen.getByRole('spinbutton'); // 'spinbutton' role is used for input type='number'
    expect(inputElement).toHaveAttribute('type', 'number');
  });

  test('renders input with correct placeholder', () => {
    render(<Input placeholder="Enter text" />);
    const inputElement = screen.getByPlaceholderText('Enter text');
    expect(inputElement).toBeInTheDocument();
  });

  test('renders input as disabled', () => {
    render(<Input disabled />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeDisabled();
  });

  test('renders input with correct class names', () => {
    render(<Input className="custom-class" />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveClass('custom-class');
    expect(inputElement).toHaveClass('w-full');
  });

  test('calls onChange handler when value changes', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    await user.type(input, 'new value');

    expect(handleChange).toHaveBeenCalledTimes(9);
    expect(handleChange).toHaveBeenCalledWith(expect.any(Object));
    expect(input.value).toBe('new value');
  });

  it('handles required attribute', () => {
    render(<Input required />);
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });
});
