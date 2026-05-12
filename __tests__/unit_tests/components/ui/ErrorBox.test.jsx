import { render, screen } from '@/tests/test-utils';
import ErrorBox from '@/components/ui/ErrorBox';

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
    // Checking individual classes as per original test
    expect(errorElement).toHaveClass('text-xs');
    expect(errorElement).toHaveClass('font-semibold');
    expect(errorElement).toHaveClass('text-red-600');
  });
});
