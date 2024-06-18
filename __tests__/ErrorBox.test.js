import ErrorBox from '@/components/ui/ErrorBox';
import { render, screen } from '@testing-library/react';

describe('ErrorBox', () => {
  test('renders error message correctly', () => {
    const errorMessage = 'This is an error message';
    render(<ErrorBox msg={errorMessage} />);

    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
  });

  test('applies correct styles', () => {
    const errorMessage = 'Another error message';
    render(<ErrorBox msg={errorMessage} />);

    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toHaveClass(
      'text-xs',
      'font-semibold',
      'text-red-600',
    );
  });
});
