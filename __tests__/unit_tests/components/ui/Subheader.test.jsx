import { render, screen } from '@/tests/test-utils';
import SubHeader from '@/components/ui/Sub-header';

describe('SubHeader component', () => {
  test('displays the correct name', () => {
    const headerText = 'Test Header';
    render(<SubHeader name={headerText} />);
    const headerElement = screen.getByText(headerText);
    expect(headerElement).toBeInTheDocument();
    // Test for combined classes
    expect(headerElement).toHaveClass('font-bold');
    expect(headerElement).toHaveClass('text-xl');
  });

  test('applies the className prop correctly', () => {
    render(<SubHeader name="Test Header" className="custom-class" />);
    // Finding the container div
    const subHeader = screen.getByText('Test Header').closest('div');
    expect(subHeader).toHaveClass('custom-class');
  });

  test('renders children correctly', () => {
    render(
      <SubHeader name="Test Header">
        <button type="button">Click Me</button>
      </SubHeader>,
    );
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
});
